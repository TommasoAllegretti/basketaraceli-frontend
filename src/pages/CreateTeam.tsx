import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Shield, ArrowLeft, Plus, Building, Trophy, AlertCircle } from 'lucide-react'
import { createTeam, type CreateTeamData } from '@/api/teamService'
import { getLeagues } from '@/api/leagueService'
import { getClubs } from '@/api/clubService'
import { useAuth } from '@/contexts/AuthContext'
import type { League } from '@/models/league'
import type { Club } from '@/models/club'

export function CreateTeam() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()

  const [formData, setFormData] = useState<CreateTeamData>({
    abbreviation: '',
    league_id: undefined,
    club_id: undefined,
  })

  const [leagues, setLeagues] = useState<League[]>([])
  const [clubs, setClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataLoading(true)
        const [leaguesData, clubsData] = await Promise.all([getLeagues(), getClubs()])
        setLeagues(leaguesData)
        setClubs(clubsData)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load leagues and clubs')
      } finally {
        setDataLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleInputChange = (field: keyof CreateTeamData, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
    // Clear messages when user starts typing
    if (error) setError(null)
    if (success) setSuccess(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.abbreviation.trim()) {
      setError('Abbreviation is required')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const response = await createTeam({
        abbreviation: formData.abbreviation.trim(),
        league_id: formData.league_id || undefined,
        club_id: formData.club_id || undefined,
      })

      setSuccess(response.message)

      // Reset form
      setFormData({
        abbreviation: '',
        league_id: undefined,
        club_id: undefined,
      })

      // Redirect to teams list after a short delay
      setTimeout(() => {
        navigate('/teams')
      }, 2000)
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Unauthorized. Only administrators can create teams.')
      } else if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError('Failed to create team. Please try again.')
      }
      console.error('Error creating team:', err)
    } finally {
      setLoading(false)
    }
  }

  if (dataLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/teams')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Teams
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Team</h1>
          <p className="text-muted-foreground">Loading form data...</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/teams')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Teams
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Team</h1>
          <p className="text-muted-foreground">Add a new team to the system</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">Unauthorized Access</p>
              <p className="text-muted-foreground mb-4">Only administrators can create teams.</p>
              <Button onClick={() => navigate('/teams')}>Back to Teams</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/teams')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Teams
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Plus className="h-8 w-8" />
          Create New Team
        </h1>
        <p className="text-muted-foreground">Add a new team to the system</p>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Team Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Abbreviation */}
              <div className="space-y-2">
                <Label htmlFor="abbreviation">
                  Team Abbreviation <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="abbreviation"
                  type="text"
                  placeholder="e.g., LAL, MIA, BOS"
                  value={formData.abbreviation}
                  onChange={e => handleInputChange('abbreviation', e.target.value)}
                  maxLength={10}
                  required
                />
                <p className="text-sm text-muted-foreground">Short abbreviation for the team (max 10 characters)</p>
              </div>

              {/* League */}
              <div className="space-y-2">
                <Label htmlFor="league">
                  <Trophy className="h-4 w-4 inline mr-1" />
                  League (Optional)
                </Label>
                <select
                  id="league"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.league_id || ''}
                  onChange={e => handleInputChange('league_id', e.target.value ? parseInt(e.target.value) : undefined)}
                >
                  <option value="">Select a league (optional)</option>
                  {leagues.map(league => (
                    <option key={league.id} value={league.id}>
                      {league.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Club */}
              <div className="space-y-2">
                <Label htmlFor="club">
                  <Building className="h-4 w-4 inline mr-1" />
                  Club (Optional)
                </Label>
                <select
                  id="club"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.club_id || ''}
                  onChange={e => handleInputChange('club_id', e.target.value ? parseInt(e.target.value) : undefined)}
                >
                  <option value="">Select a club (optional)</option>
                  {clubs.map(club => (
                    <option key={club.id} value={club.id}>
                      {club.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-green-600 text-sm">{success}</p>
                  <p className="text-green-600 text-xs mt-1">Redirecting to teams list...</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button type="submit" disabled={loading || !formData.abbreviation.trim()} className="flex-1">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Team...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Team
                    </>
                  )}
                </Button>

                <Button type="button" variant="outline" onClick={() => navigate('/teams')} disabled={loading}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Help</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Abbreviation:</strong> A short code to identify the team (e.g., "LAL" for Los Angeles Lakers)
            </p>
            <p>
              <strong>League:</strong> The league this team competes in (optional)
            </p>
            <p>
              <strong>Club:</strong> The club this team belongs to (optional)
            </p>
            <p>
              <strong>Note:</strong> Only administrators can create teams
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
