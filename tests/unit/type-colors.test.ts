import { describe, it, expect } from 'vitest'
import {
  TYPE_COLORS,
  getTypeColor,
  getColorByIndex,
  getAllTypeColors,
  isValidTypeColor,
  getContrastingTextColor,
} from '@/lib/utils/type-colors'

describe('type-colors', () => {
  describe('TYPE_COLORS', () => {
    it('should contain at least 10 colors', () => {
      expect(TYPE_COLORS.length).toBeGreaterThanOrEqual(10)
    })

    it('should contain valid hex colors', () => {
      const hexRegex = /^#[0-9A-Fa-f]{6}$/
      TYPE_COLORS.forEach((color) => {
        expect(color).toMatch(hexRegex)
      })
    })
  })

  describe('getTypeColor', () => {
    it('should return a color from the palette', () => {
      const color = getTypeColor('Electronics')

      expect(TYPE_COLORS).toContain(color)
    })

    it('should return the same color for the same name', () => {
      const color1 = getTypeColor('Books')
      const color2 = getTypeColor('Books')

      expect(color1).toBe(color2)
    })

    it('should be case-insensitive', () => {
      const color1 = getTypeColor('Books')
      const color2 = getTypeColor('BOOKS')
      const color3 = getTypeColor('books')

      expect(color1).toBe(color2)
      expect(color2).toBe(color3)
    })

    it('should handle whitespace consistently', () => {
      const color1 = getTypeColor('Kitchen Supplies')
      const color2 = getTypeColor('  Kitchen Supplies  ')

      expect(color1).toBe(color2)
    })

    it('should return different colors for different names', () => {
      const colors = new Set<string>()
      const testNames = [
        'Electronics',
        'Books',
        'Clothes',
        'Tools',
        'Kitchen',
        'Office',
        'Garden',
        'Sports',
      ]

      testNames.forEach((name) => {
        colors.add(getTypeColor(name))
      })

      // Should have some variety (at least 3 different colors)
      expect(colors.size).toBeGreaterThanOrEqual(3)
    })
  })

  describe('getColorByIndex', () => {
    it('should return a color for valid index', () => {
      const color = getColorByIndex(0)

      expect(TYPE_COLORS).toContain(color)
    })

    it('should wrap around for indices beyond array length', () => {
      const color1 = getColorByIndex(0)
      const color2 = getColorByIndex(TYPE_COLORS.length)

      expect(color1).toBe(color2)
    })

    it('should return different colors for different indices', () => {
      const color1 = getColorByIndex(0)
      const color2 = getColorByIndex(1)

      expect(color1).not.toBe(color2)
    })
  })

  describe('getAllTypeColors', () => {
    it('should return all colors', () => {
      const colors = getAllTypeColors()

      expect(colors).toBe(TYPE_COLORS)
      expect(colors.length).toBe(TYPE_COLORS.length)
    })

    it('should return a readonly array', () => {
      const colors = getAllTypeColors()

      // TypeScript ensures this is readonly, but we can check it's the same reference
      expect(colors).toBe(TYPE_COLORS)
    })
  })

  describe('isValidTypeColor', () => {
    it('should return true for valid type colors', () => {
      TYPE_COLORS.forEach((color) => {
        expect(isValidTypeColor(color)).toBe(true)
      })
    })

    it('should return false for invalid colors', () => {
      expect(isValidTypeColor('#000000')).toBe(false)
      expect(isValidTypeColor('#FFFFFF')).toBe(false)
      expect(isValidTypeColor('red')).toBe(false)
      expect(isValidTypeColor('')).toBe(false)
    })
  })

  describe('getContrastingTextColor', () => {
    it('should return black for light backgrounds', () => {
      // Yellow is a light color
      expect(getContrastingTextColor('#FDD835')).toBe('#000000')
      // White
      expect(getContrastingTextColor('#FFFFFF')).toBe('#000000')
    })

    it('should return white for dark backgrounds', () => {
      // Bauhaus Blue is dark
      expect(getContrastingTextColor('#1E88E5')).toBe('#FFFFFF')
      // Bauhaus Red is dark
      expect(getContrastingTextColor('#E53935')).toBe('#FFFFFF')
      // Black
      expect(getContrastingTextColor('#000000')).toBe('#FFFFFF')
    })

    it('should handle colors with # prefix', () => {
      expect(getContrastingTextColor('#FDD835')).toBe('#000000')
    })

    it('should handle colors without # prefix', () => {
      expect(getContrastingTextColor('FDD835')).toBe('#000000')
    })
  })
})

