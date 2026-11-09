import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { ApiError } from '../api/vehiclesApi'
import { VehicleProvider } from '../context/VehicleContext'
import { validate } from '../components/VehicleForm'
import { createFakeApi } from './fakeApi'

const vehicles = [
  { id: 1, plate: 'ABC-1', make: 'Toyota', model: 'Hilux', year: 2022, mileage: 1000, driver: 'Ali', lastService: '', insuranceExpiry: '2099-01-01', status: 'Active' },
  { id: 2, plate: 'XYZ-2', make: 'Ford', model: 'Transit', year: 2020, mileage: 5000, driver: '', lastService: '', insuranceExpiry: '2099-01-01', status: 'Retired' },
]

function renderApp(path = '/vehicles', api = createFakeApi(vehicles)) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <VehicleProvider api={api}>
        <App />
      </VehicleProvider>
    </MemoryRouter>,
  )
  return api
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
  it('displays vehicles fetched from the API and filters by search and status', async () => {
    const api = renderApp()
    expect(await screen.findByText('ABC-1')).toBeInTheDocument()
    expect(screen.getByText('XYZ-2')).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('Search vehicles'), 'toyota')
    await waitFor(() => expect(screen.queryByText('XYZ-2')).not.toBeInTheDocument())
    expect(api.list).toHaveBeenLastCalledWith(expect.objectContaining({ q: 'toyota' }))

    await userEvent.clear(screen.getByLabelText('Search vehicles'))
    await userEvent.selectOptions(screen.getByLabelText('Filter by status'), 'Retired')
    await waitFor(() => expect(screen.queryByText('ABC-1')).not.toBeInTheDocument())
    expect(screen.getByText('XYZ-2')).toBeInTheDocument()
  })

  it('paginates the list', async () => {
    const many = Array.from({ length: 7 }, (_, i) => ({
      ...vehicles[0], id: i + 1, plate: `CAR-${i + 1}`, make: 'Kia',
    }))
    renderApp('/vehicles', createFakeApi(many))

    expect(await screen.findByText('CAR-1')).toBeInTheDocument()
    expect(screen.getByText('CAR-5')).toBeInTheDocument()
    expect(screen.queryByText('CAR-6')).not.toBeInTheDocument()
    expect(screen.getByText('Page 1 of 2 (7 vehicles)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(await screen.findByText('CAR-6')).toBeInTheDocument()
    expect(screen.queryByText('CAR-1')).not.toBeInTheDocument()
    expect(screen.getByText('Page 2 of 2 (7 vehicles)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
  })

  it('shows an error when the backend cannot be reached', async () => {
    const api = createFakeApi(vehicles)
    api.list.mockRejectedValue(new ApiError('Cannot reach the server. Is the backend running?', 0))
    renderApp('/vehicles', api)
    expect((await screen.findAllByText(/Cannot reach the server/))[0]).toBeInTheDocument()
  })

  it('deletes a vehicle after confirmation', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const api = renderApp()
    const row = (await screen.findByText('ABC-1')).closest('tr')
    await userEvent.click(within(row).getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(screen.queryByText('ABC-1')).not.toBeInTheDocument())
    expect(api.remove).toHaveBeenCalledWith(1)
  })

  it('keeps the vehicle when deletion is cancelled', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    const api = renderApp()
    const row = (await screen.findByText('ABC-1')).closest('tr')
    await userEvent.click(within(row).getByRole('button', { name: 'Delete' }))
    expect(screen.getByText('ABC-1')).toBeInTheDocument()
    expect(api.remove).not.toHaveBeenCalled()
  })
})

describe('dashboard', () => {
  it('summarises vehicles by status from the API', async () => {
    renderApp('/dashboard')
    expect(await screen.findByText('Total vehicles')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('Total vehicles').nextSibling).toHaveTextContent('2'))
  })
})

describe('add and edit', () => {
  it('adds a new vehicle through the API', async () => {
    const api = renderApp('/vehicles/new')
    await userEvent.type(screen.getByLabelText('Plate number'), 'new-9')
    await userEvent.type(screen.getByLabelText('Make'), 'Kia')
    await userEvent.type(screen.getByLabelText('Model'), 'Sportage')
    await userEvent.click(screen.getByRole('button', { name: 'Add vehicle' }))
    expect(await screen.findByText('NEW-9')).toBeInTheDocument()
    expect(screen.getByText('Kia Sportage')).toBeInTheDocument()
    expect(api.create).toHaveBeenCalledWith(expect.objectContaining({ plate: 'NEW-9', make: 'Kia' }))
  })

  it('shows validation errors and does not submit an empty form', async () => {
    const api = renderApp('/vehicles/new')
    await userEvent.click(screen.getByRole('button', { name: 'Add vehicle' }))
    expect(screen.getByText('Plate number is required')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Add vehicle' })).toBeInTheDocument()
    expect(api.create).not.toHaveBeenCalled()
  })

  it('shows the server error and stays on the form when saving fails', async () => {
    const api = createFakeApi(vehicles)
    api.create.mockRejectedValue(new ApiError('Validation failed', 400, { year: 'Enter a valid year' }))
    renderApp('/vehicles/new', api)
    await userEvent.type(screen.getByLabelText('Plate number'), 'a-1')
    await userEvent.type(screen.getByLabelText('Make'), 'Kia')
    await userEvent.type(screen.getByLabelText('Model'), 'Rio')
    await userEvent.click(screen.getByRole('button', { name: 'Add vehicle' }))
    expect(await screen.findByText('Validation failed: Enter a valid year')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Add vehicle' })).toBeInTheDocument()
  })

  it('loads an existing vehicle by id and edits it', async () => {
    const api = renderApp('/vehicles/1/edit')
    const driver = await screen.findByLabelText('Assigned driver')
    expect(api.get).toHaveBeenCalledWith('1')
    await userEvent.clear(driver)
    await userEvent.type(driver, 'Mona')
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(await screen.findByText('Mona')).toBeInTheDocument()
    expect(api.update).toHaveBeenCalledWith(1, expect.objectContaining({ driver: 'Mona' }))
  })

  it('shows a message for an unknown vehicle id', async () => {
    renderApp('/vehicles/99/edit')
    expect(await screen.findByText('Vehicle not found')).toBeInTheDocument()
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
