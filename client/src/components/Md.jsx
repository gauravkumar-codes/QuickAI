// Small markdown renderer: #/##/### headings, * or - bullets, **bold**
const Md = ({ text }) => {
  const bold = (t) => t.split(/\*\*(.+?)\*\*/g).map((s, i) => i % 2 ? <b key={i}>{s}</b> : s)
  return <div className='text-sm text-slate-600 space-y-1.5'>{text.split('\n').map((l, i) => {
    if (/^#{1,3} /.test(l)) return <h3 key={i} className='font-semibold text-slate-800 text-base mt-3'>{bold(l.replace(/^#+ /, ''))}</h3>
    if (/^\s*[*-] /.test(l)) return <li key={i} className='ml-5 list-disc'>{bold(l.replace(/^\s*[*-] /, ''))}</li>
    return l.trim() ? <p key={i}>{bold(l)}</p> : null
  })}</div>
}

export default Md
