import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, ArrowLeft, Send, AlertCircle, CheckCircle } from 'lucide-react'
import { forgotPassword, type ForgotPasswordData } from '@/api/passwordResetService'

export function ForgotPassword() {
  const [formData, setFormData] = useState<ForgotPasswordData>({
    email: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleInputChange = (value: string) => {
    setFormData({ email: value })
    // Pulisci i messaggi quando l'utente inizia a digitare
    if (error) setError(null)
    if (success) setSuccess(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email.trim()) {
      setError("L'indirizzo email è obbligatorio")
      return
    }

    if (!validateEmail(formData.email.trim())) {
      setError('Inserisci un indirizzo email valido')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      await forgotPassword({
        email: formData.email.trim(),
      })

      setSuccess('Controlla la tua email per le istruzioni di reset')

      // Reset form
      setFormData({ email: '' })
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError("Impossibile inviare il link di reset. Verifica che l'email sia corretta.")
      } else if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError('Errore di connessione. Riprova più tardi.')
      }
      console.error('Errore nel reset password:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Password Dimenticata</h2>
          <p className="mt-2 text-sm text-gray-600">Inserisci la tua email per ricevere le istruzioni di reset</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Recupera Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Indirizzo Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="inserisci@tuaemail.com"
                  value={formData.email}
                  onChange={e => handleInputChange(e.target.value)}
                  disabled={loading}
                  required
                />
                <p className="text-sm text-muted-foreground">Ti invieremo un link per reimpostare la password</p>
              </div>

              {/* Messaggio di Errore */}
              {error && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Messaggio di Successo */}
              {success && (
                <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-md">
                  <CheckCircle className="h-4 w-4" />
                  <div>
                    <span className="text-sm font-medium">{success}</span>
                    <p className="text-xs text-green-600 mt-1">Controlla anche la cartella spam se non vedi l'email</p>
                  </div>
                </div>
              )}

              {/* Pulsante Invio */}
              <div className="space-y-4">
                <Button type="submit" disabled={loading || !formData.email.trim()} className="w-full">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Invio in corso...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Invia Link di Reset
                    </>
                  )}
                </Button>

                {/* Link di ritorno al login */}
                <div className="text-center">
                  <Link to="/login" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Torna al Login
                  </Link>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Informazioni aggiuntive */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="text-sm text-blue-800">
              <h4 className="font-medium mb-2">Informazioni:</h4>
              <ul className="space-y-1 text-xs">
                <li>• Il link di reset è valido per 60 minuti</li>
                <li>• Puoi richiedere un nuovo link se necessario</li>
                <li>• Controlla la cartella spam se non ricevi l'email</li>
                <li>• Il reset funziona solo per account esistenti</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
