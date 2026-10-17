import { createContext, useContext, useMemo, useReducer } from 'react'
import { seedVehicles } from '../data/seedVehicles'
import { vehiclesReducer } from './vehiclesReducer'

const VehicleContext = createContext(null)

export function VehicleProvider({ children, initialVehicles = seedVehicles }) {
  const [vehicles, dispatch] = useReducer(vehiclesReducer, initialVehicles)

  const api = useMemo(
    () => ({
      vehicles,
      addVehicle: (vehicle) => dispatch({ type: 'add', vehicle }),
      updateVehicle: (vehicle) => dispatch({ type: 'update', vehicle }),
      removeVehicle: (id) => dispatch({ type: 'remove', id }),
    }),
    [vehicles],
  )

  return <VehicleContext.Provider value={api}>{children}</VehicleContext.Provider>
}

export function useVehicles() {
  const ctx = useContext(VehicleContext)
  if (!ctx) throw new Error('useVehicles must be used inside <VehicleProvider>')
  return ctx
}
