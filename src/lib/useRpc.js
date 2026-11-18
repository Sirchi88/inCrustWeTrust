import { useCallback, useEffect, useState } from 'react'
import { rpc } from './api.js'

// Lädt Daten über eine Datenbank-Funktion beim ersten Rendern.
export function useRpc(fn, args) {
  const key = JSON.stringify(args || {})
  const [state, setState] = useState({ data: null, error: '', loading: true })
  const load = useCallback(async () => {
    try {
      const data = await rpc(fn, JSON.parse(key))
      setState({ data, error: '', loading: false })
    } catch (e) {
      setState({ data: null, error: e.message, loading: false })
    }
  }, [fn, key])
  useEffect(() => {
    load()
  }, [load])
  return { ...state, reload: load }
}
