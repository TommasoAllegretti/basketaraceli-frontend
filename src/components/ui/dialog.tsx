import * as React from 'react'

interface DialogProps {
  open: boolean
  onOpenChange: () => void
  children: React.ReactNode
}

interface DialogContentProps {
  className?: string
  children: React.ReactNode
}

interface DialogHeaderProps {
  children: React.ReactNode
}

interface DialogTitleProps {
  children: React.ReactNode
  className?: string
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false)
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      {/* Content */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-4xl xl:max-w-6xl 2xl:max-w-7xl mx-4">
        {children}
      </div>
    </div>
  )
}

export function DialogContent({ className = '', children }: DialogContentProps) {
  return (
    <div
      className={`bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 xl:p-10 max-h-[90vh] overflow-hidden ${className}`}
    >
      {children}
    </div>
  )
}

export function DialogHeader({ children }: DialogHeaderProps) {
  return <div className="mb-4 pb-4 border-b">{children}</div>
}

export function DialogTitle({ children, className = '' }: DialogTitleProps) {
  return <h2 className={`text-lg sm:text-xl lg:text-2xl font-semibold ${className}`}>{children}</h2>
}
