import { getAuth } from '@clerk/express'
import { HttpError } from '../utils/HttpError.js'

export const requireUser = (req, _res, next) => {
  const auth = getAuth(req)
  if (!auth.userId) return next(new HttpError(401, 'Please sign in'))
  req.userId = auth.userId
  req.premium = !!auth.has?.({ plan: 'premium' })
  next()
}
