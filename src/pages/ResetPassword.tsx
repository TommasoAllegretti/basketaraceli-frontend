import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock, Mail, ArrowLeft, Save, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { resetPassword, type ResetPasswordData } from '@/api/passwordResetService'

export function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const emailParam = searchParams.get('email')

  const [formData, setFormData] = useState<ResetPasswordData>({
    token: '',
    email: '',
    password: '',
    password_confirmation: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    // Verifica che token e email siano presenti nei parametri URL
    if (!token || !emailParam) {
      setError('Link di reset non valido. Richiedi un nuovo link.')
      return
    }

    setFormData(prev => ({
      ...prev,
      token: token,
      email: emailParam,
    }))
  }, [token, emailParam])

  const handleInputChange = (field: keyof ResetPasswordData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))

    // Pulisci i messaggi quando l'utente inizia a digitare
    if (error) setError(null)
    if (success) setSuccess(null)

    // Pulisci errori di validazione specifici
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.password) {
      errors.password = 'La password è obbligatoria'
    } else if (formData.password.length < 6) {
      errors.password = 'La password deve essere di almeno 6 caratteri'
    }

    if (!formData.password_confirmation) {
      errors.password_confirmation = 'La conferma password è obbligatoria'
    } else if (formData.password !== formData.password_confirmation) {
      errors.password_confirmation = 'Le password non corrispondono'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (!token || !emailParam) {
      setError('Parametri di reset mancanti. Richiedi un nuovo link.')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      await resetPassword({
        token: token,
        email: emailParam,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      })

      setSuccess('Password reimpostata con successo!')

      // Reindirizza al login dopo un breve ritardo
      setTimeout(() => {
        navigate('/login', {
          state: { message: 'Password reimpostata con successo. Effettua il login con la nuova password.' },
        })
      }, 2000)
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError('Token scaduto o non valido. Richiedi un nuovo link di reset.')
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

  // Se non ci sono parametri validi, mostra errore
  if (!token || !emailParam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Link Non Valido</h2>
                <p className="text-gray-600 mb-4">Il link di reset password non è valido o è scaduto.</p>
                <div className="space-y-2">
                  <Button onClick={() => navigate('/forgot-password')} className="w-full">
                    Richiedi Nuovo Link
                  </Button>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center w-full text-sm text-blue-600 hover:text-blue-500"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Torna al Login
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Reimposta Password</h2>
          <p className="mt-2 text-sm text-gray-600">Inserisci la tua nuova password</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Nuova Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Email
                </Label>
                <Input id="email" type="email" value={emailParam} disabled className="bg-gray-50" />
                <p className="text-sm text-muted-foreground">Account per cui stai reimpostando la password</p>
              </div>

              {/* Nuova Password */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  <Lock className="h-4 w-4 inline mr-1" />
                  Nuova Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Inserisci la nuova password"
                    value={formData.password}
                    onChange={e => handleInputChange('password', e.target.value)}
                    disabled={loading}
                    className={validationErrors.password ? 'border-red-500' : ''}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {validationErrors.password && <p className="text-sm text-red-500">{validationErrors.password}</p>}
                <p className="text-sm text-muted-foreground">Minimo 6 caratteri</p>
              </div>

              {/* Conferma Password */}
              <div className="space-y-2">
                <Label htmlFor="password_confirmation">
                  <Lock className="h-4 w-4 inline mr-1" />
                  Conferma Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password_confirmation"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Conferma la nuova password"
                    value={formData.password_confirmation}
                    onChange={e => handleInputChange('password_confirmation', e.target.value)}
                    disabled={loading}
                    className={validationErrors.password_confirmation ? 'border-red-500' : ''}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {validationErrors.password_confirmation && (
                  <p className="text-sm text-red-500">{validationErrors.password_confirmation}</p>
                )}
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
                    <p className="text-xs text-green-600 mt-1">Reindirizzamento al login...</p>
                  </div>
                </div>
              )}

              {/* Pulsanti */}
              <div className="space-y-4">
                <Button
                  type="submit"
                  disabled={loading || !formData.password || !formData.password_confirmation}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Reimpostazione...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Reimposta Password
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

        {/* Informazioni di sicurezza */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="text-sm text-yellow-800">
              <h4 className="font-medium mb-2">Sicurezza:</h4>
              <ul className="space-y-1 text-xs">
                <li>• Usa una password forte e unica</li>
                <li>• Non condividere la password con nessuno</li>
                <li>• Il token scade in 60 minuti</li>
                <li>• Dopo il reset, effettua subito il login</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
