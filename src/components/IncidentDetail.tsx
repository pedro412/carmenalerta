import { useEffect, useMemo, useRef } from 'react'
import { countReportVotes, reportStatusLabels } from '../lib/reportStatus'
import type { Category, Report, ReportVote, User, VoteType } from '../types'

type IncidentDetailProps = {
  report: Report
  category: Category | undefined
  votes: ReportVote[]
  users: User[]
  currentUserId: User['id']
  onBack: () => void
  onVote: (voteType: VoteType) => void
}

const dateTimeFormatter = new Intl.DateTimeFormat('es-MX', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function IncidentDetail({
  report,
  category,
  votes,
  users,
  currentUserId,
  onBack,
  onVote,
}: IncidentDetailProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const reportVotes = useMemo(
    () => votes.filter((vote) => vote.reportId === report.id),
    [report.id, votes],
  )
  const counts = countReportVotes(report.id, votes)
  const currentVote = reportVotes.find((vote) => vote.userId === currentUserId)?.voteType
  const lastConfirmation = reportVotes
    .filter((vote) => vote.voteType === 'confirm')
    .reduce<ReportVote | null>(
      (latest, vote) => (!latest || vote.createdAt > latest.createdAt ? vote : latest),
      null,
    )
  const reporter = users.find((user) => user.id === report.reporterId)
  const confirmers = reportVotes
    .filter((vote) => vote.voteType === 'confirm' && vote.userId !== report.reporterId)
    .map((vote) => users.find((user) => user.id === vote.userId))
    .filter((user): user is User => Boolean(user))

  useEffect(() => {
    headingRef.current?.focus()
  }, [report.id])

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onBack()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onBack])

  return (
    <section className="incident-detail" aria-labelledby="incident-detail-title">
      <button className="back-button" type="button" onClick={onBack}>
        <span aria-hidden="true">←</span> Volver
      </button>

      <div className="detail-heading">
        <span className="category-label">
          <i style={{ backgroundColor: category?.color }} aria-hidden="true" />
          {category?.name ?? 'Categoría desconocida'}
        </span>
        <span className={`status-badge status-badge--${report.status}`} role="status" aria-live="polite">
          {reportStatusLabels[report.status]}
        </span>
      </div>

      <h2 id="incident-detail-title" ref={headingRef} tabIndex={-1}>
        {report.description}
      </h2>
      <p className="detail-location">{report.location}</p>

      <dl className="detail-dates">
        <div>
          <dt>Primer reporte</dt>
          <dd><time dateTime={report.createdAt}>{dateTimeFormatter.format(new Date(report.createdAt))}</time></dd>
        </div>
        <div>
          <dt>Última confirmación</dt>
          <dd>
            {lastConfirmation ? (
              <time dateTime={lastConfirmation.createdAt}>
                {dateTimeFormatter.format(new Date(lastConfirmation.createdAt))}
              </time>
            ) : 'Aún no hay confirmaciones'}
          </dd>
        </div>
      </dl>

      <div className="vote-counts" aria-live="polite">
        <div><strong>{counts.confirmations}</strong><span>Confirmaciones</span></div>
        <div><strong>{counts.resolved}</strong><span>Ya no aplica</span></div>
      </div>

      <div className="vote-actions" aria-label="Votar sobre este reporte">
        <button
          className="confirm-button"
          type="button"
          aria-pressed={currentVote === 'confirm'}
          onClick={() => onVote('confirm')}
        >
          Confirmar <span>(sigue ahí)</span>
        </button>
        <button
          className="resolved-button"
          type="button"
          aria-pressed={currentVote === 'resolved'}
          onClick={() => onVote('resolved')}
        >
          Ya no aplica
        </button>
      </div>
      <p className="vote-note">
        {currentVote
          ? `Tu voto actual es “${currentVote === 'confirm' ? 'Confirmar' : 'Ya no aplica'}”. Puedes reemplazarlo.`
          : 'Solo puedes emitir un voto; si cambias de opinión, el nuevo reemplaza al anterior.'}
      </p>

      <section className="participants" aria-labelledby="participants-title">
        <h3 id="participants-title">Comunidad</h3>
        <ul>
          {reporter && (
            <li>
              <span><strong>{reporter.username}</strong><small>Reportó el incidente</small></span>
              <em>{reporter.badgeLabel}</em>
            </li>
          )}
          {confirmers.map((user) => (
            <li key={user.id}>
              <span><strong>{user.username}</strong><small>Confirmó el incidente</small></span>
              <em>{user.badgeLabel}</em>
            </li>
          ))}
        </ul>
      </section>
    </section>
  )
}
