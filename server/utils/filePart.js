// Converts an uploaded file (multer) into a Gemini inline-data part
export const filePart = (f) => ({ inlineData: { mimeType: f.mimetype, data: f.buffer.toString('base64') } })
