import { randomUUID } from 'node:crypto'

// Gives every request an id (also sent back as X-Request-Id) and logs one JSON line when it finishes.
export const requestLogger = (req, res, next) => {
  req.id = randomUUID()
  res.setHeader('X-Request-Id', req.id)
  const start = Date.now()
  res.on('finish', () => console.log(JSON.stringify({
    level: 'info', id: req.id, method: req.method, path: req.originalUrl.split('?')[0],
    status: res.statusCode, ms: Date.now() - start, user: req.userId,
  })))
  next()
}
