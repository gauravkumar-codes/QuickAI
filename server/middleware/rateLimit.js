import rateLimit from 'express-rate-limit'

const message = { success: false, message: 'Too many requests. Please slow down and try again shortly.' }

// Per IP, for everything
export const globalLimiter = rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: 'draft-7', legacyHeaders: false, message })
// Per signed-in user, for the AI routes (after requireUser)
export const aiLimiter = rateLimit({ windowMs: 60_000, limit: 10, keyGenerator: (req) => req.userId, standardHeaders: 'draft-7', legacyHeaders: false, message })
