import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Vehicles from './pages/Vehicles'
import VehicleFormPage from './pages/VehicleFormPage'
import About from './pages/About'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="vehicles" element={<Vehicles />} />
        <Route path="vehicles/new" element={<VehicleFormPage />} />
        <Route path="vehicles/:id/edit" element={<VehicleFormPage />} />
        <Route path="about" element={<About />} />
      </Route>
    </Routes>
  )
}
