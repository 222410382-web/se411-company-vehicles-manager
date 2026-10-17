import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useVehicles } from '../context/VehicleContext'
import StatusBadge from '../components/StatusBadge'
import { STATUSES } from '../data/seedVehicles'

export default function Vehicles() {
  const { vehicles, removeVehicle } = useVehicles()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')

  const q = query.trim().toLowerCase()
  const shown = vehicles.filter(
    (v) =>
      (status === 'All' || v.status === status) &&
      (!q || [v.plate, v.make, v.model, v.driver].some((t) => t.toLowerCase().includes(q))),
  )

  const handleDelete = (v) => {
    if (window.confirm(`Delete vehicle ${v.plate}?`)) removeVehicle(v.id)
  }

  return (
    <>
      <div className="page-head">
        <h1>Vehicles</h1>
        <Link to="/vehicles/new" className="btn primary">+ Add vehicle</Link>
      </div>
      <div className="filters">
        <input
          type="search"
          placeholder="Search plate, make, model, driver"
          aria-label="Search vehicles"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>All</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Plate</th><th>Vehicle</th><th>Year</th><th>Mileage</th>
              <th>Driver</th><th>Insurance</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((v) => (
              <tr key={v.id}>
                <td>{v.plate}</td>
                <td>{v.make} {v.model}</td>
                <td>{v.year}</td>
                <td>{v.mileage.toLocaleString('en-US')} km</td>
                <td>{v.driver || '—'}</td>
                <td>{v.insuranceExpiry || '—'}</td>
                <td><StatusBadge status={v.status} /></td>
                <td className="row-actions">
                  <Link to={`/vehicles/${v.id}/edit`} className="btn">Edit</Link>
                  <button className="btn danger" onClick={() => handleDelete(v)}>Delete</button>
                </td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr><td colSpan="8" className="empty">No vehicles found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
