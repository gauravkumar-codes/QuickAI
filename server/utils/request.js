import { HttpError } from './HttpError.js'

export const requireText = (value, max, label = 'Text') => {
  const s = String(value ?? '').trim()
  if (!s || s.length > max) throw new HttpError(400, `${label} must be between 1 and ${max} characters`)
  return s
}
export const pickOne = (value, allowed, label) => {
  if (!allowed.includes(value)) throw new HttpError(400, `Invalid ${label}`)
  return value
}
export const requireId = (value) => {
  const id = Number(value)
  if (!Number.isInteger(id) || id < 1) throw new HttpError(400, 'Invalid id')
  return id
}
export const pageNumber = (value) => Math.min(Math.max(parseInt(value, 10) || 1, 1), 1000)
export const ok = (res, content) => res.json({ success: true, content })
