import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, AlertCircle, Loader2 } from 'lucide-react'
import type { Player } from '@/models/player'
import type { Game } from '@/models/game'

interface ExistingPlayerStat {
  player_id: number
  game_id: number
  points?: number
  assists?: number
  rebounds?: number
}

interface PlayerSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  // eslint-disable-next-line
  onConfirm: (playerIds: number[]) => Promise<void>
  game: Game
  players: Player[]
  loading?: boolean
  existingPlayerStats?: ExistingPlayerStat[]
}

export function PlayerSelectionModal({
  isOpen,
  onClose,
  onConfirm,
  game,
  players,
  loading = false,
  existingPlayerStats = [],
}: PlayerSelectionModalProps) {
  const [selectedPlayers, setSelectedPlayers] = useState<Set<number>>(new Set())
  const [isConfirming, setIsConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset state when modal opens/closes and pre-select existing players
  useEffect(() => {
    if (isOpen) {
      // Pre-select players who already have PlayerStats
      const existingPlayerIds = existingPlayerStats.map(stat => stat.player_id)
      setSelectedPlayers(new Set(existingPlayerIds))
      setError(null)
    }
  }, [isOpen, existingPlayerStats])

  // Get players for each team
  const homePlayers = players.filter(player => player.teams.some(team => team.id === game.home_team_id))
  const awayPlayers = players.filter(player => player.teams.some(team => team.id === game.away_team_id))

  const handlePlayerToggle = (playerId: number) => {
    const newSelected = new Set(selectedPlayers)
    if (newSelected.has(playerId)) {
      newSelected.delete(playerId)
    } else {
      newSelected.add(playerId)
    }
    setSelectedPlayers(newSelected)
    setError(null) // Clear error when user makes changes
  }

  const handleConfirm = async () => {
    // Validation: at least one player must be selected
    if (selectedPlayers.size === 0) {
      setError('Devi selezionare almeno un giocatore per iniziare la partita.')
      return
    }

    try {
      setIsConfirming(true)
      setError(null)
      await onConfirm(Array.from(selectedPlayers))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante la creazione delle statistiche giocatori. Riprova.')
    } finally {
      setIsConfirming(false)
    }
  }

  const handleCancel = () => {
    if (!isConfirming) {
      onClose()
    }
  }

  const renderPlayerList = (teamPlayers: Player[], teamName: string) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {teamName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {teamPlayers.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nessun giocatore disponibile per questa squadra.</p>
        ) : (
          <div className="space-y-3">
            {teamPlayers.map(player => (
              <div
                key={player.id}
                className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedPlayers.has(player.id)
                    ? 'bg-blue-50 border-blue-300 hover:bg-blue-100'
                    : 'hover:bg-gray-50 border-gray-200'
                } ${loading || isConfirming ? 'cursor-not-allowed opacity-50' : ''}`}
                onClick={() => !loading && !isConfirming && handlePlayerToggle(player.id)}
              >
                <input
                  type="checkbox"
                  id={`player-${player.id}`}
                  checked={selectedPlayers.has(player.id)}
                  onChange={() => {}} // Controlled by the div onClick
                  disabled={loading || isConfirming}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded pointer-events-none"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{player.name}</div>
                      <div className="text-sm text-gray-500">
                        {player.position && `${player.position} • `}#{player.jersey_number}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="w-full max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Seleziona Giocatori per la Partita
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Caricamento giocatori...</span>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-sm text-muted-foreground">
              Seleziona i giocatori che parteciperanno alla partita. Solo i giocatori selezionati saranno visibili
              durante il tracciamento live della partita.
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {renderPlayerList(homePlayers, game.home_team.name)}
              {renderPlayerList(awayPlayers, game.away_team.name)}
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {selectedPlayers.size} giocator{selectedPlayers.size !== 1 ? 'i' : 'e'} selezionat
                {selectedPlayers.size !== 1 ? 'i' : 'o'}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleCancel} disabled={isConfirming}>
                  Annulla
                </Button>
                <Button onClick={handleConfirm} disabled={isConfirming || selectedPlayers.size === 0}>
                  {isConfirming ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Conferma...
                    </>
                  ) : (
                    'Conferma Selezione'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
