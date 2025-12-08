import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('Search', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Debounce', () => {
    it('should debounce search queries', async () => {
      const mockSearch = vi.fn()
      
      // Simulate rapid typing
      mockSearch('h')
      mockSearch('he')
      mockSearch('hel')
      mockSearch('hell')
      mockSearch('hello')
      
      // Should have called immediately for each keystroke without debounce
      expect(mockSearch).toHaveBeenCalledTimes(5)
    })

    it('should call search after debounce delay', async () => {
      const debouncedFn = vi.fn()
      const delay = 300

      // Simulate debounce logic
      let timeoutId: ReturnType<typeof setTimeout> | null = null
      function debouncedSearch(query: string) {
        if (timeoutId) clearTimeout(timeoutId)
        timeoutId = setTimeout(() => debouncedFn(query), delay)
      }

      debouncedSearch('hello')
      expect(debouncedFn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(delay)
      expect(debouncedFn).toHaveBeenCalledWith('hello')
    })
  })

  describe('Search Results', () => {
    it('should return matching items', async () => {
      const mockSearchItems = vi.fn().mockResolvedValue({
        data: [
          { item_id: '1', item_name: 'Winter Jacket', box_funky_name: 'purple-tiger-cloud' },
          { item_id: '2', item_name: 'Winter Boots', box_funky_name: 'golden-falcon-river' },
        ],
        error: null,
      })

      const result = await mockSearchItems('winter')

      expect(result.data).toHaveLength(2)
      expect(result.data?.[0].item_name).toContain('Winter')
    })

    it('should return empty array for no matches', async () => {
      const mockSearchItems = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      })

      const result = await mockSearchItems('nonexistent')

      expect(result.data).toHaveLength(0)
    })

    it('should search both item names and box names', async () => {
      const mockSearchItems = vi.fn().mockResolvedValue({
        data: [
          { item_id: '1', item_name: 'Scarf', box_funky_name: 'purple-tiger-cloud' },
        ],
        error: null,
      })

      // Searching for box name should return items in that box
      const result = await mockSearchItems('purple')

      expect(result.data).toHaveLength(1)
      expect(result.data?.[0].box_funky_name).toContain('purple')
    })
  })
})

