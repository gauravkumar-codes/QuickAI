import { TEXT_MODEL, FALLBACK_TEXT_MODEL } from '../config/gemini.js'
import { filePart } from '../utils/filePart.js'
import { generate } from '../utils/generate.js'
import { SYSTEM_INSTRUCTION } from '../utils/prompt.js'
import { HttpError } from '../utils/HttpError.js'

export const askText = async (prompt, file) => {
  const parts = [{ text: prompt }, ...(file ? [filePart(file)] : [])]
  const r = await generate([TEXT_MODEL, FALLBACK_TEXT_MODEL], [{ role: 'user', parts }], { systemInstruction: SYSTEM_INSTRUCTION })
  if (!r.text) throw new HttpError(502, 'The AI returned no text. Try again.')
  return r.text
}
