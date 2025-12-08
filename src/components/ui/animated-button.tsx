'use client'

import { motion } from 'framer-motion'
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion'
import { Button, ButtonProps } from './button'

interface AnimatedButtonProps extends ButtonProps {
  hoverScale?: number
  hoverRotate?: number
}

export function AnimatedButton({
  children,
  hoverScale = 1.05,
  hoverRotate = 0,
  className = '',
  ...props
}: AnimatedButtonProps) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return (
      <Button className={className} {...props}>
        {children}
      </Button>
    )
  }

  return (
    <motion.div
      whileHover={{ scale: hoverScale, rotate: hoverRotate }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <Button className={className} {...props}>
        {children}
      </Button>
    </motion.div>
  )
}

