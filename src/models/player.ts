export interface Team {
  id: number
  club_id: number
  league_id: number
  abbreviation: string
  name: string
  created_at: string
  updated_at: string
  deleted_at: string | null
  pivot: {
    player_id: number
    team_id: number
  }
  club: {
    id: number
    name: string
    created_at: string
    updated_at: string
    deleted_at: string | null
  }
  league: {
    id: number
    name: string
    created_at: string
    updated_at: string
    deleted_at: string | null
  }
}

export interface Player {
  id: number
  name: string
  position: string
  height_cm: number
  birth_date: string
  jersey_number: number
  points_per_game: string
  rebounds_per_game: string
  assists_per_game: string
  created_at: string
  updated_at: string
  deleted_at: string | null
  teams: Team[]
}
