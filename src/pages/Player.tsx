import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Users,
  ArrowLeft,
  Calendar,
  Trophy,
  Hash,
  Ruler,
  Target,
  TrendingUp,
  HandHeart,
  Trash2,
  AlertCircle,
} from 'lucide-react'
import { getPlayer, deletePlayer } from '@/api/playerService'
import { useAuth } from '@/contexts/AuthContext'
import type { Player as PlayerType } from '@/models/player'

export function Player() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAdmin, user } = useAuth()
  const playerId = searchParams.get('id')

  const [player, setPlayer] = useState<PlayerType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const fetchPlayer = async (id: number) => {
    try {
      setLoading(true)
      setError(null)
      const data = await getPlayer(id)
      setPlayer(data)
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Non autorizzato. Puoi visualizzare solo le tue informazioni giocatore.')
      } else {
        setError('Impossibile caricare le informazioni del giocatore')
      }
      console.error('Errore nel caricamento del giocatore:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (playerId) {
      const id = parseInt(playerId, 10)
      if (!isNaN(id)) {
        fetchPlayer(id)
      } else {
        setError('ID giocatore non valido')
        setLoading(false)
      }
    } else {
      setError('ID giocatore non fornito')
      setLoading(false)
    }
  }, [playerId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    return age
  }

  const handleDelete = async () => {
    if (!player) return

    try {
      setDeleteLoading(true)
      await deletePlayer(player.id)
      navigate('/players')
    } catch (err: any) {
      console.error("Errore nell'eliminazione del giocatore:", err)
      setError('Impossibile eliminare il giocatore. Riprova più tardi.')
    } finally {
      setDeleteLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => navigate('/players')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna a lista giocatori
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Giocatore</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => navigate('/players')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna a lista giocatori
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Giocatore</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => playerId && fetchPlayer(parseInt(playerId, 10))}>Ricarica</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!player) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => navigate('/players')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Torna a lista giocatori
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Users className="h-8 w-8" />
          {player.name}
        </h1>
      </div>

      {/* Player Information Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Informazioni
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Numero di maglia</p>
                <p className="text-sm text-muted-foreground">#{player.jersey_number}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Trophy className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Posizione</p>
                <p className="text-sm text-muted-foreground">{player.position}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Ruler className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Altezza</p>
                <p className="text-sm text-muted-foreground">{player.height_cm} cm</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Data di nascita</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(player.birth_date)} ({calculateAge(player.birth_date)} anni)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Statistiche
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Target className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600">{player.points_per_game}</div>
                <div className="text-xs text-muted-foreground">Punti a partita</div>
              </div>

              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600">{player.rebounds_per_game}</div>
                <div className="text-xs text-muted-foreground">Rimbalzi a partita</div>
              </div>

              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <HandHeart className="h-4 w-4 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-600">{player.assists_per_game}</div>
                <div className="text-xs text-muted-foreground">Assist a partita</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teams */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Squadre ({player.teams.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {player.teams.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {player.teams.map(team => (
                  <div key={team.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{team.name}</h3>
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">{team.abbreviation}</span>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>
                        <strong>Società:</strong> {team.club.name}
                      </p>
                      <p>
                        <strong>Categoria:</strong> {team.league.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nessuna squadra</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Azioni</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            {(isAdmin || (user?.player_id && user.player_id === player.id)) && (
              <Button variant="outline" onClick={() => navigate(`/edit-player?id=${player.id}`)}>
                Modifica Giocatore
              </Button>
            )}
            {isAdmin && (
              <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)} disabled={deleteLoading}>
                <Trash2 className="h-4 w-4 mr-2" />
                Elimina
              </Button>
            )}
            <Button variant="outline">Visualizza Statistiche</Button>
            <Button variant="outline">Gestisci Squadre</Button>
          </div>
        </CardContent>
      </Card>

      {/* Conferma Eliminazione */}
      {showDeleteConfirm && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Conferma Eliminazione
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Sei sicuro di voler eliminare il giocatore <strong>{player.name}</strong>? Questa azione non può essere
              annullata e rimuoverà il giocatore da tutte le squadre.
            </p>
            <div className="flex gap-4">
              <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading}>
                {deleteLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Eliminazione...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Elimina Definitivamente
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={deleteLoading}>
                Annulla
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
