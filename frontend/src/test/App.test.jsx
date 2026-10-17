import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { VehicleProvider } from '../context/VehicleContext'
import { validate } from '../components/VehicleForm'

const vehicles = [
  { id: 1, plate: 'ABC-1', make: 'Toyota', model: 'Hilux', year: 2022, mileage: 1000, driver: 'Ali', lastService: '', insuranceExpiry: '2099-01-01', status: 'Active' },
  { id: 2, plate: 'XYZ-2', make: 'Ford', model: 'Transit', year: 2020, mileage: 5000, driver: '', lastService: '', insuranceExpiry: '2099-01-01', status: 'Retired' },
]

function renderApp(path = '/vehicles') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <VehicleProvider initialVehicles={vehicles}>
        <App />
      </VehicleProvider>
    </MemoryRouter>,
  )
}

describe('navigation', () => {
  it('shows every menu item and opens the About page with team members', async () => {
    renderApp('/')
    const menu = screen.getByRole('navigation', { name: 'Main menu' })
    expect(screen.getByRole('heading', { name: 'Fleet Manager' })).toBeInTheDocument()
    for (const label of ['Home', 'Dashboard', 'Vehicles', 'Add Vehicle', 'About']) {
      expect(within(menu).getByRole('link', { name: label })).toBeInTheDocument()
    }
    await userEvent.click(within(menu).getByRole('link', { name: 'About' }))
    expect(screen.getByText('Fajer Alkhamash')).toBeInTheDocument()
    expect(screen.getByText('221511326')).toBeInTheDocument()
  })
})

describe('vehicles list', () => {
  it('displays vehicles and filters by search and status', async () => {
    renderApp()
    expect(screen.getByText('ABC-1')).toBeInTheDocument()
    expect(screen.getByText('XYZ-2')).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('Search vehicles'), 'toyota')
    expect(screen.queryByText('XYZ-2')).not.toBeInTheDocument()

    await userEvent.clear(screen.getByLabelText('Search vehicles'))
    await userEvent.selectOptions(screen.getByLabelText('Filter by status'), 'Retired')
    expect(screen.queryByText('ABC-1')).not.toBeInTheDocument()
    expect(screen.getByText('XYZ-2')).toBeInTheDocument()
  })

  it('deletes a vehicle after confirmation', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    renderApp()
    const row = screen.getByText('ABC-1').closest('tr')
    await userEvent.click(within(row).getByRole('button', { name: 'Delete' }))
    expect(screen.queryByText('ABC-1')).not.toBeInTheDocument()
  })

  it('keeps the vehicle when deletion is cancelled', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    renderApp()
    const row = screen.getByText('ABC-1').closest('tr')
    await userEvent.click(within(row).getByRole('button', { name: 'Delete' }))
    expect(screen.getByText('ABC-1')).toBeInTheDocument()
  })
})

describe('add and edit', () => {
  it('adds a new vehicle', async () => {
    renderApp('/vehicles/new')
    await userEvent.type(screen.getByLabelText('Plate number'), 'new-9')
    await userEvent.type(screen.getByLabelText('Make'), 'Kia')
    await userEvent.type(screen.getByLabelText('Model'), 'Sportage')
    await userEvent.click(screen.getByRole('button', { name: 'Add vehicle' }))
    expect(await screen.findByText('NEW-9')).toBeInTheDocument()
    expect(screen.getByText('Kia Sportage')).toBeInTheDocument()
  })

  it('shows validation errors and does not submit an empty form', async () => {
    renderApp('/vehicles/new')
    await userEvent.click(screen.getByRole('button', { name: 'Add vehicle' }))
    expect(screen.getByText('Plate number is required')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Add vehicle' })).toBeInTheDocument()
  })

  it('edits an existing vehicle', async () => {
    renderApp('/vehicles/1/edit')
    const driver = screen.getByLabelText('Assigned driver')
    await userEvent.clear(driver)
    await userEvent.type(driver, 'Mona')
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(await screen.findByText('Mona')).toBeInTheDocument()
  })

  it('shows a message for an unknown vehicle id', () => {
    renderApp('/vehicles/99/edit')
    expect(screen.getByText('Vehicle not found')).toBeInTheDocument()
  })
})

describe('validate', () => {
  it('accepts a complete vehicle', () => {
    expect(validate({ plate: 'A', make: 'B', model: 'C', year: 2020, mileage: 0 })).toEqual({})
  })

  it('rejects bad year and negative mileage', () => {
    const errors = validate({ plate: 'A', make: 'B', model: 'C', year: 1900, mileage: -5 })
    expect(errors).toHaveProperty('year')
    expect(errors).toHaveProperty('mileage')
  })
})
