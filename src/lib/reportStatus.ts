import type { Report, ReportStatus, ReportVote } from '../types'

export const NET_CONFIRMATIONS_TO_VERIFY = 3

export const reportStatusLabels: Record<ReportStatus, string> = {
  unverified: 'Sin verificar',
  verified: 'Verificado',
  disputed: 'En disputa',
  resolved: 'Resuelto',
  archived: 'Archivado',
}

export type ReportVoteCounts = {
  confirmations: number
  resolved: number
  netConfirmations: number
}

export function countReportVotes(reportId: Report['id'], votes: ReportVote[]): ReportVoteCounts {
  const reportVotes = votes.filter((vote) => vote.reportId === reportId)
  const confirmations = reportVotes.filter((vote) => vote.voteType === 'confirm').length
  const resolved = reportVotes.filter((vote) => vote.voteType === 'resolved').length

  return {
    confirmations,
    resolved,
    netConfirmations: confirmations - resolved,
  }
}

export function calculateReportStatus(report: Report, votes: ReportVote[]): ReportStatus {
  if (report.status === 'archived' || report.status === 'resolved') return report.status

  const counts = countReportVotes(report.id, votes)
  if (counts.resolved > counts.confirmations) return 'archived'

  if (report.status === 'unverified' && counts.netConfirmations >= NET_CONFIRMATIONS_TO_VERIFY) {
    return 'verified'
  }

  return report.status
}

export function upsertReportVote(votes: ReportVote[], nextVote: ReportVote): ReportVote[] {
  const votesFromOtherUsersOrReports = votes.filter(
    (vote) => vote.reportId !== nextVote.reportId || vote.userId !== nextVote.userId,
  )

  return [...votesFromOtherUsersOrReports, nextVote]
}
