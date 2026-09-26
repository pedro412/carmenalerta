import type { Report } from '../types'

export const reportFilters = ['Todos', 'Inundación', 'Vialidad', 'Apagón'] as const
export type ReportFilter = (typeof reportFilters)[number]

// «Otro» queda visible en Todos; no pertenece a los tres grupos especializados.
export const categoryIdsByFilter: Record<Exclude<ReportFilter, 'Todos'>, readonly string[]> = {
  Inundación: ['flood'],
  Vialidad: ['accident', 'construction', 'funeral', 'traffic-light'],
  Apagón: ['power'],
}

export function isActiveReport(report: Report): boolean {
  return report.status === 'unverified' || report.status === 'verified'
}

export function matchesReportFilter(report: Report, filter: ReportFilter): boolean {
  return filter === 'Todos' || categoryIdsByFilter[filter].includes(report.categoryId)
}
