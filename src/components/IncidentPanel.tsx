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
}

export function IncidentPanel({
  reports,
  activeFilter,
  selectedId,
  now,
  onFilterChange,
  onSelectReport,
}: IncidentPanelProps) {

  return (
    <aside className="incident-panel" aria-label="Panel de incidentes">
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
