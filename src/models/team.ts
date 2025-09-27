export interface Club {
  id: number
  name: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface League {
  id: number
  name: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Team {
  id: number
  club_id: number
  league_id: number
  abbreviation: string
  name: string
  created_at: string
  updated_at: string
  deleted_at: string | null
  club: Club
  league: League
}
