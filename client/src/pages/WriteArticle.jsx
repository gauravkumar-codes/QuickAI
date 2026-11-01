import { useState } from 'react'
import { SquarePen } from 'lucide-react'
import ToolShell from '../components/ToolShell'
import Chips from '../components/Chips'
import Label from '../components/Label'
import Md from '../components/Md'
import { inputCls } from '../utils/styles'
import { useApi } from '../api/useApi'
import { useRun } from '../hooks/useRun'
import { useUsage } from '../hooks/useUsage'

const lengths = [
  { text: 'Short (500-800 word)', length: 800 },
  { text: 'Medium (800-1200 word)', length: 1200 },
  { text: 'Long (1200+ word)', length: 1600 },
]

const WriteArticle = () => {
  const api = useApi()
  const { loading, slow, err, out, run } = useRun()
  const usage = useUsage('article')
  const [topic, setTopic] = useState('')
  const [len, setLen] = useState(lengths[0].text)
  const submit = () => run(() => api('/api/ai/generate-article', { topic, length: lengths.find((l) => l.text === len).length })).then(usage.refresh)
  return (
    <ToolShell title='Article Configuration' accent='text-[#4A7AFF]' Icon={SquarePen} resultTitle='Generated article'
      btn='bg-gradient-to-r from-[#226BFF] to-[#65ADFF]' btnLabel='Generate article' BtnIcon={SquarePen}
      onSubmit={submit} loading={loading} slow={slow} err={err} usage={usage.info} out={out}
      empty='Enter a topic and click “Generate article” to get started' result={out && <Md text={out} />}>
      <Label htmlFor='topic'>Article Topic</Label>
      <input id='topic' value={topic} onChange={(e) => setTopic(e.target.value)} className={inputCls} placeholder='The future of artificial intelligence is...' maxLength={300} required />
      <Label>Article Length</Label>
      <Chips label='Article length' items={lengths.map((l) => l.text)} value={len} onChange={setLen} active='bg-blue-50 text-blue-700 border-blue-600' />
    </ToolShell>
  )
}
export default WriteArticle
