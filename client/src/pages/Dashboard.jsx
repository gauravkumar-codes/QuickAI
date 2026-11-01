import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Show } from '@clerk/react'
import { Gem, Sparkles, Image as ImageIcon, Copy, ExternalLink, Trash2, Globe, Lock } from 'lucide-react'
import { useApi } from '../api/useApi'
import { useCreations } from '../hooks/useCreations'
import { useUsageData } from '../hooks/useUsage'
import Status from '../components/Status'
import Md from '../components/Md'

const LABELS = { article: 'Article', 'blog-title': 'Blog titles', image: 'Image' }
const TOOL_LABELS = { article: 'Articles', title: 'Blog titles', image: 'Image generation', resume: 'Resume reviews', bgremove: 'Background removal', objremove: 'Object removal' }
const smallBtn = 'inline-flex items-center gap-1 text-[#8E37EB] cursor-pointer'

const StatCard = ({ label, value, Icon, grad }) => (
  <div className='flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-gray-200'>
    <div className='text-slate-600'>
      <p className='text-sm'>{label}</p>
      <h2 className='text-xl font-semibold'>{value}</h2>
    </div>
    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${grad} text-white flex justify-center items-center`}>
      <Icon className='w-5 text-white' />
    </div>
  </div>
)

// Today's usage per tool, so free users see their limits and the reason to upgrade
const UsageCard = () => {
  const { data } = useUsageData()
  if (!data) return null
  return (
    <div className='mt-6 max-w-5xl bg-white border border-gray-200 rounded-xl p-4'>
      <div className='flex items-center justify-between'>
        <p className='font-medium text-slate-700'>Today&apos;s usage</p>
        {!data.premium && <Link to='/#plan' className='text-sm text-[#8E37EB] underline'>Upgrade for higher limits</Link>}
      </div>
      <div className='mt-3 grid sm:grid-cols-2 gap-x-8 gap-y-3'>
        {Object.entries(data.usage).map(([tool, u]) => (
          <div key={tool}>
            <div className='flex justify-between text-xs text-gray-600'><span>{TOOL_LABELS[tool]}</span><span>{u.used}/{u.limit}</span></div>
            <div className='h-1.5 bg-gray-100 rounded-full mt-1'>
              <div className='h-full rounded-full bg-gradient-to-r from-[#3C81F6] to-[#9234EA]' style={{ width: `${Math.min(100, (u.used / u.limit) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const CreationItem = ({ item, onDelete, onTogglePublic }) => {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const label = LABELS[item.type] || item.type
  const stop = (fn) => (e) => { e.stopPropagation(); fn() }
  const copy = () => { navigator.clipboard.writeText(item.content); setCopied(true); setTimeout(() => setCopied(false), 1500) }

  return (
    <div className='max-w-5xl text-sm p-4 bg-white border border-gray-200 rounded-lg'>
      <button type='button' onClick={() => setOpen(!open)} aria-expanded={open} className='w-full flex justify-between items-center gap-4 text-left cursor-pointer'>
        <span className='min-w-0'>
          <span className='block truncate'>{item.prompt}</span>
          <span className='block text-gray-500'>{label} - {new Date(item.created_at).toLocaleDateString()}</span>
        </span>
        <span className='shrink-0 px-4 py-1 rounded-full border border-[#8E37EB] bg-[#EFE6FB] text-[#8E37EB]'>{label}</span>
      </button>

      {open && (
        <div className='mt-3'>
          {item.type === 'image'
            ? <img src={item.content} alt={item.prompt} loading='lazy' className='w-full max-w-md rounded' />
            : <div className='max-h-72 overflow-y-auto'><Md text={item.content} /></div>}
          <div className='mt-3 flex flex-wrap items-center gap-4'>
            {item.type === 'image'
              ? <a href={item.content} target='_blank' rel='noreferrer' className={smallBtn}><ExternalLink className='w-4 h-4' /> Open full size</a>
              : <button type='button' onClick={copy} className={smallBtn}><Copy className='w-4 h-4' /> {copied ? 'Copied' : 'Copy'}</button>}
            {item.type === 'image' && (
              <button type='button' onClick={stop(() => onTogglePublic(item))} className={smallBtn}>
                {item.publish ? <><Lock className='w-4 h-4' /> Make private</> : <><Globe className='w-4 h-4' /> Publish to Community</>}
              </button>
            )}
            <button type='button' onClick={stop(() => onDelete(item))} className='inline-flex items-center gap-1 text-red-500 cursor-pointer'><Trash2 className='w-4 h-4' /> Delete</button>
          </div>
        </div>
      )}
    </div>
  )
}

const Dashboard = () => {
  const api = useApi()
  const { items, setItems, meta, setMeta, hasMore, loadMore, loadingMore, loading, slow, err, reload } = useCreations('/api/user/get-user-creations')
  const [actionErr, setActionErr] = useState('')

  const remove = async (item) => {
    if (!window.confirm('Delete this creation? This cannot be undone.')) return
    try {
      await api('/api/user/delete-creation', { id: item.id })
      setItems((cur) => cur.filter((c) => c.id !== item.id))
      setMeta((m) => ({ ...m, stats: { total: (m.stats?.total ?? 1) - 1, images: (m.stats?.images ?? 0) - (item.type === 'image' ? 1 : 0) } }))
      setActionErr('')
    } catch (e) { setActionErr(e.message) }
  }
  const togglePublic = async (item) => {
    try {
      const d = await api('/api/user/toggle-publish', { id: item.id })
      setItems((cur) => cur.map((c) => (c.id === item.id ? { ...c, publish: d.publish ?? !c.publish } : c)))
      setActionErr('')
    } catch (e) { setActionErr(e.message) }
  }

  const stats = meta.stats
  return (
    <div className='h-full overflow-y-scroll p-6'>
      <div className='flex justify-start gap-4 flex-wrap'>
        <StatCard label='Total Creations' value={stats?.total ?? items.length} Icon={Sparkles} grad='from-[#3588F2] to-[#0BB0D7]' />
        <StatCard label='Images Created' value={stats?.images ?? items.filter((c) => c.type === 'image').length} Icon={ImageIcon} grad='from-[#2BC48A] to-[#1E9E6B]' />
        <StatCard label='Active Plan' value={<Show when={{ plan: 'premium' }} fallback='Free'>Premium</Show>} Icon={Gem} grad='from-[#FF61C5] to-[#9E53EE]' />
      </div>

      <UsageCard />

      <div className='mt-6 space-y-3'>
        <p className='font-medium text-slate-700'>Recent Creations</p>
        <Status loading={loading} slow={slow} err={err} empty={!items.length} onRetry={reload}
          emptyText='No creations yet. Try Write Article or Generate Images from the sidebar.' />
        {actionErr && <p role='alert' className='text-sm text-red-500'>{actionErr}</p>}
        {items.map((c) => <CreationItem key={c.id} item={c} onDelete={remove} onTogglePublic={togglePublic} />)}
        {hasMore && (
          <button type='button' onClick={loadMore} disabled={loadingMore} className='px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer disabled:opacity-60'>
            {loadingMore ? 'Loading...' : 'Load more'}
          </button>
        )}
      </div>
    </div>
  )
}

export default Dashboard
