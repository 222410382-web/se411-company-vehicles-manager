import { Link } from 'react-router-dom'
import { useVehicles } from '../context/VehicleContext'
import { STATUSES } from '../data/seedVehicles'

const DAY = 86400000

export default function Dashboard() {
  const { vehicles } = useVehicles()
  const soon = Date.now() + 30 * DAY
  const expiring = vehicles.filter(
    (v) => v.status !== 'Retired' && v.insuranceExpiry && new Date(v.insuranceExpiry).getTime() <= soon,
  )

  return (
    <>
      <h1>Dashboard</h1>
      <section className="cards">
        <div className="card stat"><span>Total vehicles</span><strong>{vehicles.length}</strong></div>
        {STATUSES.map((s) => (
          <div className="card stat" key={s}>
            <span>{s}</span>
            <strong>{vehicles.filter((v) => v.status === s).length}</strong>
          </div>
        ))}
      </section>
      <section className="card">
        <h2>Insurance expired or expiring within 30 days</h2>
        {expiring.length === 0 ? (
          <p>No vehicles need attention.</p>
        ) : (
          <ul>
            {expiring.map((v) => (
              <li key={v.id}>
                <Link to={`/vehicles/${v.id}/edit`}>{v.plate}</Link> – {v.make} {v.model}, expires {v.insuranceExpiry}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
