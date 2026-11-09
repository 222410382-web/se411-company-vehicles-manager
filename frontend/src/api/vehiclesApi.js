const BASE = '/api/vehicles'

export class ApiError extends Error {
  constructor(message, status, fieldErrors = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

// The form uses '' for "no date"; the backend expects null.
const toPayload = (v) => ({
  ...v,
  lastService: v.lastService || null,
  insuranceExpiry: v.insuranceExpiry || null,
})

const fromServer = (v) => ({
  ...v,
  lastService: v.lastService ?? '',
  insuranceExpiry: v.insuranceExpiry ?? '',
})

async function request(path = '', options = {}) {
  let res
  try {
    res = await fetch(BASE + path, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
  } catch {
    throw new ApiError('Cannot reach the server. Is the backend running?', 0)
  }
  if (res.status === 204) return null
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new ApiError(body?.message ?? `Request failed (${res.status})`, res.status, body?.errors)
  }
  return body
}

/** The only code that knows about the REST API (see docs/architecture.md). */
export const vehiclesApi = {
  async list({ page = 0, size = 10, q = '', status = 'All' } = {}) {
    const params = new URLSearchParams({ page, size, q, status })
    const result = await request(`?${params}`)
    return { ...result, content: result.content.map(fromServer) }
  },
  async get(id) {
    return fromServer(await request(`/${id}`))
  },
  async create(vehicle) {
    return fromServer(await request('', { method: 'POST', body: JSON.stringify(toPayload(vehicle)) }))
  },
  async update(id, vehicle) {
    return fromServer(await request(`/${id}`, { method: 'PUT', body: JSON.stringify(toPayload(vehicle)) }))
  },
  async remove(id) {
    await request(`/${id}`, { method: 'DELETE' })
  },
}
