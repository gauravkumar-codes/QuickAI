import { Router } from 'express'
import { requireUser } from '../middleware/auth.js'
import { listMine, listPublished, toggleLike, togglePublish, deleteCreation } from '../services/creations.js'
import { getUsage } from '../services/usage.js'
import { removeAsset } from '../services/image.js'
import { HttpError } from '../utils/HttpError.js'
import { wrap } from '../utils/wrap.js'
import { requireId, pageNumber } from '../utils/request.js'

const r = Router()
r.use(requireUser)

r.get('/get-user-creations', wrap(async (req, res) => {
  res.json({ success: true, ...(await listMine(req.userId, pageNumber(req.query.page))) })
}))

r.get('/get-published-creations', wrap(async (req, res) => {
  res.json({ success: true, ...(await listPublished(req.userId, pageNumber(req.query.page))) })
}))

r.get('/get-usage', wrap(async (req, res) => {
  res.json({ success: true, premium: req.premium, usage: await getUsage(req.userId, req.premium) })
}))

r.post('/toggle-like-creation', wrap(async (req, res) => {
  const row = await toggleLike(requireId(req.body.id), req.userId)
  if (!row) throw new HttpError(404, 'Creation not found')
  res.json({ success: true, ...row })
}))

r.post('/toggle-publish', wrap(async (req, res) => {
  const row = await togglePublish(requireId(req.body.id), req.userId)
  if (!row) throw new HttpError(404, 'Image not found')
  res.json({ success: true, publish: row.publish })
}))

r.post('/delete-creation', wrap(async (req, res) => {
  const row = await deleteCreation(requireId(req.body.id), req.userId)
  if (!row) throw new HttpError(404, 'Creation not found')
  await removeAsset(row.asset_id)
  res.json({ success: true })
}))

export default r
