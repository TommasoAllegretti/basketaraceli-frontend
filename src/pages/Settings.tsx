import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings as SettingsIcon, User as UserIcon, Users, Link, Unlink, AlertCircle } from 'lucide-react'
import { getUsers, linkUserToPlayer } from '@/api/userService'
import { getPlayers } from '@/api/playerService'
import type { User } from '@/models/user'
import type { Player } from '@/models/player'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export function Settings() {
  const { isAdmin, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<number | null>(null)
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null)
  const [savingLink, setSavingLink] = useState(false)

  useEffect(() => {
    // Redirect if not admin
    if (!authLoading && !isAdmin) {
      navigate('/dashboard')
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const [usersData, playersData] = await Promise.all([getUsers(), getPlayers()])
        setUsers(usersData)
        setPlayers(playersData)
      } catch (err) {
        setError('Impossibile caricare i dati')
        console.error('Errore nel caricamento dei dati:', err)
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && isAdmin) {
      fetchData()
    }
  }, [isAdmin, authLoading, navigate])

  const handleLinkUser = async () => {
    if (selectedUser === null) {
      setError('Seleziona un utente')
      return
    }

    try {
      setSavingLink(true)
      setError(null)
      setSuccess(null)

      const response = await linkUserToPlayer(selectedUser, {
        player_id: selectedPlayer,
      })

      // Update the user in the local state
      setUsers(prevUsers => prevUsers.map(user => (user.id === selectedUser ? response.user : user)))

      setSuccess('Collegamento aggiornato con successo')
      setSelectedUser(null)
      setSelectedPlayer(null)
    } catch (err: any) {
      console.error('Errore nel collegamento:', err)
      if (err.response?.status === 403) {
        setError('Non autorizzato. Solo gli amministratori possono collegare utenti.')
      } else if (err.response?.status === 404) {
        setError('Utente o giocatore non trovato.')
      } else {
        setError('Errore nel collegamento utente-giocatore')
      }
    } finally {
      setSavingLink(false)
    }
  }

  const handleUserSelect = (userId: number) => {
    const user = users.find(u => u.id === userId)
    setSelectedUser(userId)
    setSelectedPlayer(user?.player_id || null)
    setError(null)
    setSuccess(null)
  }

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Impostazioni</h1>
          <p className="text-muted-foreground">Gestisci le impostazioni dell'applicazione</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Impostazioni</h1>
        <p className="text-muted-foreground">Gestisci le impostazioni dell'applicazione</p>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-800">
              <SettingsIcon className="h-5 w-5" />
              <span>{success}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User-Player Linking Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Collega Utenti a Giocatori
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Seleziona un utente e un giocatore da collegare. Un utente può essere collegato a un solo giocatore oppure
            non essere collegato.
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Users List */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <UserIcon className="h-4 w-4" />
                <span>Utenti</span>
              </div>
              <div className="border rounded-md max-h-96 overflow-y-auto">
                {users.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">Nessun utente disponibile</div>
                ) : (
                  users.map(user => (
                    <div
                      key={user.id}
                      className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedUser === user.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => handleUserSelect(user.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                          {user.admin === 1 && <div className="text-xs text-blue-600 mt-1">Admin</div>}
                        </div>
                        {user.player_id && (
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <Link className="h-3 w-3" />
                            <span>Collegato</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Players List */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4" />
                <span>Giocatori</span>
              </div>
              <div className="border rounded-md max-h-96 overflow-y-auto">
                {/* Option to unlink */}
                <div
                  className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedPlayer === null && selectedUser !== null ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => {
                    if (selectedUser !== null) {
                      setSelectedPlayer(null)
                      setError(null)
                      setSuccess(null)
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Unlink className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Nessun collegamento</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Rimuovi collegamento giocatore</div>
                </div>

                {players.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">Nessun giocatore disponibile</div>
                ) : (
                  players.map(player => (
                    <div
                      key={player.id}
                      className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedPlayer === player.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => {
                        if (selectedUser !== null) {
                          setSelectedPlayer(player.id)
                          setError(null)
                          setSuccess(null)
                        }
                      }}
                    >
                      <div className="font-medium">{player.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {player.position} • #{player.jersey_number}
                      </div>
                      {/* Show if player is already linked to a user */}
                      {users.some(u => u.player_id === player.id) && (
                        <div className="text-xs text-orange-600 mt-1">
                          Già collegato a {users.find(u => u.player_id === player.id)?.name}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedUser(null)
                setSelectedPlayer(null)
                setError(null)
                setSuccess(null)
              }}
              disabled={selectedUser === null}
            >
              Annulla
            </Button>
            <Button onClick={handleLinkUser} disabled={selectedUser === null || savingLink} className="cursor-pointer">
              {savingLink ? 'Salvataggio...' : 'Salva Collegamento'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
