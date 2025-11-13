import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      const result = cn('px-4', 'py-2')
      expect(result).toBe('px-4 py-2')
    })

    it('should handle conditional classes', () => {
      // eslint-disable-next-line no-constant-binary-expression
      const result = cn('base-class', true && 'active', false && 'inactive')
      expect(result).toBe('base-class active')
    })

    it('should merge conflicting Tailwind classes', () => {
      const result = cn('px-4 px-6', 'py-2')
      expect(result).toBe('px-6 py-2')
    })

    it('should handle undefined and null values', () => {
      const result = cn('base', undefined, null, 'other')
      expect(result).toBe('base other')
    })

    it('should handle empty input', () => {
      const result = cn()
      expect(result).toBe('')
    })

    it('should handle arrays of classes', () => {
      const result = cn(['px-4', 'py-2'], 'bg-blue-500')
      expect(result).toBe('px-4 py-2 bg-blue-500')
    })

    it('should handle objects with boolean values', () => {
      const result = cn({
        'text-red-500': true,
        'text-blue-500': false,
        'font-bold': true,
      })
      expect(result).toBe('text-red-500 font-bold')
    })
  })
})
