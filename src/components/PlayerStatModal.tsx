import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Target, TrendingUp, HandHeart, Activity, Award, Clock, BarChart3 } from 'lucide-react'
import type { PlayerStat } from '@/models/game'

interface PlayerStatModalProps {
  isOpen: boolean
  onClose: () => void
  playerStat: PlayerStat | null
  playerName: string
}

export function PlayerStatModal({ isOpen, onClose, playerStat, playerName }: PlayerStatModalProps) {
  if (!playerStat) return null

  const formatTime = (seconds: number | null) => {
    if (seconds === null || seconds === undefined) return '0:00'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatPercentage = (value: string | number | null | undefined) => {
    if (value === null || value === undefined) {
      return '0.0%'
    }
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(numValue)) {
      return '0.0%'
    }
    return numValue.toFixed(1) + '%'
  }

  const safeNumber = (value: number | null | undefined): number => {
    return value !== null && value !== undefined ? value : 0
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Statistiche Dettagliate - {playerName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{formatTime(safeNumber(playerStat.seconds_played))}</p>
                    <p className="text-sm text-muted-foreground">Minuti Giocati</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Target className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{safeNumber(playerStat.points)}</p>
                    <p className="text-sm text-muted-foreground">Punti</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{safeNumber(playerStat.total_rebounds)}</p>
                    <p className="text-sm text-muted-foreground">Rimbalzi Totali</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <HandHeart className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{safeNumber(playerStat.assists)}</p>
                    <p className="text-sm text-muted-foreground">Assist</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Shooting Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Statistiche di Tiro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <div className="space-y-3">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {safeNumber(playerStat.field_goals_made)}/{safeNumber(playerStat.field_goals_attempted)}
                    </div>
                    <div className="text-sm text-muted-foreground">Tiri dal Campo</div>
                    <div className="text-lg font-semibold text-blue-600">
                      {formatPercentage(playerStat.field_goal_percentage)}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {safeNumber(playerStat.three_point_field_goals_made)}/
                      {safeNumber(playerStat.three_point_field_goals_attempted)}
                    </div>
                    <div className="text-sm text-muted-foreground">Tiri da 3 Punti</div>
                    <div className="text-lg font-semibold text-green-600">
                      {formatPercentage(playerStat.three_point_field_goal_percentage)}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {safeNumber(playerStat.free_throws_made)}/{safeNumber(playerStat.free_throws_attempted)}
                    </div>
                    <div className="text-sm text-muted-foreground">Tiri Liberi</div>
                    <div className="text-lg font-semibold text-purple-600">
                      {formatPercentage(playerStat.free_throw_percentage)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                <div className="text-center p-3 bg-indigo-50 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">
                    {safeNumber(playerStat.two_point_field_goals_made)}/
                    {safeNumber(playerStat.two_point_field_goals_attempted)}
                  </div>
                  <div className="text-sm text-muted-foreground">Tiri da 2 Punti</div>
                  <div className="text-lg font-semibold text-indigo-600">
                    {formatPercentage(playerStat.two_point_field_goal_percentage)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rebounds and Other Stats */}
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Rimbalzi e Difesa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{safeNumber(playerStat.offensive_rebounds)}</div>
                    <div className="text-xs text-muted-foreground">Rimbalzi Offensivi</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{safeNumber(playerStat.defensive_rebounds)}</div>
                    <div className="text-xs text-muted-foreground">Rimbalzi Difensivi</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{safeNumber(playerStat.steals)}</div>
                    <div className="text-xs text-muted-foreground">Palle Rubate</div>
                  </div>
                  <div className="text-center p-3 bg-indigo-50 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-600">{safeNumber(playerStat.blocks)}</div>
                    <div className="text-xs text-muted-foreground">Stoppate</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Altre Statistiche
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{safeNumber(playerStat.turnovers)}</div>
                    <div className="text-xs text-muted-foreground">Palle Perse</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{safeNumber(playerStat.personal_fouls)}</div>
                    <div className="text-xs text-muted-foreground">Falli Personali</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {playerStat.efficiency !== null ? playerStat.efficiency.toFixed(1) : '0.0'}
                    </div>
                    <div className="text-xs text-muted-foreground">Efficienza</div>
                  </div>
                  <div className="text-center p-3 bg-cyan-50 rounded-lg">
                    <div className="text-2xl font-bold text-cyan-600">
                      {playerStat.plus_minus !== null
                        ? `${playerStat.plus_minus > 0 ? '+' : ''}${playerStat.plus_minus}`
                        : '0'}
                    </div>
                    <div className="text-xs text-muted-foreground">+/-</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Metriche di Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-3xl font-bold text-yellow-600">
                    {playerStat.performance_index_rating !== null ? playerStat.performance_index_rating : 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Performance Index Rating (PIR)</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Formula: Punti + Rimbalzi + Assist + Rubate + Stoppate - Tiri Sbagliati - Liberi Sbagliati - Perse
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
