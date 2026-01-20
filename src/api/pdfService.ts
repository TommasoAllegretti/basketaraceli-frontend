import api from './axios'

/**
 * Request payload for PDF generation
 */
export interface PdfGenerationRequest {
  game_stat_id: number
  player_stat_ids: number[]
}

/**
 * Downloads a PDF file for game statistics.
 * Forces browser download with a filename.
 *
 * @param data - The game stat ID and player stat IDs
 * @returns Promise that resolves when download starts
 */
export async function downloadGameStatsPdf(data: PdfGenerationRequest): Promise<void> {
  try {
    const response = await api.post('game-stats/pdf/download', data, {
      responseType: 'blob',
      headers: {
        Accept: 'application/pdf',
        'Content-Type': 'application/json',
      },
    })

    // Create blob URL from response
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)

    // Create temporary link element and trigger download
    const link = document.createElement('a')
    link.href = url

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '')
    link.download = `game-stats-${data.game_stat_id}-${timestamp}.pdf`

    // Trigger download
    document.body.appendChild(link)
    link.click()

    // Cleanup
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error: unknown) {
    console.error('Download PDF error:', error)
    throw error
  }
}

/**
 * Opens a PDF file in a new browser tab/window for viewing.
 *
 * @param data - The game stat ID and player stat IDs
 * @returns Promise that resolves when PDF opens
 */
export async function streamGameStatsPdf(data: PdfGenerationRequest): Promise<void> {
  try {
    const response = await api.post('game-stats/pdf/stream', data, {
      responseType: 'blob',
      headers: {
        Accept: 'application/pdf',
        'Content-Type': 'application/json',
      },
    })

    // Create blob URL from response
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)

    // Open in new window/tab
    const newWindow = window.open(url, '_blank')

    // Check if popup was blocked
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      // Popup was blocked, fallback to download
      const link = document.createElement('a')
      link.href = url
      const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '')
      link.download = `game-stats-${data.game_stat_id}-${timestamp}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      throw new Error('Il popup è stato bloccato. Il PDF è stato scaricato invece.')
    }

    // Clean up blob URL after a delay to allow the PDF to load
    setTimeout(() => {
      window.URL.revokeObjectURL(url)
    }, 100)
  } catch (error: unknown) {
    console.error('Stream PDF error:', error)
    throw error
  }
}

/**
 * Helper function to extract error message from API response
 */
export function getPdfErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return 'Errore durante la generazione del PDF'
  }

  const err = error as {
    response?: {
      status?: number
      data?: {
        message?: string
        errors?: Record<string, string[]>
      }
    }
    message?: string
  }

  // Handle validation errors (422)
  if (err.response?.status === 422) {
    const errors = err.response.data?.errors
    if (errors) {
      const firstError = Object.values(errors)[0]
      return firstError?.[0] || 'Errore di validazione'
    }
    return err.response.data?.message || 'Errore di validazione'
  }

  // Handle not found errors (404)
  if (err.response?.status === 404) {
    return err.response.data?.message || 'Statistiche di gioco non trovate'
  }

  // Handle server errors (500+)
  if (err.response?.status && err.response.status >= 500) {
    return 'Errore del server durante la generazione del PDF'
  }

  // Handle network errors
  if (err.message?.includes('Network') || err.message?.includes('fetch')) {
    return 'Errore di connessione. Verifica la tua connessione internet'
  }

  // Handle popup blocker message
  if (err.message?.includes('popup') || err.message?.includes('bloccato')) {
    return err.message
  }

  // Default error message
  return err.response?.data?.message || err.message || 'Errore durante la generazione del PDF'
}
