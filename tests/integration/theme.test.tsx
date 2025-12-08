import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

describe('Bauhaus Theme Integration', () => {
  it('should apply Bauhaus styling to Button component', () => {
    const { container } = render(<Button>Test Button</Button>)
    const button = container.querySelector('button')
    
    expect(button).toHaveClass('bauhaus-border')
  })

  it('should apply Bauhaus styling to Card component', () => {
    const { container } = render(<Card>Test Card</Card>)
    const card = container.querySelector('div')
    
    expect(card).toHaveClass('border-2', 'border-black')
  })

  it('should apply Bauhaus styling to Input component', () => {
    const { container } = render(<Input placeholder="Test input" />)
    const input = container.querySelector('input')
    
    expect(input).toHaveClass('border-2', 'border-black')
  })

  it('should render components with consistent Bauhaus design', () => {
    render(
      <div>
        <Button>Button</Button>
        <Card>Card</Card>
        <Input placeholder="Input" />
      </div>
    )

    expect(screen.getByText('Button')).toBeInTheDocument()
    expect(screen.getByText('Card')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Input')).toBeInTheDocument()
  })
})

