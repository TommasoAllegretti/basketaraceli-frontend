import { useState, useCallback } from 'react'
import type { ValidationResult } from '@/lib/formValidation'

export function useFormValidation<T>(validateFunction: (data: T) => ValidationResult) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isValid, setIsValid] = useState(true)

  const validate = useCallback(
    (data: T) => {
      const result = validateFunction(data)
      setErrors(result.errors)
      setIsValid(result.isValid)
      return result.isValid
    },
    [validateFunction],
  )

  const validateField = useCallback(
    (data: T, fieldName: string) => {
      const result = validateFunction(data)
      const newErrors = { ...errors }

      if (result.errors[fieldName]) {
        newErrors[fieldName] = result.errors[fieldName]
      } else {
        delete newErrors[fieldName]
      }

      setErrors(newErrors)
      setIsValid(Object.keys(newErrors).length === 0)

      return !result.errors[fieldName]
    },
    [validateFunction, errors],
  )

  const clearErrors = useCallback(() => {
    setErrors({})
    setIsValid(true)
  }, [])

  const clearFieldError = useCallback(
    (fieldName: string) => {
      const newErrors = { ...errors }
      delete newErrors[fieldName]
      setErrors(newErrors)
      setIsValid(Object.keys(newErrors).length === 0)
    },
    [errors],
  )

  return {
    errors,
    isValid,
    validate,
    validateField,
    clearErrors,
    clearFieldError,
    hasErrors: Object.keys(errors).length > 0,
  }
}
