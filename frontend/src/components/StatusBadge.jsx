const classFor = { Active: 'ok', 'In Maintenance': 'warn', Retired: 'muted' }

export default function StatusBadge({ status }) {
  return <span className={`badge ${classFor[status] ?? 'muted'}`}>{status}</span>
}
