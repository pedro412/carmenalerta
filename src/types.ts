export type Severity = 'low' | 'medium' | 'high'

export type ReportStatus =
  | 'unverified'
  | 'verified'
  | 'disputed'
  | 'resolved'
  | 'archived'

export type Category = {
  id: string
  name: string
  color: string
  suggestedLifetimeHours: number
  requiresSeverity: boolean
}

export type Report = {
  id: string
  categoryId: Category['id']
  reporterId: User['id']
  latitude: number
  longitude: number
  description: string
  location: string
  severity: Severity
  status: ReportStatus
  createdAt: string
}

export type VoteType = 'confirm' | 'resolved'

export type ReportVote = {
  reportId: Report['id']
  userId: User['id']
  voteType: VoteType
  createdAt: string
}

export type User = {
  id: string
  username: string
  /** Texto temporal hasta que #10 aporte el componente de insignia. */
  badgeLabel: string
}
