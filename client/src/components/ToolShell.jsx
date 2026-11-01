import { useState } from 'react'
import { Sparkles, Loader2, Copy, Check, Download, RefreshCw } from 'lucide-react'

const actionBtn = 'flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 cursor-pointer disabled:opacity-50'

// Two-card tool layout: form on the left, result on the right.
// `out` + `kind` ('text' | 'image') turn on the Copy / Download / Regenerate buttons.
const ToolShell = ({
  title, accent, Icon, resultTitle, btn, btnLabel, BtnIcon, onSubmit, loading, slow, err, empty, result, out, kind = 'text',
  usage, privacy = 'Your input is processed by Google Gemini.', children,
}) => {
  const [copied, setCopied] = useState(false)
  const left = usage ? usage.limit - usage.used : null
  const blocked = left !== null && left <= 0

  const copy = async () => {
    try { await navigator.clipboard.writeText(out); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch { /* clipboard blocked */ }
  }
  const download = async () => {
    try {
      const blob = await (await fetch(out)).blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob); a.download = 'quickai-image.png'; a.click()
      setTimeout(() => URL.revokeObjectURL(a.href), 1000)
    } catch { window.open(out, '_blank', 'noreferrer') }
  }

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>
      <form onSubmit={(e) => { e.preventDefault(); if (!blocked) onSubmit() }} aria-busy={loading} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
        <div className='flex items-center gap-3'><Sparkles className={`w-6 ${accent}`} /><h1 className='text-xl font-semibold'>{title}</h1></div>
        {children}
        <button disabled={loading || blocked} className={`w-full flex justify-center items-center gap-2 ${btn} text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed`}>
          {loading ? <Loader2 className='w-4 h-4 animate-spin' /> : <BtnIcon className='w-5' />}{blocked ? 'Daily limit reached' : btnLabel}
        </button>
        {usage && <p className='mt-2 text-xs text-gray-500 text-center'>{blocked ? 'Your limit resets at midnight UTC.' : `${left} of ${usage.limit} uses left today`}</p>}
        {loading && slow && <p className='mt-3 text-xs text-gray-500'>Still working. The server may be waking up or the AI is busy, so this can take a few minutes.</p>}
        {err && (
          <div role='alert' className='mt-3 text-sm text-red-500 flex items-center justify-between gap-3'>
            <span>{err}</span>
            {!blocked && <button type='button' onClick={onSubmit} className='shrink-0 underline cursor-pointer'>Try again</button>}
          </div>
        )}
        <p className='mt-4 text-[11px] text-gray-400'>{privacy}</p>
      </form>

      <div className='w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-[600px]'>
        <div className='flex items-center justify-between gap-3'>
          <div className='flex items-center gap-3'><Icon className={`w-5 h-5 ${accent}`} /><h2 className='text-xl font-semibold'>{resultTitle}</h2></div>
          {out && !loading && (
            <div className='flex gap-2'>
              {kind === 'text'
                ? <button type='button' onClick={copy} className={actionBtn}>{copied ? <Check className='w-3.5 h-3.5' /> : <Copy className='w-3.5 h-3.5' />}{copied ? 'Copied' : 'Copy'}</button>
                : <button type='button' onClick={download} className={actionBtn}><Download className='w-3.5 h-3.5' />Download</button>}
              <button type='button' onClick={onSubmit} disabled={blocked} className={actionBtn}><RefreshCw className='w-3.5 h-3.5' />Regenerate</button>
            </div>
          )}
        </div>
        <div aria-live='polite' className='flex-1 flex flex-col min-h-0'>
          {result ? <div className='mt-3 h-full overflow-y-scroll'>{result}</div> : (
            <div className='flex-1 flex justify-center items-center'>
              <div className='text-sm flex flex-col items-center gap-5 text-gray-400'><Icon className='w-9 h-9' /><p className='text-center'>{empty}</p></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ToolShell
