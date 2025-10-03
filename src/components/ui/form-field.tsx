import React from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface FormFieldProps {
  id: string
  label: string
  type?: string
  value: string | number
  onChange: (value: string) => void
  error?: string
  required?: boolean
  placeholder?: string
  min?: string | number
  max?: string | number
  step?: string | number
  maxLength?: number
  icon?: React.ReactNode
  helpText?: string
  disabled?: boolean
  className?: string
}

export function FormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  placeholder,
  min,
  max,
  step,
  maxLength,
  icon,
  helpText,
  disabled = false,
  className,
}: FormFieldProps) {
  const hasError = !!error

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={id} className={cn(hasError && 'text-red-600')}>
        {icon && <span className="inline-flex items-center mr-1">{icon}</span>}
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      <Input
        id={id}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        maxLength={maxLength}
        disabled={disabled}
        required={required}
        className={cn(
          hasError && 'border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500',
          'transition-colors min-h-[44px] text-base sm:text-sm',
        )}
        aria-invalid={hasError}
        aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
      />

      {error && (
        <p id={`${id}-error`} className="text-sm text-red-600 flex items-center gap-1">
          <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}

      {!error && helpText && (
        <p id={`${id}-help`} className="text-sm text-muted-foreground">
          {helpText}
        </p>
      )}
    </div>
  )
}

interface FormSelectProps {
  id: string
  label: string
  value: string | number
  onChange: (val: any) => void
  options: Array<{ value: string | number; label: string; disabled?: boolean }>
  error?: string
  required?: boolean
  placeholder?: string
  icon?: React.ReactNode
  helpText?: string
  disabled?: boolean
  className?: string
}

export function FormSelect({
  id,
  label,
  value,
  onChange,
  options,
  error,
  required = false,
  placeholder = "Seleziona un'opzione",
  icon,
  helpText,
  disabled = false,
  className,
}: FormSelectProps) {
  const hasError = !!error

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={id} className={cn(hasError && 'text-red-600')}>
        {icon && <span className="inline-flex items-center mr-1">{icon}</span>}
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        className={cn(
          'flex min-h-[44px] w-full rounded-md border border-input bg-background px-3 py-2 text-base sm:text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          hasError && 'border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500',
          'transition-colors',
        )}
        aria-invalid={hasError}
        aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
      >
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p id={`${id}-error`} className="text-sm text-red-600 flex items-center gap-1">
          <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}

      {!error && helpText && (
        <p id={`${id}-help`} className="text-sm text-muted-foreground">
          {helpText}
        </p>
      )}
    </div>
  )
}

interface FormErrorSummaryProps {
  errors: Record<string, string>
  title?: string
  className?: string
}

export function FormErrorSummary({ errors, title = 'Correggi i seguenti errori:', className }: FormErrorSummaryProps) {
  const errorEntries = Object.entries(errors)

  if (errorEntries.length === 0) {
    return null
  }

  return (
    <div className={cn('p-4 bg-red-50 border border-red-200 rounded-md', className)}>
      <div className="flex items-start">
        <svg className="h-5 w-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800 mb-2">{title}</h3>
          <ul className="text-sm text-red-700 space-y-1">
            {errorEntries.map(([field, error]) => (
              <li key={field} className="flex items-start">
                <span className="mr-1">•</span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
