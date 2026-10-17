import { useEffect, useState } from 'react'
import { IncidentPanel } from './components/IncidentPanel'
import { MapView } from './components/MapView'
import { TopBar } from './components/TopBar'
import { categories } from './data/categories'
import { initialReports } from './data/reports'
import { isActiveReport, matchesReportFilter } from './data/filters'
import type { ReportFilter } from './data/filters'
import type { Report, ReportDraft } from './types'
import { createReportId } from './utils/createReportId'

function App() {
  const [reports, setReports] = useState<Report[]>(initialReports)
  const [activeFilter, setActiveFilter] = useState<ReportFilter>('Todos')
  const [selectedId, setSelectedId] = useState<string | null>(
    initialReports.find(isActiveReport)?.id ?? null,
  )
  const [now, setNow] = useState(() => Date.now())
  const [announcement, setAnnouncement] = useState<{ id: string; message: string } | null>(null)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000)
    return () => window.clearInterval(timer)
  }, [])

  const activeReports = reports.filter(isActiveReport)
  const visibleReports = activeReports.filter((report) => matchesReportFilter(report, activeFilter))

  const handleFilterChange = (filter: ReportFilter) => {
    setActiveFilter(filter)
    if (!activeReports.some((report) => report.id === selectedId && matchesReportFilter(report, filter))) {
      setSelectedId(activeReports.find((report) => matchesReportFilter(report, filter))?.id ?? null)
    }
  }

  const handleCreateReport = (draft: ReportDraft) => {
    const report: Report = {
      ...draft,
      id: createReportId(),
      status: 'unverified',
      createdAt: new Date().toISOString(),
    }
    setReports((current) => [report, ...current])
    setActiveFilter('Todos')
    setSelectedId(report.id)
    setNow(Date.now())
    setAnnouncement({ id: report.id, message: `Reporte creado sin verificar: ${report.description}.` })
  }

  return (
    <main className="app-frame">
      <TopBar reports={reports} onCreateReport={handleCreateReport} />
      <p className="sr-only" role="status" aria-atomic="true">
        {announcement && <span key={announcement.id}>{announcement.message}</span>}
      </p>
      <div className="dashboard">
        <MapView
          reports={visibleReports}
          categories={categories}
          selectedId={selectedId}
          onSelectReport={setSelectedId}
        />
        <IncidentPanel
          reports={visibleReports}
          activeFilter={activeFilter}
          selectedId={selectedId}
          now={now}
          onFilterChange={handleFilterChange}
          onSelectReport={setSelectedId}
        />
      </div>
    </main>
  )
}

export default App
