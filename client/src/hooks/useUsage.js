import { useEffect, useState } from 'react'
import { useApi } from '../api/useApi'

// Today's usage for every tool: { premium, usage: { article: { used, limit }, ... } }
export const useUsageData = () => {
  const api = useApi()
  const [data, setData] = useState(null)
  const refresh = () => api('/api/user/get-usage').then(setData).catch(() => {})
  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return { data, refresh }
}

// Usage for one tool: { info: { used, limit } | null, refresh }
export const useUsage = (tool) => {
  const { data, refresh } = useUsageData()
  return { info: data?.usage?.[tool] ?? null, refresh }
}
