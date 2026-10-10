import type { User } from '../types'

export const users: User[] = [
  { id: 'user-current', username: 'María del Carmen', badgeLabel: 'Vigía Activo' },
  { id: 'user-ana', username: 'Ana M.', badgeLabel: 'Reportera Confiable' },
  { id: 'user-carlos', username: 'Carlos R.', badgeLabel: 'Vigía Activo' },
  { id: 'user-lucia', username: 'Lucía P.', badgeLabel: 'Guardiana de la Ciudad' },
  { id: 'user-diego', username: 'Diego C.', badgeLabel: 'Vigía Novato' },
  { id: 'user-sofia', username: 'Sofía T.', badgeLabel: 'Reportera Confiable' },
  { id: 'user-javier', username: 'Javier L.', badgeLabel: 'Vigía Activo' },
  { id: 'user-elena', username: 'Elena G.', badgeLabel: 'Vigía Novato' },
]

export const currentUser = users[0]
