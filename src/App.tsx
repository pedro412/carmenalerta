import './App.css'

const incidentes = [
  { tipo: 'Inundación', detalle: 'Av. Central', estado: 'Evita la zona', color: 'rojo' },
  { tipo: 'Tráfico', detalle: 'Puente Zacatal', estado: 'Tránsito lento', color: 'naranja' },
  { tipo: 'Sin luz', detalle: 'Col. Centro', estado: 'Reporte activo', color: 'gris' },
] as const

function App() {
  return (
    <main className="app-shell">
      <header className="hero">
        <span className="eyebrow">Ciudad del Carmen · Comunidad en alerta</span>
        <h1>Carmen Alerta</h1>
        <p>
          Consulta y comparte reportes de inundaciones, tráfico y cortes de luz
          en tiempo real.
        </p>
        <button type="button">Crear un reporte</button>
      </header>

      <section aria-labelledby="incidentes-title" className="incidents">
        <div className="section-heading">
          <div>
            <span>Ahora mismo</span>
            <h2 id="incidentes-title">Incidentes cercanos</h2>
          </div>
          <strong>{incidentes.length} activos</strong>
        </div>

        <div className="incident-grid">
          {incidentes.map((incidente) => (
            <article className="incident-card" key={incidente.tipo}>
              <span className={`status-dot ${incidente.color}`} aria-hidden="true" />
              <div>
                <h3>{incidente.tipo}</h3>
                <p>{incidente.detalle}</p>
              </div>
              <small>{incidente.estado}</small>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default App
