import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { vehiclesApi } from '../api/vehiclesApi'

const VehicleContext = createContext(null)

// Enough for the dashboard, which summarises the whole fleet.
const ALL = { page: 0, size: 1000 }

export function VehicleProvider({ children, api = vehiclesApi }) {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // Bumped after every change so pages that fetch their own data can refetch.
  const [version, setVersion] = useState(0)

  const refresh = useCallback(async () => {
    try {
      const result = await api.list(ALL)
      setVehicles(result.content)
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
      setVersion((n) => n + 1)
    }
  }, [api])

  useEffect(() => {
    refresh()
  }, [refresh])

  const value = useMemo(
    () => ({
      vehicles,
      loading,
      error,
      version,
      listVehicles: (params) => api.list(params),
      getVehicle: (id) => api.get(id),
      addVehicle: async (vehicle) => {
        const created = await api.create(vehicle)
        await refresh()
        return created
      },
      updateVehicle: async (vehicle) => {
        const updated = await api.update(vehicle.id, vehicle)
        await refresh()
        return updated
      },
      removeVehicle: async (id) => {
        await api.remove(id)
        await refresh()
      },
    }),
    [api, vehicles, loading, error, version, refresh],
  )

  return <VehicleContext.Provider value={value}>{children}</VehicleContext.Provider>
}

export function useVehicles() {
  const ctx = useContext(VehicleContext)
  if (!ctx) throw new Error('useVehicles must be used inside <VehicleProvider>')
  return ctx
}
