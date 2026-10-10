import { useEffect, useState } from 'react'
import { IncidentPanel } from './components/IncidentPanel'
import { MapView } from './components/MapView'
import { TopBar } from './components/TopBar'
import { categories } from './data/categories'
import { initialReports } from './data/reports'
import { initialReportVotes } from './data/votes'
import { currentUser, users } from './data/users'
import { isActiveReport, matchesReportFilter } from './data/filters'
import type { ReportFilter } from './data/filters'
import { calculateReportStatus, upsertReportVote } from './lib/reportStatus'
import type { Report, ReportVote, VoteType } from './types'

function App() {
  const [reports, setReports] = useState<Report[]>(initialReports)
  const [votes, setVotes] = useState<ReportVote[]>(initialReportVotes)
  const [activeFilter, setActiveFilter] = useState<ReportFilter>('Todos')
  const [selectedId, setSelectedId] = useState<string | null>(null)
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
      setSelectedId(null)
    }
  }

  const handleVote = (voteType: VoteType) => {
    const report = reports.find((candidate) => candidate.id === selectedId)
    if (!report) return

    const nextVote: ReportVote = {
      reportId: report.id,
      userId: currentUser.id,
      voteType,
      createdAt: new Date().toISOString(),
    }
    const nextVotes = upsertReportVote(votes, nextVote)
    const nextStatus = calculateReportStatus(report, nextVotes)

    setVotes(nextVotes)
    setReports((currentReports) => currentReports.map((candidate) => (
      candidate.id === report.id ? { ...candidate, status: nextStatus } : candidate
    )))
    setNow(Date.now())

    if (nextStatus === 'archived') setSelectedId(null)
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
          categories={categories}
          votes={votes}
          users={users}
          currentUserId={currentUser.id}
          activeFilter={activeFilter}
          selectedId={selectedId}
          now={now}
          onFilterChange={handleFilterChange}
          onSelectReport={setSelectedId}
          onBack={() => setSelectedId(null)}
          onVote={handleVote}
        />
      </div>
    </main>
  )
}

export default App
