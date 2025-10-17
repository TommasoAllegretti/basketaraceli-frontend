import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Trophy, BarChart3, Calendar, Shield, Target, Plus, Eye, UserPlus, CalendarPlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function Home() {
  const navigate = useNavigate()
  const { isAdmin, user } = useAuth()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Gestisci squadre, giocatori e partite.</p>
      </div>

      {/* Navigation Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/teams')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              Squadre
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Gestisci e visualizza tutte le squadre</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/players')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600" />
              Giocatori
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Gestisci e visualizza tutti i giocatori</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/games')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-600" />
              Partite
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Visualizza e programma le partite</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Cards */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {/* Teams Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Gestione Squadre
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/teams')}>
              <Eye className="h-4 w-4 mr-2" />
              Visualizza Squadre
            </Button>
            {isAdmin && (
              <>
                <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/create-team')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crea Nuova Squadra
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/clubs')}>
                  <Trophy className="h-4 w-4 mr-2" />
                  Gestisci Società
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Players Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Gestione Giocatori
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/players')}>
              <Eye className="h-4 w-4 mr-2" />
              Visualizza Giocatori
            </Button>
            {user?.player_id && (
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate(`/player?id=${user.player_id}`)}
              >
                <Users className="h-4 w-4 mr-2" />
                Il Mio Profilo Giocatore
              </Button>
            )}
            {isAdmin && (
              <>
                <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/create-player')}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Aggiungi Giocatore
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/leagues')}>
                  <Trophy className="h-4 w-4 mr-2" />
                  Gestisci Campionati
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Games & Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              Partite
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/games')}>
              <Eye className="h-4 w-4 mr-2" />
              Visualizza Partite
            </Button>
            {isAdmin && (
              <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/create-game')}>
                <CalendarPlus className="h-4 w-4 mr-2" />
                Programma Partita
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Navigation */}
      <div className={`grid gap-4 grid-cols-1 ${isAdmin ? 'lg:grid-cols-2' : 'lg:grid-cols-1'}`}>
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Organizzazione
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/clubs')}>
                <Shield className="h-4 w-4 mr-2" />
                Gestisci Società
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/leagues')}>
                <Trophy className="h-4 w-4 mr-2" />
                Gestisci Campionati
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/create-club')}>
                <Plus className="h-4 w-4 mr-2" />
                Crea Nuova Società
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Azioni Rapide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/profile')}>
              <Users className="h-4 w-4 mr-2" />
              Il Mio Profilo
            </Button>
            {user?.player_id && (
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate(`/player-stat?id=${user.player_id}`)}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Le Mie Statistiche
              </Button>
            )}
            {isAdmin && (
              <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/create-league')}>
                <Plus className="h-4 w-4 mr-2" />
                Crea Nuova Lega
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
