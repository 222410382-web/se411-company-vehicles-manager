import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useVehicles } from '../context/VehicleContext'
import VehicleForm from '../components/VehicleForm'

export default function VehicleFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getVehicle, addVehicle, updateVehicle } = useVehicles()
  const editing = id !== undefined
  const [existing, setExisting] = useState(undefined)
  const [loadState, setLoadState] = useState(editing ? 'loading' : 'ready')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!editing) return undefined
    let cancelled = false
    getVehicle(id)
      .then((v) => {
        if (cancelled) return
        setExisting(v)
        setLoadState('ready')
      })
      .catch((e) => {
        if (cancelled) return
        setError(e.message)
        setLoadState(e.status === 404 ? 'notFound' : 'failed')
      })
    return () => {
      cancelled = true
    }
  }, [editing, id, getVehicle])

  if (loadState === 'loading') return <p>Loading…</p>

  if (loadState === 'notFound') {
    return (
      <>
        <h1>Vehicle not found</h1>
        <Link to="/vehicles">Back to vehicles</Link>
      </>
    )
  }

  if (loadState === 'failed') {
    return (
      <>
        <h1>Could not load vehicle</h1>
        <p className="error" role="alert">{error}</p>
        <Link to="/vehicles">Back to vehicles</Link>
      </>
    )
  }

  const handleSubmit = async (vehicle) => {
    try {
      if (editing) await updateVehicle({ ...vehicle, id: existing.id })
      else await addVehicle(vehicle)
      navigate('/vehicles')
    } catch (e) {
      const details = Object.values(e.fieldErrors ?? {}).join(', ')
      setError(details ? `${e.message}: ${details}` : e.message)
    }
  }

  return (
    <>
      <h1>{editing ? `Edit ${existing.plate}` : 'Add vehicle'}</h1>
      {error && <p className="error" role="alert">{error}</p>}
      <VehicleForm initial={existing} onSubmit={handleSubmit} submitLabel={editing ? 'Save changes' : 'Add vehicle'} />
    </>
  )
}
