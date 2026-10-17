import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { VehicleProvider } from './context/VehicleContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <VehicleProvider>
        <App />
      </VehicleProvider>
    </BrowserRouter>
  </StrictMode>,
)
