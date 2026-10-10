import { reportFilters } from '../data/filters'
import type { ReportFilter } from '../data/filters'
import type { Category, Report, ReportVote, User, VoteType } from '../types'
import { formatReportAge } from '../utils/formatReportAge'
import { reportStatusLabels } from '../lib/reportStatus'
import { IncidentDetail } from './IncidentDetail'

type IncidentPanelProps = {
  reports: Report[]
  categories: Category[]
  votes: ReportVote[]
  users: User[]
  currentUserId: User['id']
  activeFilter: ReportFilter
  selectedId: string | null
  now: number
  onFilterChange: (filter: ReportFilter) => void
  onSelectReport: (id: string) => void
  onBack: () => void
  onVote: (voteType: VoteType) => void
}

export function IncidentPanel({
  reports,
  categories,
  votes,
  users,
  currentUserId,
  activeFilter,
  selectedId,
  now,
  onFilterChange,
  onSelectReport,
  onBack,
  onVote,
}: IncidentPanelProps) {
  const selectedReport = reports.find((report) => report.id === selectedId)

  if (selectedReport) {
    return (
      <aside className="incident-panel has-detail" aria-label="Detalle del incidente">
        <IncidentDetail
          report={selectedReport}
          category={categories.find((category) => category.id === selectedReport.categoryId)}
          votes={votes}
          users={users}
          currentUserId={currentUserId}
          onBack={onBack}
          onVote={onVote}
        />
      </aside>
    )
  }

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
              <small className={`list-status list-status--${report.status}`}>
                {reportStatusLabels[report.status]}
              </small>
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
