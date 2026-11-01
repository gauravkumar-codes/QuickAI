import { Router } from 'express'
import { requireUser } from '../middleware/auth.js'
import { aiLimiter } from '../middleware/rateLimit.js'
import { withQuota } from '../middleware/quota.js'
import { imageUpload, pdfUpload } from '../middleware/upload.js'
import { askText } from '../services/text.js'
import { generateImage } from '../services/cloudflare.js'
import { upload, removeObject } from '../services/image.js'
import { save } from '../services/creations.js'
import { CLOUDINARY_MONTHLY_LIMIT, CLOUDFLARE_DAILY_LIMIT } from '../config/limits.js'
import { LENGTHS, CATEGORIES, STYLES, STYLE_PROMPTS } from '../config/options.js'
import { HttpError } from '../utils/HttpError.js'
import { wrap } from '../utils/wrap.js'
import { block } from '../utils/prompt.js'
import { requireText, pickOne, ok } from '../utils/request.js'

const r = Router()
r.use(requireUser, aiLimiter)

// Free allowances shared by ALL users
const cloudinaryCap = { key: 'cloudinary-ai', max: CLOUDINARY_MONTHLY_LIMIT } // monthly
const cloudflareCap = { key: 'cloudflare-image', max: CLOUDFLARE_DAILY_LIMIT, period: 'day' }

r.post('/generate-article', wrap(async (req, res) => {
  const topic = requireText(req.body.topic, 300, 'Topic')
  const words = pickOne(Number(req.body.length), LENGTHS, 'length')
  ok(res, await withQuota(req, 'article', async () => {
    const content = await askText(`Write a well-structured article in Markdown, about ${words} words, with clear headings.\n${block('topic', topic)}`)
    await save({ userId: req.userId, prompt: topic, content, type: 'article' })
    return content
  }))
}))

r.post('/generate-blog-title', wrap(async (req, res) => {
  const keyword = requireText(req.body.keyword, 100, 'Keyword')
  const category = pickOne(req.body.category, CATEGORIES, 'category')
  ok(res, await withQuota(req, 'title', async () => {
    const content = await askText(`Give 6 catchy blog titles as a Markdown bullet list, grouped under short bold headings. Category: ${category}.\n${block('keyword', keyword)}`)
    await save({ userId: req.userId, prompt: `${keyword} (${category})`, content, type: 'blog-title' })
    return content
  }))
}))

r.post('/generate-image', wrap(async (req, res) => {
  const prompt = requireText(req.body.prompt, 500, 'Description')
  const style = pickOne(req.body.style, STYLES, 'style')
  const publish = req.body.publish === true || req.body.publish === 'true'
  ok(res, await withQuota(req, 'image', async () => {
    const image = await generateImage(`${prompt}, ${STYLE_PROMPTS[style]}`)
    const result = await upload(image)
    await save({ userId: req.userId, prompt: `${prompt} (${style})`, content: result.secure_url, type: 'image', publish, assetId: result.public_id })
    return result.secure_url
  }, { global: cloudflareCap }))
}))

r.post('/remove-image-background', ...imageUpload, wrap(async (req, res) => {
  if (!req.file) throw new HttpError(400, 'Upload an image')
  ok(res, await withQuota(req, 'bgremove', async () => {
    const result = await upload(req.file.buffer, { eager: [{ effect: 'background_removal', format: 'png' }] })
    const url = result.eager?.[0]?.secure_url
    if (!url) throw new HttpError(502, 'Background removal failed. Try another image.')
    await save({ userId: req.userId, prompt: 'Remove background from image', content: url, type: 'image', assetId: result.public_id })
    return url
  }, { global: cloudinaryCap }))
}))

r.post('/remove-image-object', ...imageUpload, wrap(async (req, res) => {
  if (!req.file) throw new HttpError(400, 'Upload an image')
  const object = requireText(req.body.object, 40, 'Object name')
  if (!/^[\p{L}\p{N} ]+$/u.test(object)) throw new HttpError(400, 'Use only letters, numbers and spaces for the object name')
  ok(res, await withQuota(req, 'objremove', async () => {
    const { url, publicId } = await removeObject(req.file.buffer, object)
    await save({ userId: req.userId, prompt: `Remove ${object} from image`, content: url, type: 'image', assetId: publicId })
    return url
  }, { global: cloudinaryCap }))
}))

// The resume goes straight to Gemini and is never stored; only the review is returned.
r.post('/resume-review', ...pdfUpload, wrap(async (req, res) => {
  if (!req.file) throw new HttpError(400, 'Upload a PDF resume')
  ok(res, await withQuota(req, 'resume', () => askText(
    'Review the attached resume like a hiring manager. Reply in Markdown with these sections: Strengths, Gaps, Concrete improvements, ATS tips.',
    req.file)))
}))

export default r
