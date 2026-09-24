import { useEffect, useState } from 'react'

export function ScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight
      if (totalScroll <= 0) {
        setProgress(0)
        return
      }
      const currentScroll = window.scrollY
      setProgress(Math.min(100, Math.max(0, (currentScroll / totalScroll) * 100)))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      className="scroll-progress-bar"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: `${progress}%`,
        height: '2.5px',
        background: 'linear-gradient(90deg, var(--antlia-blue, #0071e3), var(--antlia-cyan, #22d3ee))',
        boxShadow: '0 0 10px rgba(34, 211, 238, 0.65)',
        zIndex: 9999,
        transition: 'width 0.1s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  )
}
