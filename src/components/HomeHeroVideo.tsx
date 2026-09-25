import { useRef, useState, useSyncExternalStore } from 'react'

interface HomeHeroVideoProps {
  videoSrc?: string
  posterSrc?: string
  className?: string
}

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === 'undefined') return () => {}
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  mq.addEventListener('change', callback)
  return () => mq.removeEventListener('change', callback)
}

function getReducedMotionSnapshot() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function getReducedMotionServerSnapshot() {
  return false
}

export function HomeHeroVideo({
  videoSrc = '/media/antlia-home-hero.mp4',
  posterSrc = '/media/antlia-home-hero-poster.jpg',
  className = '',
}: HomeHeroVideoProps) {
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  )
  const [hasError, setHasError] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  return (
    <div className={`home-hero-media ${className}`} aria-hidden="true">
      {reduceMotion || hasError ? (
        <img
          className="home-hero-poster"
          src={posterSrc}
          alt=""
          loading="eager"
          decoding="async"
        />
      ) : (
        <video
          ref={videoRef}
          className="home-hero-video"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={posterSrc}
          onError={() => setHasError(true)}
        >
          <source src={videoSrc} type="video/mp4" />
          <img
            className="home-hero-poster"
            src={posterSrc}
            alt=""
            loading="eager"
            decoding="async"
          />
        </video>
      )}
      <div className="home-hero-video-overlay" />
    </div>
  )
}
