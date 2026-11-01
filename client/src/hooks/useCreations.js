import { useEffect, useState } from 'react'
import { useApi } from '../api/useApi'

// Loads a paginated list of creations, with loading / slow / error state and "load more".
export const useCreations = (path) => {
  const api = useApi()
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState({}) // whatever else the endpoint returns (e.g. stats)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [slow, setSlow] = useState(false)
  const [err, setErr] = useState('')

  // Loads page 1. State is only set inside promise callbacks, never synchronously.
  const init = (cancelled = () => false) => {
    const timer = setTimeout(() => !cancelled() && setSlow(true), 6000)
    return api(`${path}?page=1`)
      .then((d) => {
        if (cancelled()) return
        setItems(d.creations || []); setMeta(d); setHasMore(!!d.hasMore); setPage(1)
      })
      .catch((e) => { if (!cancelled()) setErr(e.message) })
      .finally(() => { clearTimeout(timer); if (!cancelled()) setLoading(false) })
  }

  useEffect(() => {
    let cancelled = false
    init(() => cancelled)
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path])

  const reload = () => { setLoading(true); setErr(''); setSlow(false); init() }

  const loadMore = async () => {
    setLoadingMore(true)
    try {
      const d = await api(`${path}?page=${page + 1}`)
      setItems((cur) => [...cur, ...(d.creations || [])]); setHasMore(!!d.hasMore); setPage(page + 1)
    } catch (e) { setErr(e.message) }
    setLoadingMore(false)
  }

  return { items, setItems, meta, setMeta, hasMore, loadMore, loadingMore, loading, slow, err, reload }
}
