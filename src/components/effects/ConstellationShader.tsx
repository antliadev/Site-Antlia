import { useEffect, useRef } from 'react'

interface Point {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  baseAlpha: number
  phase: number
}

export function ConstellationShader({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let isVisible = true
    let width = 0
    let height = 0
    const mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000, radius: 140 }

    const points: Point[] = []
    const POINT_COUNT = 48
    const MAX_DIST = 110

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = canvas.parentElement?.clientWidth || window.innerWidth
      height = canvas.parentElement?.clientHeight || window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.scale(dpr, dpr)

      // Initialize points if empty
      if (points.length === 0) {
        for (let i = 0; i < POINT_COUNT; i++) {
          points.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.45,
            vy: (Math.random() - 0.5) * 0.45,
            radius: Math.random() * 1.5 + 1.2,
            baseAlpha: Math.random() * 0.4 + 0.3,
            phase: Math.random() * Math.PI * 2,
          })
        }
      }
    }

    resize()
    window.addEventListener('resize', resize)

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.targetX = e.clientX - rect.left
      mouse.targetY = e.clientY - rect.top
    }

    const handleMouseLeave = () => {
      mouse.targetX = -1000
      mouse.targetY = -1000
    }

    const parent = canvas.parentElement
    if (parent) {
      parent.addEventListener('mousemove', handleMouseMove)
      parent.addEventListener('mouseleave', handleMouseLeave)
    }

    // Observer to pause animation when offscreen
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting
    })
    observer.observe(canvas)

    let t = 0
    const render = () => {
      if (isVisible) {
        t += 0.015
        ctx.clearRect(0, 0, width, height)

        // Smooth mouse dampening
        mouse.x += (mouse.targetX - mouse.x) * 0.1
        mouse.y += (mouse.targetY - mouse.y) * 0.1

        // Update & draw points
        for (let i = 0; i < points.length; i++) {
          const p = points[i]

          p.x += p.vx
          p.y += p.vy

          // Wrap around edges with slight padding
          if (p.x < -10) p.x = width + 10
          if (p.x > width + 10) p.x = -10
          if (p.y < -10) p.y = height + 10
          if (p.y > height + 10) p.y = -10

          // Mouse gravity interaction
          const dx = mouse.x - p.x
          const dy = mouse.y - p.y
          const distMouse = Math.hypot(dx, dy)
          if (distMouse < mouse.radius && distMouse > 0) {
            const force = (1 - distMouse / mouse.radius) * 0.8
            p.x += (dx / distMouse) * force
            p.y += (dy / distMouse) * force
          }

          // Pulsing opacity
          const alpha = p.baseAlpha + Math.sin(t + p.phase) * 0.18

          // Draw node
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(34, 211, 238, ${Math.max(0.1, alpha)})`
          ctx.shadowColor = 'rgba(0, 113, 227, 0.5)'
          ctx.shadowBlur = 6
          ctx.fill()
          ctx.shadowBlur = 0

          // Draw connections to nearby points
          for (let j = i + 1; j < points.length; j++) {
            const p2 = points[j]
            const dist = Math.hypot(p2.x - p.x, p2.y - p.y)

            if (dist < MAX_DIST) {
              const lineAlpha = (1 - dist / MAX_DIST) * 0.22
              ctx.beginPath()
              ctx.moveTo(p.x, p.y)
              ctx.lineTo(p2.x, p2.y)
              ctx.strokeStyle = `rgba(34, 211, 238, ${lineAlpha})`
              ctx.lineWidth = 0.85
              ctx.stroke()
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resize)
      if (parent) {
        parent.removeEventListener('mousemove', handleMouseMove)
        parent.removeEventListener('mouseleave', handleMouseLeave)
      }
      observer.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`constellation-canvas ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 2,
      }}
      aria-hidden="true"
    />
  )
}
