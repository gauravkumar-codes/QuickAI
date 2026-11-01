import { sql } from '../config/db.js'
import { limitFor } from '../config/limits.js'
import { HttpError } from '../utils/HttpError.js'

const GLOBAL_USER = '__global__'
const today = () => new Date().toISOString().slice(0, 10)
const monthStart = () => `${new Date().toISOString().slice(0, 7)}-01`

// Atomic: the row only increases while it is still under the limit, so two requests at once cannot both slip through.
const reserve = async (userId, tool, day, max) => {
  const rows = await sql`insert into usage (user_id, day, tool, count) values (${userId}, ${day}::date, ${tool}, 1)
    on conflict (user_id, day, tool) do update set count = usage.count + 1 where usage.count < ${max}
    returning count`
  return rows.length > 0
}
const release = (userId, tool, day) =>
  sql`update usage set count = greatest(count - 1, 0) where user_id = ${userId} and day = ${day}::date and tool = ${tool}`

// Reserves a use, runs the work, and gives the use back if the work fails.
// `global` is an optional cap shared by ALL users: { key, max, period: 'day' | 'month' (default) }.
export const withQuota = async (req, tool, work, { global } = {}) => {
  const max = limitFor(tool, req.premium)
  const day = today()
  if (!(await reserve(req.userId, tool, day, max))) {
    throw new HttpError(429, `Daily limit reached (${max}/day). ${req.premium ? 'Try again tomorrow.' : 'Upgrade to Premium for more.'}`)
  }
  const globalDay = global?.period === 'day' ? today() : monthStart()
  let globalReserved = false
  try {
    if (global) {
      if (!(await reserve(GLOBAL_USER, global.key, globalDay, global.max))) {
        throw new HttpError(503, global.period === 'day'
          ? 'This feature has used its free capacity for today. Please try again tomorrow.'
          : 'This feature has used its free monthly capacity. Please try again next month.')
      }
      globalReserved = true
    }
    return await work()
  } catch (err) {
    await release(req.userId, tool, day).catch(() => {})
    if (globalReserved) await release(GLOBAL_USER, global.key, globalDay).catch(() => {})
    throw err
  }
}
