import * as React from 'react'
import { type Toast, ToastContainer } from '../components/ui/toast'

interface ToastContextType {
  showToast: (message: string, options?: Partial<Omit<Toast, 'id' | 'message'>>) => void
  removeToast: (id: string) => void
  toasts: Toast[]
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const showToast = React.useCallback((message: string, options?: Partial<Omit<Toast, 'id' | 'message'>>) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: Toast = {
      id,
      message,
      type: options?.type || 'info',
      duration: options?.duration || 5000,
      color: options?.color,
    }

    setToasts(prev => [...prev, newToast])
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const value = React.useMemo(
    () => ({
      showToast,
      removeToast,
      toasts,
    }),
    [showToast, removeToast, toasts],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
