import { describe, expect, it } from 'vitest'
import { vehiclesReducer } from '../context/vehiclesReducer'

const base = [
  { id: 1, plate: 'A-1', make: 'Toyota', model: 'Hilux' },
  { id: 4, plate: 'B-2', make: 'Ford', model: 'Transit' },
]

describe('vehiclesReducer', () => {
  it('adds a vehicle with the next free id', () => {
    const next = vehiclesReducer(base, { type: 'add', vehicle: { plate: 'C-3' } })
    expect(next).toHaveLength(3)
    expect(next[2]).toMatchObject({ id: 5, plate: 'C-3' })
  })

  it('starts ids at 1 for an empty list', () => {
    expect(vehiclesReducer([], { type: 'add', vehicle: { plate: 'X' } })[0].id).toBe(1)
  })

  it('updates only the matching vehicle', () => {
    const next = vehiclesReducer(base, { type: 'update', vehicle: { id: 4, model: 'Custom' } })
    expect(next[1]).toMatchObject({ plate: 'B-2', model: 'Custom' })
    expect(next[0]).toEqual(base[0])
  })

  it('removes a vehicle by id', () => {
    const next = vehiclesReducer(base, { type: 'remove', id: 1 })
    expect(next.map((v) => v.id)).toEqual([4])
  })

  it('ignores unknown actions', () => {
    expect(vehiclesReducer(base, { type: 'nope' })).toBe(base)
  })
})
