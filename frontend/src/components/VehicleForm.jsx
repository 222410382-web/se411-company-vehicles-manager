import { useState } from 'react'
import { STATUSES } from '../data/seedVehicles'

const empty = {
  plate: '', make: '', model: '', year: new Date().getFullYear(), mileage: 0,
  driver: '', lastService: '', insuranceExpiry: '', status: 'Active',
}

export function validate(v) {
  const errors = {}
  if (!v.plate.trim()) errors.plate = 'Plate number is required'
  if (!v.make.trim()) errors.make = 'Make is required'
  if (!v.model.trim()) errors.model = 'Model is required'
  const year = Number(v.year)
  if (!Number.isInteger(year) || year < 1980 || year > new Date().getFullYear() + 1) {
    errors.year = 'Enter a valid year'
  }
  if (v.mileage === '' || Number(v.mileage) < 0) errors.mileage = 'Mileage must be 0 or more'
  return errors
}

export default function VehicleForm({ initial, onSubmit, submitLabel }) {
  const [values, setValues] = useState({ ...empty, ...initial })
  const [errors, setErrors] = useState({})

  const set = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length === 0) {
      onSubmit({
        ...values,
        plate: values.plate.trim().toUpperCase(),
        make: values.make.trim(),
        model: values.model.trim(),
        driver: values.driver.trim(),
        year: Number(values.year),
        mileage: Number(values.mileage),
      })
    }
  }

  const field = (name, label, props = {}) => (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} value={values[name]} onChange={set} aria-invalid={!!errors[name]} {...props} />
      {errors[name] && <span className="error" role="alert">{errors[name]}</span>}
    </div>
  )

  return (
    <form className="card form-grid" onSubmit={handleSubmit} noValidate>
      {field('plate', 'Plate number')}
      {field('make', 'Make')}
      {field('model', 'Model')}
      {field('year', 'Year', { type: 'number' })}
      {field('mileage', 'Mileage (km)', { type: 'number' })}
      {field('driver', 'Assigned driver')}
      {field('lastService', 'Last service', { type: 'date' })}
      {field('insuranceExpiry', 'Insurance expiry', { type: 'date' })}
      <div className="field">
        <label htmlFor="status">Status</label>
        <select id="status" name="status" value={values.status} onChange={set}>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div className="actions">
        <button type="submit" className="btn primary">{submitLabel}</button>
      </div>
    </form>
  )
}
