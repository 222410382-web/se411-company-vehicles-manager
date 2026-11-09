import { describe, expect, it, vi } from 'vitest'
import { ApiError, vehiclesApi } from '../api/vehiclesApi'

function mockFetch(status, body) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('vehiclesApi', () => {
  it('list sends paging and filter params and normalises null dates', async () => {
    const fetchMock = mockFetch(200, {
      content: [{ id: 1, lastService: null, insuranceExpiry: '2027-01-01' }],
      page: 1, size: 5, totalElements: 6, totalPages: 2,
    })

    const result = await vehiclesApi.list({ page: 1, size: 5, q: 'toy', status: 'Active' })

    expect(fetchMock.mock.calls[0][0]).toBe('/api/vehicles?page=1&size=5&q=toy&status=Active')
    expect(result.totalPages).toBe(2)
    expect(result.content[0]).toMatchObject({ lastService: '', insuranceExpiry: '2027-01-01' })
  })

  it('get requests a single vehicle by id', async () => {
    const fetchMock = mockFetch(200, { id: 4, plate: 'A-1' })
    expect(await vehiclesApi.get(4)).toMatchObject({ id: 4, plate: 'A-1' })
    expect(fetchMock.mock.calls[0][0]).toBe('/api/vehicles/4')
  })

  it('create POSTs the vehicle with empty dates sent as null', async () => {
    const fetchMock = mockFetch(201, { id: 9, plate: 'N-1', lastService: null, insuranceExpiry: null })

    await vehiclesApi.create({ plate: 'N-1', lastService: '', insuranceExpiry: '' })

    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/vehicles')
    expect(options.method).toBe('POST')
    expect(JSON.parse(options.body)).toEqual({ plate: 'N-1', lastService: null, insuranceExpiry: null })
  })

  it('update PUTs to the vehicle id', async () => {
    const fetchMock = mockFetch(200, { id: 2, plate: 'U-1' })
    await vehiclesApi.update(2, { id: 2, plate: 'U-1' })
    expect(fetchMock.mock.calls[0][0]).toBe('/api/vehicles/2')
    expect(fetchMock.mock.calls[0][1].method).toBe('PUT')
  })

  it('remove sends DELETE and tolerates the empty 204 response', async () => {
    const fetchMock = mockFetch(204, undefined)
    await expect(vehiclesApi.remove(3)).resolves.toBeUndefined()
    expect(fetchMock.mock.calls[0][0]).toBe('/api/vehicles/3')
    expect(fetchMock.mock.calls[0][1].method).toBe('DELETE')
  })

  it('turns error responses into ApiError with field errors', async () => {
    mockFetch(400, { message: 'Validation failed', errors: { plate: 'Plate number is required' } })

    await expect(vehiclesApi.create({})).rejects.toMatchObject({
      name: 'ApiError',
      status: 400,
      message: 'Validation failed',
      fieldErrors: { plate: 'Plate number is required' },
    })
  })

  it('reports a 404 with its status', async () => {
    mockFetch(404, { message: 'Vehicle 9 not found' })
    const error = await vehiclesApi.get(9).catch((e) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(404)
  })

  it('reports an unreachable server', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    await expect(vehiclesApi.list()).rejects.toMatchObject({ status: 0, message: expect.stringMatching(/backend running/) })
  })
})
