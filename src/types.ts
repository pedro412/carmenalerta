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
  latitude: number
  longitude: number
  description: string
  location: string
  severity: Severity
  status: ReportStatus
  createdAt: string
}
