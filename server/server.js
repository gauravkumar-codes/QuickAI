import 'dotenv/config' // must stay first so .env is loaded before anything reads it
import './config/validateEnv.js' // stops here with a clear message if .env is wrong
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { clerkMiddleware } from '@clerk/express'
import { sql, initDb } from './config/db.js'
import aiRoutes from './routes/ai.routes.js'
import userRoutes from './routes/user.routes.js'
import { requestLogger } from './middleware/requestLogger.js'
import { globalLimiter } from './middleware/rateLimit.js'
import { errorHandler } from './middleware/errorHandler.js'
import { HttpError } from './utils/HttpError.js'

const app = express()
app.set('trust proxy', 1)
app.use(requestLogger)
app.use(helmet())
app.use(cors({ origin: (process.env.CLIENT_ORIGINS || 'http://localhost:5173').split(',').map((s) => s.trim()) }))
app.use(express.json({ limit: '100kb' }))
app.use(globalLimiter)

app.get('/', (_req, res) => res.json({ ok: true })) // cheap ping, also wakes a sleeping server
app.get('/health', async (_req, res) => { // for uptime monitors: also checks the database
  try { await sql`select 1`; res.json({ ok: true, db: true, uptime: Math.round(process.uptime()) }) }
  catch { res.status(503).json({ ok: false, db: false }) }
})

app.use(clerkMiddleware())
app.use('/api/ai', aiRoutes)
app.use('/api/user', userRoutes)
app.use((_req, _res, next) => next(new HttpError(404, 'Not found')))
app.use(errorHandler)

const port = process.env.PORT || 3000
await initDb()
const server = app.listen(port, () => console.log(JSON.stringify({ level: 'info', msg: `QuickAI API listening on ${port}` })))
process.on('SIGTERM', () => server.close(() => process.exit(0))) // clean shutdown on Render/Docker
