import type { Team } from './team'

export interface League {
  id: number
  name: string
  teams: Team[]
  created_at: string
  updated_at: string
  deleted_at: string | null
}
