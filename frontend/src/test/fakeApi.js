import { vi } from 'vitest'
import { ApiError } from '../api/vehiclesApi'

/** In-memory stand-in for vehiclesApi, with the same paging/search behaviour as the backend. */
export function createFakeApi(initial = []) {
  let rows = initial.map((v) => ({ ...v }))
  let nextId = rows.reduce((max, v) => Math.max(max, v.id), 0) + 1
  const find = (id) => rows.find((v) => v.id === Number(id))

  return {
    list: vi.fn(async ({ page = 0, size = 10, q = '', status = 'All' } = {}) => {
      const needle = q.toLowerCase()
      const matches = rows.filter(
        (v) =>
          (status === 'All' || v.status === status) &&
          (!needle || [v.plate, v.make, v.model, v.driver].some((t) => t.toLowerCase().includes(needle))),
      )
      return {
        content: matches.slice(page * size, (page + 1) * size).map((v) => ({ ...v })),
        page,
        size,
        totalElements: matches.length,
        totalPages: Math.ceil(matches.length / size),
      }
    }),
    get: vi.fn(async (id) => {
      const v = find(id)
      if (!v) throw new ApiError(`Vehicle ${id} not found`, 404)
      return { ...v }
    }),
    create: vi.fn(async (vehicle) => {
      const created = { ...vehicle, id: nextId++ }
      rows.push(created)
      return { ...created }
    }),
    update: vi.fn(async (id, vehicle) => {
      const v = find(id)
      if (!v) throw new ApiError(`Vehicle ${id} not found`, 404)
      Object.assign(v, vehicle, { id: v.id })
      return { ...v }
    }),
    remove: vi.fn(async (id) => {
      if (!find(id)) throw new ApiError(`Vehicle ${id} not found`, 404)
      rows = rows.filter((v) => v.id !== Number(id))
    }),
  }
}
