export const STATUSES = ['Active', 'In Maintenance', 'Retired']

export const seedVehicles = [
  { id: 1, plate: 'ABC-1234', make: 'Toyota', model: 'Hilux', year: 2022, mileage: 41200, driver: 'Khalid Alharbi', lastService: '2026-08-14', insuranceExpiry: '2027-03-01', status: 'Active' },
  { id: 2, plate: 'DKR-5521', make: 'Ford', model: 'Transit', year: 2020, mileage: 98750, driver: 'Sara Alotaibi', lastService: '2026-06-02', insuranceExpiry: '2026-12-20', status: 'Active' },
  { id: 3, plate: 'HJL-7788', make: 'Nissan', model: 'Patrol', year: 2019, mileage: 132400, driver: 'Omar Alqahtani', lastService: '2026-09-25', insuranceExpiry: '2027-01-15', status: 'In Maintenance' },
  { id: 4, plate: 'RYD-3090', make: 'Hyundai', model: 'Accent', year: 2023, mileage: 18300, driver: 'Noura Alsaleh', lastService: '2026-07-18', insuranceExpiry: '2027-05-30', status: 'Active' },
  { id: 5, plate: 'QSM-4412', make: 'Mercedes-Benz', model: 'Sprinter', year: 2017, mileage: 245000, driver: '', lastService: '2025-11-09', insuranceExpiry: '2026-02-10', status: 'Retired' },
]
