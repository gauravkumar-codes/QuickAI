import { GoogleGenAI } from '@google/genai'

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
export const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || 'gemini-3.8-flash'
// Used automatically when the main text model is busy. Pick a model your AI Studio account lists.
export const FALLBACK_TEXT_MODEL = process.env.GEMINI_FALLBACK_MODEL || 'gemini-3.1-flash-lite'
