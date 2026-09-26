import { isActiveReport } from '../data/filters'
import type { Report } from '../types'

function BellIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
    </svg>
  )
}

type TopBarProps = { reports: Report[] }

export function TopBar({ reports }: TopBarProps) {
  const activeReports = reports.filter(isActiveReport)
  const criticalCount = activeReports.filter((report) => report.severity === 'high').length

  return (
    <header className="top-bar">
      <div className="brand">
        <BellIcon />
        <strong>Alertas Carmen</strong>
        <span>en vivo</span>
      </div>

      <div className="top-actions">
        <span className="summary summary--critical">{criticalCount} críticos</span>
        <span className="summary">{activeReports.length} activos</span>
        <button className="report-button" type="button">
          <span aria-hidden="true">＋</span>
          Reportar
        </button>
        <button className="more-button" type="button" aria-label="Más opciones">
          •••
        </button>
      </div>
    </header>
  )
}
