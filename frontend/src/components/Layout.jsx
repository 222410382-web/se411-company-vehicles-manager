import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/vehicles', label: 'Vehicles', end: true },
  { to: '/vehicles/new', label: 'Add Vehicle' },
  { to: '/about', label: 'About' },
]

export default function Layout() {
  return (
    <>
      <header className="topbar">
        <span className="brand">Fleet Manager</span>
        <nav aria-label="Main menu">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}>
              {l.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="container">
        <Outlet />
      </main>
      <footer className="footer">
        <span>© {new Date().getFullYear()} Fleet Manager. All rights reserved.</span>
      </footer>
    </>
  )
}
