/**
 * Advanced basketball statistics calculations
 */

interface PlayerStatInput {
  points?: number | null
  total_rebounds?: number | null
  assists?: number | null
  steals?: number | null
  blocks?: number | null
  field_goals_made?: number | null
  field_goals_attempted?: number | null
  free_throws_made?: number | null
  free_throws_attempted?: number | null
  turnovers?: number | null
  personal_fouls?: number | null
}

/**
 * Calculate efficiency rating for a player
 * Formula: PTS + REB + AST + STL + BLK − Missed FG − Missed FT - turnovers
 *
 * @param stat Player statistics object
 * @returns Efficiency rating as a number
 */
export function calculateEfficiency(stat: PlayerStatInput): number {
  const points = stat.points ?? 0
  const rebounds = stat.total_rebounds ?? 0
  const assists = stat.assists ?? 0
  const steals = stat.steals ?? 0
  const blocks = stat.blocks ?? 0
  const fieldGoalsMade = stat.field_goals_made ?? 0
  const fieldGoalsAttempted = stat.field_goals_attempted ?? 0
  const freeThrowsMade = stat.free_throws_made ?? 0
  const freeThrowsAttempted = stat.free_throws_attempted ?? 0
  const turnovers = stat.turnovers ?? 0

  const missedFieldGoals = fieldGoalsAttempted - fieldGoalsMade
  const missedFreeThrows = freeThrowsAttempted - freeThrowsMade

  return points + rebounds + assists + steals + blocks - missedFieldGoals - missedFreeThrows - turnovers
}

/**
 * Calculate Performance Index Rating (PIR) for a player
 * Formula: (points + rebounds + assists + steals + blocks + fouls drawn) −
 *          (missed field goals + missed free throws + turnovers + shots rejected + fouls committed)
 *
 * Note: fouls drawn and shots rejected are not currently tracked in our data model,
 * so they default to 0. This can be updated when/if this data becomes available.
 *
 * @param stat Player statistics object
 * @param foulsDrawn Number of fouls drawn by the player (optional, defaults to 0)
 * @param shotsRejected Number of shots blocked against this player (optional, defaults to 0)
 *  * @returns PIR as a number
 */
export function calculatePIR(stat: PlayerStatInput, foulsDrawn: number = 0, shotsRejected: number = 0): number {
  const points = stat.points ?? 0
  const rebounds = stat.total_rebounds ?? 0
  const assists = stat.assists ?? 0
  const steals = stat.steals ?? 0
  const blocks = stat.blocks ?? 0
  const fieldGoalsMade = stat.field_goals_made ?? 0
  const fieldGoalsAttempted = stat.field_goals_attempted ?? 0
  const freeThrowsMade = stat.free_throws_made ?? 0
  const freeThrowsAttempted = stat.free_throws_attempted ?? 0
  const turnovers = stat.turnovers ?? 0
  const foulsCommitted = stat.personal_fouls ?? 0

  const missedFieldGoals = fieldGoalsAttempted - fieldGoalsMade
  const missedFreeThrows = freeThrowsAttempted - freeThrowsMade

  const positiveActions = points + rebounds + assists + steals + blocks + foulsDrawn
  const negativeActions = missedFieldGoals + missedFreeThrows + turnovers + shotsRejected + foulsCommitted

  return positiveActions - negativeActions
}

/**
 * Safe number conversion utility
 */
export function safeNumber(value: number | null | undefined): number {
  return value !== null && value !== undefined ? value : 0
}
