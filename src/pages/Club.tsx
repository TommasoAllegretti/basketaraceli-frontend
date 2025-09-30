import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building, ArrowLeft, Calendar, Hash, AlertCircle } from 'lucide-react'
import { getClub } from '@/api/clubService'
import { useAuth } from '@/contexts/AuthContext'
import type { Club as ClubType } from '@/models/club'

export function Club() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const clubId = searchParams.get('id')

  const [club, setClub] = useState<ClubType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClub = async (id: number) => {
    try {
      setLoading(true)
      setError(null)
      const data = await getClub(id)
      setClub(data)
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Non autorizzato. Non hai i permessi per visualizzare questa società.')
      } else if (err.response?.status === 404) {
        setError('Società non trovata.')
      } else {
        setError('Impossibile caricare le informazioni della società')
      }
      console.error('Errore nel recupero della società:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (clubId) {
      const id = parseInt(clubId, 10)
      if (!isNaN(id)) {
        fetchClub(id)
      } else {
        setError('ID società non valido')
        setLoading(false)
      }
    } else {
      setError('Nessun ID società fornito')
      setLoading(false)
    }
  }, [clubId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/clubs')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alle Società
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dettagli Società</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
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
          <Button variant="outline" size="sm" onClick={() => navigate('/clubs')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alle Società
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dettagli Società</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => clubId && fetchClub(parseInt(clubId, 10))}>Riprova</Button>
                <Button variant="outline" onClick={() => navigate('/clubs')}>
                  Torna alle Società
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!club) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Intestazione */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/clubs')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Torna alle Società
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Building className="h-8 w-8" />
          {club.name}
        </h1>
      </div>

      {/* Griglia Informazioni Società */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Informazioni Generali */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Informazioni Generali
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Building className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Nome Società</p>
                <p className="text-sm text-muted-foreground">{club.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Data Creazione</p>
                <p className="text-sm text-muted-foreground">{formatDate(club.created_at)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Ultimo Aggiornamento</p>
                <p className="text-sm text-muted-foreground">{formatDate(club.updated_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stato Società */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Stato Società
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-800">
                  {club.deleted_at ? 'Società Eliminata' : 'Società Attiva'}
                </span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                {club.deleted_at
                  ? `Eliminata il ${formatDate(club.deleted_at)}`
                  : 'La società è attualmente attiva nel sistema'}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Informazioni Sistema</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Creata: {formatDate(club.created_at)}</p>
                <p>• Aggiornata: {formatDate(club.updated_at)}</p>
                {club.deleted_at && <p>• Eliminata: {formatDate(club.deleted_at)}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistiche Società */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Statistiche Società
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-xs text-muted-foreground">Squadre Associate</div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-xs text-muted-foreground">Giocatori Totali</div>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-xs text-muted-foreground">Campionati Attivi</div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              Le statistiche dettagliate saranno disponibili quando verranno associate squadre e giocatori a questa
              società.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Informazioni Dettagliate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Informazioni Dettagliate
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium">ID Società</p>
            <p className="text-sm text-muted-foreground">#{club.id}</p>
          </div>

          <div>
            <p className="text-sm font-medium">Nome Completo</p>
            <p className="text-sm text-muted-foreground">{club.name}</p>
          </div>

          <div>
            <p className="text-sm font-medium">Data Registrazione</p>
            <p className="text-sm text-muted-foreground">{formatDate(club.created_at)}</p>
          </div>

          <div>
            <p className="text-sm font-medium">Ultima Modifica</p>
            <p className="text-sm text-muted-foreground">{formatDate(club.updated_at)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Azioni */}
      <Card>
        <CardHeader>
          <CardTitle>Azioni Disponibili</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {isAdmin && (
              <Button variant="outline" onClick={() => navigate(`/edit-club?id=${club.id}`)}>
                Modifica Società
              </Button>
            )}
            <Button variant="outline">Gestisci Squadre</Button>
            <Button variant="outline">Visualizza Statistiche</Button>
            <Button variant="outline">Esporta Dati</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
