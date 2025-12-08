import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TypeBadge } from '@/components/types/type-badge'

describe('TypeBadge', () => {
  it('should display type name', () => {
    render(<TypeBadge name="Electronics" color="#1E88E5" />)
    
    expect(screen.getByText('Electronics')).toBeInTheDocument()
  })

  it('should apply the provided color', () => {
    const { container } = render(<TypeBadge name="Books" color="#E53935" />)
    
    const badge = container.firstChild as HTMLElement
    expect(badge).toHaveStyle({ backgroundColor: '#E53935' })
  })

  it('should use contrasting text color for readability', () => {
    const { container } = render(<TypeBadge name="Test" color="#000000" />)
    
    const badge = container.firstChild as HTMLElement
    // Dark background should have light text
    expect(badge).toHaveStyle({ color: expect.stringMatching(/#FFFFFF|white/i) })
  })

  it('should handle long type names gracefully', () => {
    render(<TypeBadge name="Very Long Type Name That Might Overflow" color="#1E88E5" />)
    
    expect(screen.getByText('Very Long Type Name That Might Overflow')).toBeInTheDocument()
  })

  it('should be clickable when onClick is provided', () => {
    const handleClick = vi.fn()
    render(<TypeBadge name="Clickable" color="#1E88E5" onClick={handleClick} />)
    
    const badge = screen.getByText('Clickable')
    badge.click()
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should not be clickable when onClick is not provided', () => {
    render(<TypeBadge name="Static" color="#1E88E5" />)
    
    const badge = screen.getByText('Static')
    expect(badge).not.toHaveAttribute('role', 'button')
  })
})

