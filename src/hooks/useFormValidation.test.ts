import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFormValidation } from '@/hooks/useFormValidation'

interface TestFormData {
  name: string
  email?: string
}

describe('useFormValidation', () => {
  const mockValidationFunction = (data: TestFormData) => {
    const errors: Record<string, string> = {}

    if (!data.name) {
      errors.name = 'Name is required'
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    }
  }

  it('should return initial validation state', () => {
    const { result } = renderHook(() => useFormValidation(mockValidationFunction))

    expect(result.current.errors).toEqual({})
    expect(result.current.isValid).toBe(true)
  })

  it('should validate and return errors', () => {
    const { result } = renderHook(() => useFormValidation(mockValidationFunction))

    act(() => {
      result.current.validate({ name: '' })
    })

    expect(result.current.errors).toEqual({ name: 'Name is required' })
    expect(result.current.isValid).toBe(false)
  })

  it('should clear errors when validation passes', () => {
    const { result } = renderHook(() => useFormValidation(mockValidationFunction))

    // First set some errors
    act(() => {
      result.current.validate({ name: '' })
    })

    expect(result.current.isValid).toBe(false)

    // Then validate successfully
    act(() => {
      result.current.validate({ name: 'John' })
    })

    expect(result.current.errors).toEqual({})
    expect(result.current.isValid).toBe(true)
  })
})
