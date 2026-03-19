import type { ReactNode } from 'react'
import { useIntersectionObserver } from '../hooks/useIntersectionObserver'

interface FadeInSectionProps {
  children: ReactNode
  className?: string
}

export default function FadeInSection({ children, className = '' }: FadeInSectionProps) {
  const { ref, isVisible } = useIntersectionObserver(0.1)

  return (
    <div
      ref={ref}
      className={`fade-in-section ${isVisible ? 'is-visible' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
