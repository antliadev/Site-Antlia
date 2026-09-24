import { useState, useRef, type MouseEvent, type ReactNode } from 'react'

interface SpotlightCardProps {
  children: ReactNode
  className?: string
  spotlightColor?: string
  onClick?: () => void
}

export function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(34, 211, 238, 0.12)',
  onClick,
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null)
  const [position, setPosition] = useState({ x: -500, y: -500 })
  const [opacity, setOpacity] = useState(0)

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
    setOpacity(1)
  }

  const handleMouseLeave = () => {
    setOpacity(0)
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`spotlight-card ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        className="spotlight-overlay"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity,
          transition: 'opacity 0.25s ease',
          background: `radial-gradient(450px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 75%)`,
          zIndex: 1,
        }}
        aria-hidden="true"
      />
      <div
        className="spotlight-inner"
        style={{
          position: 'relative',
          zIndex: 2,
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {children}
      </div>
    </div>
  )
}
