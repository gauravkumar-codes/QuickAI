import cloudinary from '../config/cloudinary.js'
import { waitForDerived } from '../utils/waitForDerived.js'

export const upload = (buffer, opts = {}) => new Promise((resolve, reject) =>
  cloudinary.uploader.upload_stream({ folder: 'quickai', resource_type: 'image', ...opts },
    (err, result) => (err ? reject(err) : resolve(result))).end(buffer))

// Frees Cloudinary storage when a creation is deleted
export const removeAsset = (publicId) => (publicId ? cloudinary.uploader.destroy(publicId).catch(() => {}) : Promise.resolve())

// Uploads the photo, then has Cloudinary's Generative Remove erase the named object.
// (This effect can only be applied through the delivery URL, not at upload time.)
export const removeObject = async (buffer, object) => {
  const original = await upload(buffer)
  const url = cloudinary.url(original.public_id, {
    effect: `gen_remove:prompt_${object}`, sign_url: true, secure: true, version: original.version,
  })
  try {
    await waitForDerived(url)
  } catch (err) {
    await removeAsset(original.public_id) // don't keep a photo we could not process
    throw err
  }
  return { url, publicId: original.public_id }
}
