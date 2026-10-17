import { Link } from 'react-router-dom'

const features = [
  { title: 'Track every vehicle', text: 'Keep plate, make, model, year, mileage, driver and status for the whole fleet in one place.' },
  { title: 'Stay ahead of insurance', text: 'The dashboard flags vehicles whose insurance has expired or expires within 30 days.' },
  { title: 'Full control of the data', text: 'Add, view, search, filter, edit and delete vehicles from simple, validated forms.' },
]

export default function Home() {
  return (
    <>
      <section className="hero card">
        <div>
          <h1>Fleet Manager</h1>
          <p className="lead">
            A web app that helps a company manage its vehicles: who drives what, what condition it is in,
            and when its insurance runs out.
          </p>
          <div className="hero-actions">
            <Link to="/vehicles" className="btn primary">View vehicles</Link>
            <Link to="/vehicles/new" className="btn">Add a vehicle</Link>
          </div>
        </div>
        <img
          className="hero-art"
          src="/vehicle-management.png"
          alt="Illustration of a team inspecting and servicing a company car"
        />
      </section>

      <section className="cards">
        {features.map((f) => (
          <div className="card" key={f.title}>
            <h2>{f.title}</h2>
            <p>{f.text}</p>
          </div>
        ))}
      </section>

      <section className="card">
        <h2>About the project</h2>
        <p>
          Built for SE411 (Fall 2026-27), Part 1. This part is a React frontend that keeps its data in an
          in-memory collection of objects, so changes are reset when the page is reloaded. A backend and
          database are added in Part 2.
        </p>
        <p>
          Built with React, Vite and React Router. See the <Link to="/about">About page</Link> for the team.
        </p>
      </section>
    </>
  )
}
