import type { Category } from '../types'

// Valores iniciales de demostración; la spec permite configurarlos por Admin.
export const categories: Category[] = [
  { id: 'flood', name: 'Calles inundadas', color: '#318add', suggestedLifetimeHours: 12, requiresSeverity: true },
  { id: 'power', name: 'Zonas sin luz / alumbrado público', color: '#505864', suggestedLifetimeHours: 8, requiresSeverity: false },
  { id: 'accident', name: 'Accidentes de tráfico', color: '#eb4d50', suggestedLifetimeHours: 3, requiresSeverity: true },
  { id: 'construction', name: 'Calles en construcción', color: '#f49a1e', suggestedLifetimeHours: 720, requiresSeverity: true },
  { id: 'funeral', name: 'Calles cerradas por velorios', color: '#8e65a9', suggestedLifetimeHours: 12, requiresSeverity: false },
  { id: 'traffic-light', name: 'Semáforos descompuestos', color: '#e3b633', suggestedLifetimeHours: 6, requiresSeverity: true },
  { id: 'other', name: 'Otro', color: '#7b858d', suggestedLifetimeHours: 24, requiresSeverity: false },
]
