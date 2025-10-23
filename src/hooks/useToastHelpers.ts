import { useToast } from './useToast'

export function useToastHelpers() {
  const { showToast } = useToast()

  const showSuccess = (message: string, duration?: number) => {
    showToast(message, { type: 'success', duration })
  }

  const showError = (message: string, duration?: number) => {
    showToast(message, { type: 'error', duration })
  }

  const showWarning = (message: string, duration?: number) => {
    showToast(message, { type: 'warning', duration })
  }

  const showInfo = (message: string, duration?: number) => {
    showToast(message, { type: 'info', duration })
  }

  const showCustom = (message: string, color: string, duration?: number) => {
    showToast(message, { color, duration })
  }

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showCustom,
    showToast, // For full control
  }
}
