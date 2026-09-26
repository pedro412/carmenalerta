import { useCallback, useEffect, useState } from 'react'
import { IncidentPanel } from './components/IncidentPanel'
import { MapView } from './components/MapView'
import { ReportForm } from './components/ReportForm'
import { TopBar } from './components/TopBar'
import { categories } from './data/categories'
import { initialReports } from './data/reports'
import { isActiveReport, matchesReportFilter } from './data/filters'
import type { ReportFilter } from './data/filters'
import type { Report, ReportLocation } from './types'

function App() {
  const [reports, setReports] = useState<Report[]>(initialReports)
  const [activeFilter, setActiveFilter] = useState<ReportFilter>('Todos')
  const [selectedId, setSelectedId] = useState<string | null>(
    initialReports.find(isActiveReport)?.id ?? null,
  )
  const [now, setNow] = useState(() => Date.now())

  const [formOpen, setFormOpen] = useState(false)
  const [pickingLocation, setPickingLocation] = useState(false)
  const [location, setLocation] = useState<ReportLocation | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const handleMapClick = useCallback((point: ReportLocation) => {
    setLocation(point)
    setPickingLocation(false)
  }, [])
  const cancelMapPick = useCallback(() => setPickingLocation(false), [])
  const createReport = (report: Report) => {
    setReports((current) => [report, ...current])
    setActiveFilter('Todos')
    setSelectedId(report.id)
    setNow(Date.now())
    setFormOpen(false)
    setAnnouncement('Reporte creado sin verificar.')
  }

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
      <TopBar reports={reports} onReport={() => {
        setLocation(null)
        setAnnouncement('')
        setFormOpen(true)
      }} />
      <span className="sr-only" role="status">{announcement}</span>
      <div className="dashboard">
        <MapView
          reports={visibleReports}
          categories={categories}
          pickingLocation={pickingLocation}
          onMapClick={handleMapClick}
          onCancelLocation={cancelMapPick}
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
      {formOpen && <ReportForm categories={categories} location={location}
        pickingLocation={pickingLocation} onLocationChange={setLocation}
        onPickLocation={() => setPickingLocation(true)}
        onClose={() => setFormOpen(false)} onSubmit={createReport} />}
    </main>
  )
}

export default App
