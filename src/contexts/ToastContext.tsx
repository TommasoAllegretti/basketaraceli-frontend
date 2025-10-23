import * as React from 'react'
import { type Toast, ToastContainer } from '../components/ui/toast'
import { ToastContext } from '../hooks/useToast'

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
