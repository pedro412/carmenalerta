import { useState } from 'react'

type Filter = 'Todos' | 'Inundación' | 'Vialidad' | 'Apagón'

type Incident = {
  id: number
  title: string
  location: string
  age: string
  category: Exclude<Filter, 'Todos'>
}

const filters: Filter[] = ['Todos', 'Inundación', 'Vialidad', 'Apagón']

const incidents: Incident[] = [
  {
    id: 1,
    title: 'Encharcamiento fuerte',
    location: 'Av. Periférica · col. Aviación',
    age: '4 min',
    category: 'Inundación',
  },
  {
    id: 2,
    title: 'Choque, un carril cerrado',
    location: 'Puente Zacatal · sentido isla',
    age: '18 min',
    category: 'Vialidad',
  },
  {
    id: 3,
    title: 'Sin luz desde las 6',
    location: 'Col. Renovación',
    age: '1 h',
    category: 'Apagón',
  },
  {
    id: 4,
    title: 'Bloqueo por marcha',
    location: 'Calle 31 · centro',
    age: '2 h',
    category: 'Vialidad',
  },
  {
    id: 5,
    title: 'Poste dañado',
    location: 'Playa Norte',
    age: '3 h',
    category: 'Apagón',
  },
]

export function IncidentPanel() {
  const [activeFilter, setActiveFilter] = useState<Filter>('Todos')
  const [selectedId, setSelectedId] = useState(1)

  const visibleIncidents = incidents.filter(
    ({ category }) => activeFilter === 'Todos' || category === activeFilter,
  )

  return (
    <aside className="incident-panel" aria-label="Panel de incidentes">
      <nav className="filters" aria-label="Filtrar incidentes">
        {filters.map((filter) => (
          <button
            className={activeFilter === filter ? 'filter is-active' : 'filter'}
            key={filter}
            onClick={() => setActiveFilter(filter)}
            type="button"
          >
            {filter}
          </button>
        ))}
      </nav>

      <div className="incident-list" aria-live="polite">
        {visibleIncidents.map((incident) => (
          <button
            className={selectedId === incident.id ? 'incident is-selected' : 'incident'}
            key={incident.id}
            onClick={() => setSelectedId(incident.id)}
            type="button"
          >
            <span className="incident-copy">
              <strong>{incident.title}</strong>
              <span>{incident.location}</span>
            </span>
            <time>{incident.age}</time>
          </button>
        ))}

        {visibleIncidents.length === 0 && (
          <p className="empty-state">No hay incidentes en esta categoría.</p>
        )}
      </div>
    </aside>
  )
}
