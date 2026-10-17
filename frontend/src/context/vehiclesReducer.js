export function vehiclesReducer(state, action) {
  switch (action.type) {
    case 'add': {
      const id = state.reduce((max, v) => Math.max(max, v.id), 0) + 1
      return [...state, { ...action.vehicle, id }]
    }
    case 'update':
      return state.map((v) => (v.id === action.vehicle.id ? { ...v, ...action.vehicle } : v))
    case 'remove':
      return state.filter((v) => v.id !== action.id)
    default:
      return state
  }
}
