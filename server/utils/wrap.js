// Sends async errors to the error handler instead of crashing
export const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res)).catch(next)
