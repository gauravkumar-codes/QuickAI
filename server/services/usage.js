import { sql } from '../config/db.js'
import { LIMITS, limitFor } from '../config/limits.js'

// { article: { used: 2, limit: 5 }, ... } for today
export const getUsage = async (userId, premium) => {
  const rows = await sql`select tool, count from usage where user_id = ${userId} and day = current_date`
  const used = Object.fromEntries(rows.map((r) => [r.tool, r.count]))
  return Object.fromEntries(Object.keys(LIMITS).map((tool) => [tool, { used: used[tool] ?? 0, limit: limitFor(tool, premium) }]))
}
