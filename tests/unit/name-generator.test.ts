import { describe, it, expect } from 'vitest'
import { generateFunkyName, generateMultipleFunkyNames, isFunkyName } from '@/lib/utils/name-generator'

describe('Name Generator', () => {
  describe('generateFunkyName', () => {
    it('should generate a name with three hyphen-separated words', () => {
      const name = generateFunkyName()
      const parts = name.split('-')
      
      expect(parts.length).toBe(3)
      expect(parts[0].length).toBeGreaterThan(0)
      expect(parts[1].length).toBeGreaterThan(0)
      expect(parts[2].length).toBeGreaterThan(0)
    })

    it('should generate lowercase names', () => {
      const name = generateFunkyName()
      expect(name).toBe(name.toLowerCase())
    })

    it('should generate different names on subsequent calls', () => {
      const names = new Set<string>()
      for (let i = 0; i < 100; i++) {
        names.add(generateFunkyName())
      }
      // With 100 attempts, we should get mostly unique names
      expect(names.size).toBeGreaterThan(90)
    })
  })

  describe('generateMultipleFunkyNames', () => {
    it('should generate the requested number of names', () => {
      const names = generateMultipleFunkyNames(5)
      expect(names.length).toBe(5)
    })

    it('should generate unique names', () => {
      const names = generateMultipleFunkyNames(10)
      const uniqueNames = new Set(names)
      expect(uniqueNames.size).toBe(10)
    })
  })

  describe('isFunkyName', () => {
    it('should return true for valid funky names', () => {
      expect(isFunkyName('purple-tiger-cloud')).toBe(true)
      expect(isFunkyName('golden-falcon-river')).toBe(true)
      expect(isFunkyName('a-b-c')).toBe(true)
    })

    it('should return false for invalid names', () => {
      expect(isFunkyName('single')).toBe(false)
      expect(isFunkyName('two-parts')).toBe(false)
      expect(isFunkyName('too-many-parts-here')).toBe(false)
      expect(isFunkyName('')).toBe(false)
      expect(isFunkyName('--')).toBe(false)
    })
  })
})

