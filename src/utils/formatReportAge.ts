export function formatReportAge(createdAt: string, now: number): string {
  const elapsedMinutes = Math.max(0, Math.floor((now - Date.parse(createdAt)) / 60_000))

  if (elapsedMinutes < 60) return `${elapsedMinutes} min`

  const elapsedHours = Math.floor(elapsedMinutes / 60)
  if (elapsedHours < 24) return `${elapsedHours} h`

  return `${Math.floor(elapsedHours / 24)} d`
}
