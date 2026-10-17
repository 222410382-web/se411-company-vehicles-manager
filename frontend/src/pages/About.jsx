const team = [
  { name: 'Fajer Alkhamash', id: '221410091' },
  { name: 'Asayil Alluhib', id: '222410382' },
  { name: 'Haifa Alajlan', id: '222410267' },
  { name: 'Nisreen Almutairi', id: '221511326' },
]

export default function About() {
  return (
    <>
      <h1>About</h1>
      <p>
        Fleet Manager is a company vehicle asset management app built for SE411 (Fall 2026-27), Part 1.
      </p>
      <h2>Our team</h2>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Student ID</th></tr></thead>
          <tbody>
            {team.map((m) => (
              <tr key={m.id}><td>{m.name}</td><td>{m.id}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
