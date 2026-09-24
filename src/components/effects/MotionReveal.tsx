import { useSyncExternalStore, type ReactNode } from 'react'
import { motion } from 'framer-motion'

interface MotionRevealProps {
  children: ReactNode
  delay?: number
  direction?: 'up' | 'down' | 'none'
  className?: string
  distance?: number
}

const emptySubscribe = () => () => {}

export function MotionReveal({
  children,
  delay = 0,
  direction = 'up',
  className = '',
  distance = 16,
}: MotionRevealProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  if (!isClient) {
    return <div className={className}>{children}</div>
  }

  const y = direction === 'up' ? distance : direction === 'down' ? -distance : 0

  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.02 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
