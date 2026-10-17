let fallbackSequence = 0

export function createReportId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID()
  }

  // Client-only IDs for the in-memory demo; the sequence also covers rapid submissions.
  fallbackSequence += 1
  return `report-${Date.now().toString(36)}-${fallbackSequence.toString(36)}-${Math.random().toString(36).slice(2)}`
}
