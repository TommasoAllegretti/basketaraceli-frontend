import * as React from 'react'
import { X } from 'lucide-react'

export interface Toast {
  id: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  color?: string
}

interface ToastProps {
  toast: Toast
  onRemove: (id: string) => void
}

const toastVariants = {
  success: 'bg-green-50 text-green-800 border-l-4 border-green-500',
  error: 'bg-red-50 text-red-800 border-l-4 border-red-500',
  warning: 'bg-yellow-50 text-yellow-800 border-l-4 border-yellow-500',
  info: 'bg-blue-50 text-blue-800 border-l-4 border-blue-500',
}

export function ToastComponent({ toast, onRemove }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id)
    }, toast.duration || 5000)

    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onRemove])

  const baseClasses =
    'flex items-center justify-between p-4 rounded-lg shadow-lg min-w-[300px] max-w-[500px] animate-in slide-in-from-right-full'
  const colorClasses = toast.color || toastVariants[toast.type || 'info']

  return (
    <div className={`${baseClasses} ${colorClasses}`}>
      <span className="flex-1 text-sm font-medium">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="ml-3 p-1 rounded-full hover:bg-black/5 transition-colors opacity-70 hover:opacity-100"
        aria-label="Close toast"
      >
        <X size={16} />
      </button>
    </div>
  )
}

export function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: () => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(toast => (
        <ToastComponent key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}
