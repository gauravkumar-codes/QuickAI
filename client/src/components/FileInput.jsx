import { useRef, useState } from 'react'
import { UploadCloud, X } from 'lucide-react'

const MAX_BYTES = 5 * 1024 * 1024
const formatSize = (n) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`)

// Drag-and-drop file picker with validation and an image preview.
// value / onChange use { file, url } (url is a preview for images) or null.
const FileInput = ({ id, accept, value, onChange, hint }) => {
  const inputRef = useRef(null)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)

  const choose = (file) => {
    if (!file) return
    if (!accept.split(',').includes(file.type)) { setError('This file type is not supported.'); return }
    if (file.size > MAX_BYTES) { setError('File is too large (max 5 MB).'); return }
    setError('')
    if (value?.url) URL.revokeObjectURL(value.url)
    onChange({ file, url: file.type.startsWith('image/') ? URL.createObjectURL(file) : null })
  }
  const clear = () => {
    if (value?.url) URL.revokeObjectURL(value.url)
    if (inputRef.current) inputRef.current.value = ''
    onChange(null)
  }
  const onDrop = (e) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && inputRef.current) inputRef.current.files = e.dataTransfer.files // keeps the form's required check working
    choose(file)
  }

  return (
    <div className='mt-2'>
      <label htmlFor={id} onDragOver={(e) => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={onDrop}
        className={`flex flex-col items-center justify-center gap-1 p-5 text-sm text-gray-500 border-2 border-dashed rounded-md cursor-pointer focus-within:ring-2 focus-within:ring-blue-100 ${dragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}`}>
        <UploadCloud className='w-6 h-6' />
        <span>Drag and drop, or click to choose a file</span>
        <input ref={inputRef} id={id} type='file' accept={accept} required className='sr-only' onChange={(e) => choose(e.target.files?.[0])} />
      </label>
      {hint && <p className='text-xs text-gray-500 font-light mt-1'>{hint}</p>}
      {error && <p role='alert' className='text-xs text-red-500 mt-1'>{error}</p>}
      {value && (
        <div className='mt-3 flex items-center gap-3 p-2 border border-gray-200 rounded-md'>
          {value.url && <img src={value.url} alt='Selected file preview' className='w-14 h-14 object-cover rounded' />}
          <div className='min-w-0 flex-1 text-xs text-gray-600'>
            <p className='truncate'>{value.file.name}</p>
            <p className='text-gray-400'>{formatSize(value.file.size)}</p>
          </div>
          <button type='button' onClick={clear} aria-label='Remove selected file' className='p-1 text-gray-400 hover:text-gray-700 cursor-pointer'><X className='w-4 h-4' /></button>
        </div>
      )}
    </div>
  )
}

export default FileInput
