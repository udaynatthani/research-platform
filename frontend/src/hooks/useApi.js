import { useState, useEffect, useCallback, useRef } from 'react'

export default function useApi(fetchFn, deps = []) {
  const [data, setData] = useState(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const mountedRef = useRef(true)

  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false } }, [])

  const execute = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchFn()
      if (mountedRef.current) setData(result)
    } catch (e) {
      if (mountedRef.current) setError(e)
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, deps)

  useEffect(() => { execute() }, [execute])

  return { data, loading, error, refetch: execute }
}
