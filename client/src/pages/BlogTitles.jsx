import { useState } from 'react'
import { Hash } from 'lucide-react'
import ToolShell from '../components/ToolShell'
import Chips from '../components/Chips'
import Label from '../components/Label'
import Md from '../components/Md'
import { inputCls } from '../utils/styles'
import { useApi } from '../api/useApi'
import { useRun } from '../hooks/useRun'
import { useUsage } from '../hooks/useUsage'

const categories = ['General', 'Technology', 'Business', 'Health', 'Lifestyle', 'Education', 'Travel', 'Food']

const BlogTitles = () => {
  const api = useApi()
  const { loading, slow, err, out, run } = useRun()
  const usage = useUsage('title')
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState('General')
  const submit = () => run(() => api('/api/ai/generate-blog-title', { keyword, category })).then(usage.refresh)
  return (
    <ToolShell title='AI Title Generator' accent='text-[#8E37EB]' Icon={Hash} resultTitle='Generated titles'
      btn='bg-gradient-to-r from-[#C341F6] to-[#8E37EB]' btnLabel='Generate title' BtnIcon={Hash}
      onSubmit={submit} loading={loading} slow={slow} err={err} usage={usage.info} out={out}
      empty='Enter a topic and click “Generate title” to get started' result={out && <Md text={out} />}>
      <Label htmlFor='keyword'>Keyword</Label>
      <input id='keyword' value={keyword} onChange={(e) => setKeyword(e.target.value)} className={inputCls} placeholder='The future of artificial intelligence is...' maxLength={100} required />
      <Label>Category</Label>
      <Chips label='Category' items={categories} value={category} onChange={setCategory} active='bg-purple-50 text-purple-700 border-purple-500' />
    </ToolShell>
  )
}
export default BlogTitles
