import { useState } from 'react'
import { Image } from 'lucide-react'
import ToolShell from '../components/ToolShell'
import Chips from '../components/Chips'
import Label from '../components/Label'
import { inputCls } from '../utils/styles'
import { useApi } from '../api/useApi'
import { useRun } from '../hooks/useRun'
import { useUsage } from '../hooks/useUsage'

const styles = ['Realistic', 'Ghibli style', 'Anime style', 'Cartoon style', 'Fantasy style', 'Realistic style', '3D style', 'Portrait style']

const GenerateImages = () => {
  const api = useApi()
  const { loading, slow, err, out, run } = useRun()
  const usage = useUsage('image')
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('Realistic')
  const [publish, setPublish] = useState(false)
  const submit = () => run(() => api('/api/ai/generate-image', { prompt, style, publish })).then(usage.refresh)
  return (
    <ToolShell title='AI Image Generator' accent='text-[#00AD25]' Icon={Image} resultTitle='Generated image' kind='image'
      btn='bg-gradient-to-r from-[#00AD25] to-[#04FF50]' btnLabel='Generate Image' BtnIcon={Image}
      onSubmit={submit} loading={loading} slow={slow} err={err} usage={usage.info} out={out}
      privacy='Your description is sent to Cloudflare Workers AI to create the image. The image is stored on Cloudinary.'
      empty='Enter a topic and click “Generate image” to get started'
      result={out && <img src={out} alt='Generated' className='w-full h-full object-contain rounded' />}>
      <Label htmlFor='prompt'>Describe Your Image</Label>
      <textarea id='prompt' value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} className={inputCls} placeholder='Describe what you want to see in the image..' maxLength={500} required />
      <Label>Style</Label>
      <Chips label='Image style' items={styles} value={style} onChange={setStyle} active='bg-green-50 text-green-700 border-green-500' />
      <label className='mt-6 flex items-center gap-2 cursor-pointer text-sm'>
        <input type='checkbox' checked={publish} onChange={(e) => setPublish(e.target.checked)} className='sr-only peer' />
        <span className='w-9 h-5 bg-slate-300 rounded-full relative peer-checked:bg-green-500 peer-focus-visible:ring-2 peer-focus-visible:ring-green-300 transition after:content-[""] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:bg-white after:rounded-full after:transition peer-checked:after:translate-x-4' />
        Make this image Public
      </label>
      {publish && <p className='mt-1 text-xs text-amber-600'>Everyone signed in to QuickAI will see this image and its description in Community.</p>}
    </ToolShell>
  )
}
export default GenerateImages
