import { useState } from 'react'
import { Eraser } from 'lucide-react'
import ToolShell from '../components/ToolShell'
import FileInput from '../components/FileInput'
import BeforeAfter from '../components/BeforeAfter'
import Label from '../components/Label'
import { useApi } from '../api/useApi'
import { useRun } from '../hooks/useRun'
import { useUsage } from '../hooks/useUsage'

const RemoveBackground = () => {
  const api = useApi()
  const { loading, slow, err, out, run } = useRun()
  const usage = useUsage('bgremove')
  const [picked, setPicked] = useState(null)
  const submit = () => run(() => { const f = new FormData(); f.append('image', picked.file); return api('/api/ai/remove-image-background', f) }).then(usage.refresh)
  return (
    <ToolShell title='Background Removal' accent='text-[#FF4938]' Icon={Eraser} resultTitle='Processed Image' kind='image'
      btn='bg-gradient-to-r from-[#F6AB41] to-[#FF4938]' btnLabel='Remove background' BtnIcon={Eraser}
      onSubmit={submit} loading={loading} slow={slow} err={err} usage={usage.info} out={out}
      privacy='Your photo is processed and stored by Cloudinary.'
      empty='Upload an image and click "Remove Background" to get started'
      result={out && <BeforeAfter before={picked?.url ?? out} after={out} />}>
      <Label htmlFor='bg-image'>Upload image</Label>
      <FileInput id='bg-image' accept='image/png,image/jpeg,image/webp' value={picked} onChange={setPicked} hint='JPG, PNG or WebP, up to 5 MB' />
    </ToolShell>
  )
}
export default RemoveBackground
