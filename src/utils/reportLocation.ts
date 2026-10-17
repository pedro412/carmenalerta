import type { ReportLocation } from '../types'

// Approximate MVP coverage, not an official administrative boundary.
export const REPORT_AREA = {
  south: 18.60,
  north: 18.72,
  west: -91.88,
  east: -91.70,
} as const

export function validateReportLocation(location: ReportLocation | null): string | null {
  if (!location || !Number.isFinite(location.latitude) || !Number.isFinite(location.longitude)
    || Math.abs(location.latitude) > 90 || Math.abs(location.longitude) > 180) {
    return 'Selecciona una ubicación válida con GPS o en el mapa.'
  }

  if (location.latitude < REPORT_AREA.south || location.latitude > REPORT_AREA.north
    || location.longitude < REPORT_AREA.west || location.longitude > REPORT_AREA.east) {
    return 'La ubicación está fuera de la zona de cobertura de Ciudad del Carmen. Elige otro punto en el mapa.'
  }

  return null
}
