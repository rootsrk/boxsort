import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TypeSelector } from '@/components/items/type-selector'

// Mock useTypes hook
const mockTypes = [
  { id: '1', name: 'Electronics', color: '#1E88E5', household_id: 'h1', created_at: '', updated_at: '' },
  { id: '2', name: 'Books', color: '#E53935', household_id: 'h1', created_at: '', updated_at: '' },
]

vi.mock('@/lib/hooks/use-types', () => ({
  useTypes: vi.fn(() => ({
    types: mockTypes,
    loading: false,
    error: null,
    createType: vi.fn(),
  })),
}))

describe('TypeSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display available types', () => {
    const selectedTypes: string[] = []
    const onSelectionChange = vi.fn()
    
    render(
      <TypeSelector
        selectedTypes={selectedTypes}
        onSelectionChange={onSelectionChange}
        householdId="h1"
      />
    )
    
    expect(screen.getByText('Electronics')).toBeInTheDocument()
    expect(screen.getByText('Books')).toBeInTheDocument()
  })

  it('should show selected types as checked', () => {
    const selectedTypes = ['1']
    const onSelectionChange = vi.fn()
    
    render(
      <TypeSelector
        selectedTypes={selectedTypes}
        onSelectionChange={onSelectionChange}
        householdId="h1"
      />
    )
    
    const checkbox = screen.getByLabelText('Electronics')
    expect(checkbox).toBeChecked()
  })

  it('should allow creating new types', async () => {
    const user = userEvent.setup()
    const selectedTypes: string[] = []
    const onSelectionChange = vi.fn()
    const { useTypes } = await import('@/lib/hooks/use-types')
    const mockCreateType = vi.fn().mockResolvedValue({ id: '3', name: 'New Type', color: '#FDD835' })
    
    vi.mocked(useTypes).mockReturnValue({
      types: mockTypes,
      loading: false,
      error: null,
      createType: mockCreateType,
      updateType: vi.fn(),
      deleteType: vi.fn(),
      refresh: vi.fn(),
    })
    
    render(
      <TypeSelector
        selectedTypes={selectedTypes}
        onSelectionChange={onSelectionChange}
        householdId="h1"
      />
    )
    
    const input = screen.getByPlaceholderText(/add.*type|create.*type/i)
    await user.type(input, 'New Type')
    await user.keyboard('{Enter}')
    
    await waitFor(() => {
      expect(mockCreateType).toHaveBeenCalledWith('New Type')
    })
  })

  it('should call onSelectionChange when type is toggled', async () => {
    const user = userEvent.setup()
    const selectedTypes: string[] = []
    const onSelectionChange = vi.fn()
    
    render(
      <TypeSelector
        selectedTypes={selectedTypes}
        onSelectionChange={onSelectionChange}
        householdId="h1"
      />
    )
    
    const checkbox = screen.getByLabelText('Electronics')
    await user.click(checkbox)
    
    expect(onSelectionChange).toHaveBeenCalledWith(['1'])
  })
})

