import { useState } from 'react'
import { Scissors } from 'lucide-react'
import ToolShell from '../components/ToolShell'
import FileInput from '../components/FileInput'
import BeforeAfter from '../components/BeforeAfter'
import Label from '../components/Label'
import { inputCls } from '../utils/styles'
import { useApi } from '../api/useApi'
import { useRun } from '../hooks/useRun'
import { useUsage } from '../hooks/useUsage'

const RemoveObject = () => {
  const api = useApi()
  const { loading, slow, err, out, run } = useRun()
  const usage = useUsage('objremove')
  const [picked, setPicked] = useState(null)
  const [object, setObject] = useState('')
  const [warn, setWarn] = useState('')
  const submit = () => {
    if (object.trim().split(/\s+/).length > 3) return setWarn('Please use at most three words for the object name')
    setWarn('')
    run(() => { const f = new FormData(); f.append('image', picked.file); f.append('object', object.trim()); return api('/api/ai/remove-image-object', f) }).then(usage.refresh)
  }
  return (
    <ToolShell title='Object Removal' accent='text-[#4A7AFF]' Icon={Scissors} resultTitle='Processed Image' kind='image'
      btn='bg-gradient-to-r from-[#417DF6] to-[#8E37EB]' btnLabel='Remove object' BtnIcon={Scissors}
      onSubmit={submit} loading={loading} slow={slow} err={warn || err} usage={usage.info} out={out}
      privacy='Your photo is processed and stored by Cloudinary. Results can vary, and a clearly visible object works best.'
      empty='Upload an image and click "Remove Object" to get started'
      result={out && <BeforeAfter before={picked?.url ?? out} after={out} />}>
      <Label htmlFor='obj-image'>Upload image</Label>
      <FileInput id='obj-image' accept='image/png,image/jpeg,image/webp' value={picked} onChange={setPicked} hint='JPG, PNG or WebP, up to 5 MB' />
      <Label htmlFor='object'>Describe object name to remove</Label>
      <input id='object' value={object} onChange={(e) => setObject(e.target.value)} className={inputCls} placeholder='e.g., watch, spoon or red car' maxLength={40} required />
    </ToolShell>
  )
}
export default RemoveObject
