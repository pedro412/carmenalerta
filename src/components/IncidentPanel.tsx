import { reportFilters } from '../data/filters'
import type { ReportFilter } from '../data/filters'
import type { Report } from '../types'
import { formatReportAge } from '../utils/formatReportAge'

type IncidentPanelProps = {
  reports: Report[]
  activeFilter: ReportFilter
  selectedId: string | null
  now: number
  onFilterChange: (filter: ReportFilter) => void
  onSelectReport: (id: string) => void
  alertsEnabled?: boolean
  setAlertsEnabled?: (val: boolean) => void
  showRadius?: boolean
  setShowRadius?: (val: boolean) => void
  handleSimulateNewReport?: () => void
  userLocation?: {lat: number, lng: number} | null
  incidentsInsideCount?: number
  radiusKm?: number
}

export function IncidentPanel({
  reports,
  activeFilter,
  selectedId,
  now,
  onFilterChange,
  onSelectReport,
  alertsEnabled,
  setAlertsEnabled,
  showRadius,
  setShowRadius,
  handleSimulateNewReport,
  userLocation,
  incidentsInsideCount,
  radiusKm
}: IncidentPanelProps) {

  return (
    <aside className="incident-panel" aria-label="Panel de incidentes" style={{ overflowY: 'auto' }}>
      
      {setAlertsEnabled && (
        <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #e2e2df' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 12px 0' }}>Ajustes de Alertas</h2>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.95rem', cursor: 'pointer', marginBottom: 8 }}>
            <input 
              type="checkbox" 
              checked={alertsEnabled} 
              onChange={(e) => setAlertsEnabled(e.target.checked)} 
            />
            Alertas por cercanía
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.95rem', cursor: 'pointer', marginBottom: 12 }}>
            <input 
              type="checkbox" 
              checked={showRadius} 
              onChange={(e) => setShowRadius?.(e.target.checked)} 
            />
            Mostrar radio ({radiusKm} km)
          </label>
          <button 
            onClick={handleSimulateNewReport}
            style={{ width: '100%', padding: '8px 12px', background: '#155697', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}
          >
            Simular Nuevo Reporte
          </button>

          {userLocation && (
            <div style={{ marginTop: 12, padding: 12, background: '#f0f9ff', borderRadius: 8, border: '1px solid #bae6fd', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, marginBottom: 4, color: '#0369a1' }}>
                <span>📍</span> Ubicación activa
              </div>
              <p style={{ margin: 0, color: '#075985' }}>{incidentsInsideCount} incidente(s) a menos de {radiusKm} km</p>
            </div>
          )}
        </div>
      )}

      <nav className="filters" aria-label="Filtrar incidentes">
        {reportFilters.map((filter) => (
          <button
            className={activeFilter === filter ? 'filter is-active' : 'filter'}
            key={filter}
            onClick={() => onFilterChange(filter)}
            type="button"
          >
            {filter}
          </button>
        ))}
      </nav>

      <div className="incident-list" aria-live="polite">
        {reports.map((report) => (
          <button
            className={selectedId === report.id ? 'incident is-selected' : 'incident'}
            key={report.id}
            onClick={() => onSelectReport(report.id)}
            type="button"
          >
            <span className="incident-copy">
              <strong>{report.description}</strong>
              <span>{report.location}</span>
            </span>
            <time dateTime={report.createdAt}>{formatReportAge(report.createdAt, now)}</time>
          </button>
        ))}

        {reports.length === 0 && (
          <p className="empty-state">No hay incidentes en esta categoría.</p>
        )}
      </div>
    </aside>
  )
}
