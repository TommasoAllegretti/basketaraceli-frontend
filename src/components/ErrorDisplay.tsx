import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, ArrowLeft, Wifi, Shield, AlertTriangle } from 'lucide-react'

interface ErrorDisplayProps {
  error: string
  onRetry?: () => void
  onBack?: () => void
  title?: string
  type?: 'network' | 'auth' | 'notfound' | 'generic'
  showDetails?: boolean
  details?: string
}

export function ErrorDisplay({
  error,
  onRetry,
  onBack,
  title = 'Errore',
  type = 'generic',
  showDetails = false,
  details,
}: ErrorDisplayProps) {
  const getIcon = () => {
    switch (type) {
      case 'network':
        return <Wifi className="h-12 w-12 text-red-500" />
      case 'auth':
        return <Shield className="h-12 w-12 text-orange-500" />
      case 'notfound':
        return <AlertTriangle className="h-12 w-12 text-yellow-500" />
      default:
        return <AlertCircle className="h-12 w-12 text-red-500" />
    }
  }

  const getErrorMessage = () => {
    switch (type) {
      case 'network':
        return 'Problema di connessione. Verifica la tua connessione internet e riprova.'
      case 'auth':
        return 'Non hai i permessi necessari per accedere a questa risorsa.'
      case 'notfound':
        return 'La risorsa richiesta non è stata trovata.'
      default:
        return error
    }
  }

  const getSuggestions = () => {
    switch (type) {
      case 'network':
        return [
          'Verifica la connessione internet',
          'Riprova tra qualche momento',
          'Controlla se il server è raggiungibile',
        ]
      case 'auth':
        return [
          'Accedi con un account amministratore',
          'Contatta un amministratore per i permessi',
          'Verifica di essere autenticato correttamente',
        ]
      case 'notfound':
        return [
          "Verifica che l'URL sia corretto",
          'La risorsa potrebbe essere stata eliminata',
          'Torna alla pagina precedente',
        ]
      default:
        return ['Riprova più tardi', 'Ricarica la pagina', 'Contatta il supporto se il problema persiste']
    }
  }

  return (
    <div className="space-y-6">
      {onBack && (
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Indietro
          </Button>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {getIcon()}

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Si è verificato un errore</h3>
              <p className="text-muted-foreground">{getErrorMessage()}</p>
            </div>

            {showDetails && details && (
              <details className="text-left">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                  Mostra dettagli tecnici
                </summary>
                <div className="mt-2 p-3 bg-gray-50 rounded text-sm font-mono text-gray-700">{details}</div>
              </details>
            )}

            <div className="space-y-4">
              <div className="text-left">
                <h4 className="font-medium mb-2">Cosa puoi fare:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {getSuggestions().map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-3 justify-center pt-4">
                {onRetry && (
                  <Button onClick={onRetry}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Riprova
                  </Button>
                )}
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Ricarica Pagina
                </Button>
                {onBack && (
                  <Button variant="outline" onClick={onBack}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Torna Indietro
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
