import { Heart } from 'lucide-react'
import { useApi } from '../api/useApi'
import { useCreations } from '../hooks/useCreations'
import Status from '../components/Status'

const Community = () => {
  const api = useApi()
  const { items, setItems, hasMore, loadMore, loadingMore, loading, slow, err, reload } = useCreations('/api/user/get-published-creations')

  const patch = (id, fields) => setItems((list) => list.map((c) => (c.id === id ? { ...c, ...fields } : c)))

  // Update the heart instantly, then sync with the server (undo if it fails)
  const toggle = async (item) => {
    const before = { liked: item.liked, like_count: item.like_count }
    patch(item.id, { liked: !item.liked, like_count: item.like_count + (item.liked ? -1 : 1) })
    try {
      const d = await api('/api/user/toggle-like-creation', { id: item.id })
      if (typeof d.like_count === 'number') patch(item.id, { liked: d.liked, like_count: d.like_count })
    } catch {
      patch(item.id, before)
    }
  }

  return (
    <div className='flex-1 h-full flex flex-col gap-4 p-6'>
      <h1 className='text-lg font-semibold text-slate-700'>Creations</h1>
      <Status loading={loading} slow={slow} err={err} empty={!items.length} onRetry={reload}
        emptyText='No public creations yet. Generate an image and turn on "Make this image Public".' />
      <div className='bg-white h-full w-full rounded-xl overflow-y-scroll'>
        <div className='flex flex-wrap'>
          {items.map((c) => (
            <div key={c.id} className='relative group inline-block pl-3 pt-3 w-full sm:max-w-1/2 lg:max-w-1/3'>
              <img src={c.content} alt={c.prompt} loading='lazy' className='w-full h-full object-cover rounded-lg' />
              <div className='absolute bottom-0 top-0 right-0 left-3 flex gap-2 items-end justify-end group-hover:justify-between p-3 group-hover:bg-gradient-to-b from-transparent to-black/80 text-white rounded-lg'>
                <p className='text-sm hidden group-hover:block'>{c.prompt}</p>
                <div className='flex gap-1 items-center'>
                  <p>{c.like_count}</p>
                  <button type='button' onClick={() => toggle(c)} aria-pressed={c.liked} aria-label={c.liked ? 'Unlike' : 'Like'} className='cursor-pointer'>
                    <Heart className={`min-w-5 h-5 hover:scale-110 ${c.liked ? 'fill-red-500 text-red-600' : 'text-white'}`} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {hasMore && (
          <div className='p-4 text-center'>
            <button type='button' onClick={loadMore} disabled={loadingMore} className='px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer disabled:opacity-60'>
              {loadingMore ? 'Loading...' : 'Load more'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Community
