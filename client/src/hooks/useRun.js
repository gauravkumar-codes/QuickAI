import { useState } from 'react'

export const useRun = () => {
  const [loading, setLoading] = useState(false)
  const [slow, setSlow] = useState(false) // true after 8s: server may be waking up
  const [err, setErr] = useState('')
  const [out, setOut] = useState('')
  const run = async (fn) => {
    setLoading(true); setSlow(false); setErr('')
    const timer = setTimeout(() => setSlow(true), 8000)
    try { setOut((await fn()).content) } catch (e) { setErr(e.message) }
    clearTimeout(timer)
    setLoading(false)
  }
  return { loading, slow, err, out, run }
}
