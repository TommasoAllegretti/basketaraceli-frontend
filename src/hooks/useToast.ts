import * as React from 'react'

interface ToastContextType {
  showToast: (
    message: string,
    options?: Partial<Omit<import('../components/ui/toast').Toast, 'id' | 'message'>>,
  ) => void
  removeToast: (id: string) => void
  toasts: import('../components/ui/toast').Toast[]
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = React.useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export { ToastContext }
export type { ToastContextType }
