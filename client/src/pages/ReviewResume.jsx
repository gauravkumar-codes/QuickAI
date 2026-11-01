import { useState } from 'react'
import { FileText } from 'lucide-react'
import ToolShell from '../components/ToolShell'
import FileInput from '../components/FileInput'
import Label from '../components/Label'
import Md from '../components/Md'
import { useApi } from '../api/useApi'
import { useRun } from '../hooks/useRun'
import { useUsage } from '../hooks/useUsage'

const ReviewResume = () => {
  const api = useApi()
  const { loading, slow, err, out, run } = useRun()
  const usage = useUsage('resume')
  const [picked, setPicked] = useState(null)
  const submit = () => run(() => { const f = new FormData(); f.append('resume', picked.file); return api('/api/ai/resume-review', f) }).then(usage.refresh)
  return (
    <ToolShell title='Resume Review' accent='text-[#00DA83]' Icon={FileText} resultTitle='Analysis Results'
      btn='bg-gradient-to-r from-[#5DD68D] to-[#3B96B5]' btnLabel='Review Resume' BtnIcon={FileText}
      onSubmit={submit} loading={loading} slow={slow} err={err} usage={usage.info} out={out}
      privacy='Your resume is sent to Google Gemini for analysis. QuickAI does not store it; only the review is returned.'
      empty='Upload a resume and click "Review Resume" to get started' result={out && <Md text={out} />}>
      <Label htmlFor='resume'>Upload Resume</Label>
      <FileInput id='resume' accept='application/pdf' value={picked} onChange={setPicked} hint='PDF only, up to 5 MB' />
    </ToolShell>
  )
}
export default ReviewResume
