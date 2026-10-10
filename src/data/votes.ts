import type { ReportVote } from '../types'

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString()

export const initialReportVotes: ReportVote[] = [
  { reportId: 'report-1', userId: 'user-carlos', voteType: 'confirm', createdAt: minutesAgo(3) },
  { reportId: 'report-1', userId: 'user-lucia', voteType: 'confirm', createdAt: minutesAgo(2) },
  { reportId: 'report-1', userId: 'user-diego', voteType: 'confirm', createdAt: minutesAgo(1) },
  { reportId: 'report-2', userId: 'user-ana', voteType: 'confirm', createdAt: minutesAgo(16) },
  { reportId: 'report-2', userId: 'user-sofia', voteType: 'confirm', createdAt: minutesAgo(12) },
  { reportId: 'report-2', userId: 'user-javier', voteType: 'confirm', createdAt: minutesAgo(8) },
  { reportId: 'report-3', userId: 'user-carlos', voteType: 'confirm', createdAt: minutesAgo(45) },
  { reportId: 'report-3', userId: 'user-lucia', voteType: 'confirm', createdAt: minutesAgo(22) },
  { reportId: 'report-5', userId: 'user-ana', voteType: 'confirm', createdAt: minutesAgo(160) },
  { reportId: 'report-5', userId: 'user-carlos', voteType: 'confirm', createdAt: minutesAgo(150) },
  { reportId: 'report-5', userId: 'user-sofia', voteType: 'confirm', createdAt: minutesAgo(140) },
  { reportId: 'report-6', userId: 'user-javier', voteType: 'confirm', createdAt: minutesAgo(210) },
  { reportId: 'report-7', userId: 'user-lucia', voteType: 'confirm', createdAt: minutesAgo(285) },
  { reportId: 'report-7', userId: 'user-diego', voteType: 'confirm', createdAt: minutesAgo(270) },
  { reportId: 'report-7', userId: 'user-elena', voteType: 'confirm', createdAt: minutesAgo(255) },
]
