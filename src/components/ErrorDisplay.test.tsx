import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ErrorDisplay } from '@/components/ErrorDisplay'

describe('ErrorDisplay', () => {
  it('should render error message', () => {
    const errorMessage = 'Something went wrong!'
    render(<ErrorDisplay error={errorMessage} />)

    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  it('should render with custom title', () => {
    const customTitle = 'Custom Error'
    const errorMessage = 'Error details'

    render(<ErrorDisplay title={customTitle} error={errorMessage} />)

    expect(screen.getByText(customTitle)).toBeInTheDocument()
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  it('should render default title when none provided', () => {
    render(<ErrorDisplay error="Test error" />)

    // Check for default title
    expect(screen.getByText('Errore')).toBeInTheDocument()
    expect(screen.getByText('Test error')).toBeInTheDocument()
  })

  it('should render different error types', () => {
    render(<ErrorDisplay error="Network error" type="network" />)

    // Check for the localized network error message
    expect(
      screen.getByText('Problema di connessione. Verifica la tua connessione internet e riprova.'),
    ).toBeInTheDocument()
  })
})
