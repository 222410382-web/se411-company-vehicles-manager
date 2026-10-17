import { Link, useNavigate, useParams } from 'react-router-dom'
import { useVehicles } from '../context/VehicleContext'
import VehicleForm from '../components/VehicleForm'

export default function VehicleFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { vehicles, addVehicle, updateVehicle } = useVehicles()
  const editing = id !== undefined
  const existing = editing ? vehicles.find((v) => v.id === Number(id)) : undefined

  if (editing && !existing) {
    return (
      <>
        <h1>Vehicle not found</h1>
        <Link to="/vehicles">Back to vehicles</Link>
      </>
    )
  }

  const handleSubmit = (vehicle) => {
    if (editing) updateVehicle({ ...vehicle, id: existing.id })
    else addVehicle(vehicle)
    navigate('/vehicles')
  }

  return (
    <>
      <h1>{editing ? `Edit ${existing.plate}` : 'Add vehicle'}</h1>
      <VehicleForm initial={existing} onSubmit={handleSubmit} submitLabel={editing ? 'Save changes' : 'Add vehicle'} />
    </>
  )
}
