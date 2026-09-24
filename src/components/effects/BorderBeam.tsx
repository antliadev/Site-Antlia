import { useEffect, useRef, useState } from 'react'

interface BorderBeamProps {
  duration?: number
  borderWidth?: number
  colorFrom?: string
  colorTo?: string
  className?: string
}

export function BorderBeam({
  duration = 8,
  borderWidth = 1.5,
  colorFrom = 'var(--antlia-cyan, #22d3ee)',
  colorTo = 'var(--antlia-blue, #0071e3)',
  className = '',
}: BorderBeamProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (!containerRef.current) return
    const update = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        })
      }
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const perimeter = 2 * (dimensions.width + dimensions.height)
  const beamLength = Math.max(120, perimeter * 0.25)

  return (
    <div
      ref={containerRef}
      className={`border-beam-container ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        borderRadius: 'inherit',
        overflow: 'hidden',
        zIndex: 5,
      }}
      aria-hidden="true"
    >
      {dimensions.width > 0 && (
        <>
          <style>{`
            @keyframes borderBeamCycle_${Math.round(perimeter)} {
              0% { stroke-dashoffset: 0; }
              100% { stroke-dashoffset: -${perimeter}px; }
            }
          `}</style>
          <svg
            width="100%"
            height="100%"
            style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
          >
            <defs>
              <linearGradient id="borderBeamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={colorFrom} stopOpacity="1" />
                <stop offset="60%" stopColor={colorTo} stopOpacity="0.8" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </linearGradient>
              <filter id="beamGlow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <rect
              x={borderWidth / 2}
              y={borderWidth / 2}
              width={Math.max(0, dimensions.width - borderWidth)}
              height={Math.max(0, dimensions.height - borderWidth)}
              rx="12"
              ry="12"
              fill="none"
              stroke="url(#borderBeamGradient)"
              strokeWidth={borderWidth}
              strokeDasharray={`${beamLength} ${perimeter - beamLength}`}
              filter="url(#beamGlow)"
              style={{
                animation: `borderBeamCycle_${Math.round(perimeter)} ${duration}s linear infinite`,
              }}
            />
          </svg>
        </>
      )}
    </div>
  )
}
