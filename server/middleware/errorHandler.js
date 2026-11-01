export const errorHandler = (err, req, res, _next) => {
  let status = 500
  let message = 'Something went wrong'
  if (err.expose) { status = err.status; message = err.message }
  else if (err.code === 'LIMIT_FILE_SIZE') { status = 413; message = 'File too large (max 5 MB)' }
  else if (err.code?.startsWith?.('LIMIT_')) { status = 400; message = 'Invalid upload' }
  else if (err.status === 429) { status = 429; message = 'The AI free quota is used up for now. Try again later.' }
  else if (err.status === 503) { status = 503; message = 'The AI is very busy right now. Please try again in a minute.' }
  else if (err.status === 404) { status = 503; message = 'This AI feature is temporarily unavailable.' }

  if (status >= 500 || !err.expose) {
    console.error(JSON.stringify({ level: 'error', id: req.id, status, upstream: err.status, message: err.message?.slice(0, 1000) }))
  }
  res.status(status).json({ success: false, message, requestId: req.id })
}
