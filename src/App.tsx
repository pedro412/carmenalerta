import { useEffect, useState } from 'react'
import { IncidentPanel } from './components/IncidentPanel'
import { MapView } from './components/MapView'
import { TopBar } from './components/TopBar'
import { categories } from './data/categories'
import { initialReports } from './data/reports'
import { isActiveReport, matchesReportFilter } from './data/filters'
import type { ReportFilter } from './data/filters'
import type { Report } from './types'

function App() {
  const [reports] = useState<Report[]>(initialReports)
  const [activeFilter, setActiveFilter] = useState<ReportFilter>('Todos')
  const [selectedId, setSelectedId] = useState<string | null>(
    initialReports.find(isActiveReport)?.id ?? null,
  )
  const [now, setNow] = useState(() => Date.now())

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

  return (
    <main className="app-frame">
      <TopBar reports={reports} />
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
