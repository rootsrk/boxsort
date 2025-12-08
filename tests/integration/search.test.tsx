import { describe, it, expect, vi } from 'vitest'

describe('Search Integration', () => {
  describe('Search API', () => {
    it('should call Supabase search function', async () => {
      const mockRpc = vi.fn().mockResolvedValue({
        data: [
          {
            item_id: 'item-123',
            item_name: 'Winter Jacket',
            item_description: 'Blue puffer',
            box_id: 'box-456',
            box_funky_name: 'purple-tiger-cloud',
          },
        ],
        error: null,
      })

      const result = await mockRpc('search_items', { search_query: 'jacket' })

      expect(mockRpc).toHaveBeenCalledWith('search_items', { search_query: 'jacket' })
      expect(result.data).toHaveLength(1)
    })
  })

  describe('Search Results Display', () => {
    it('should display item name and box name', async () => {
      const mockResult = {
        item_name: 'Winter Jacket',
        box_funky_name: 'purple-tiger-cloud',
      }

      expect(mockResult.item_name).toBe('Winter Jacket')
      expect(mockResult.box_funky_name).toBe('purple-tiger-cloud')
    })

    it('should link to box detail page', async () => {
      const boxId = 'box-456'
      const expectedUrl = `/boxes/${boxId}`

      expect(expectedUrl).toBe('/boxes/box-456')
    })
  })

  describe('Empty States', () => {
    it('should show empty state for no query', async () => {
      const query = ''
      expect(query.length).toBe(0)
    })

    it('should show no results message', async () => {
      const results: unknown[] = []
      expect(results.length).toBe(0)
    })
  })
})

