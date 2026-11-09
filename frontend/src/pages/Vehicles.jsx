import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useVehicles } from '../context/VehicleContext'
import StatusBadge from '../components/StatusBadge'
import { STATUSES } from '../data/statuses'

const PAGE_SIZE = 5

export default function Vehicles() {
  const { listVehicles, removeVehicle, version } = useVehicles()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')
  const [page, setPage] = useState(0)
  const [result, setResult] = useState({ content: [], totalElements: 0, totalPages: 0 })
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    listVehicles({ page, size: PAGE_SIZE, q: query.trim(), status })
      .then((r) => {
        if (cancelled) return
        if (r.content.length === 0 && page > 0) setPage(page - 1) // last row of the last page was deleted
        else {
          setResult(r)
          setError(null)
        }
      })
      .catch((e) => !cancelled && setError(e.message))
    return () => {
      cancelled = true
    }
  }, [listVehicles, page, query, status, version])

  const handleDelete = async (v) => {
    if (!window.confirm(`Delete vehicle ${v.plate}?`)) return
    try {
      await removeVehicle(v.id)
    } catch (e) {
      setError(e.message)
    }
  }

  const { content: shown, totalElements, totalPages } = result

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
          onChange={(e) => {
            setQuery(e.target.value)
            setPage(0)
          }}
        />
        <select
          aria-label="Filter by status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value)
            setPage(0)
          }}
        >
          <option>All</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      {error && <p className="error" role="alert">{error}</p>}
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
      <nav className="pagination" aria-label="Pagination">
        <button className="btn" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button>
        <span>Page {totalPages === 0 ? 0 : page + 1} of {totalPages} ({totalElements} vehicles)</span>
        <button className="btn" disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
      </nav>
    </>
  )
}
