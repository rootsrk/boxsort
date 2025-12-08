'use client'

import { motion } from 'framer-motion'
import { HTMLAttributes } from 'react'
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion'
import { Card } from './card'

interface AnimatedCardProps extends HTMLAttributes<HTMLDivElement> {
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
}

export function AnimatedCard({
  children,
  delay = 0,
  direction = 'up',
  className = '',
  ...props
}: AnimatedCardProps) {
  const prefersReducedMotion = useReducedMotion()

  const variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 20 : direction === 'down' ? -20 : 0,
      x: direction === 'left' ? 20 : direction === 'right' ? -20 : 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        duration: 0.4,
        delay,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  }

  if (prefersReducedMotion) {
    return (
      <Card className={className} {...props}>
        {children}
      </Card>
    )
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants}
      className={className}
    >
      <Card {...props}>{children}</Card>
    </motion.div>
  )
}

