import multer from 'multer'
import { HttpError } from '../utils/HttpError.js'
import { detectType, MIME } from '../utils/fileType.js'

const uploader = (field) => multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1 } }).single(field)

// Checks the real file content (not the type the browser claims) and fixes the mimetype.
const verify = (allowed) => (req, _res, next) => {
  if (!req.file) return next()
  const type = detectType(req.file.buffer)
  if (!allowed.includes(type)) return next(new HttpError(400, 'The file content does not match an allowed type'))
  req.file.mimetype = MIME[type]
  next()
}

export const imageUpload = [uploader('image'), verify(['png', 'jpeg', 'webp'])]
export const pdfUpload = [uploader('resume'), verify(['pdf'])]
