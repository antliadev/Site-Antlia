import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { motion } from 'framer-motion'

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

const VERTEX_SHADER_SRC = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;

  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_texCoord;
  }
`

const FRAGMENT_SHADER_SRC = `
  precision highp float;
  varying vec2 v_texCoord;
  uniform sampler2D u_image;

  void main() {
    vec4 color = texture2D(u_image, v_texCoord);
    
    // Chroma key detection based on green dominance over red/blue
    float maxRB = max(color.r, color.b);
    float diff = color.g - maxRB;
    
    // Thresholds: diff between 0.07 and 0.235 transitions smoothly from opaque to transparent
    float alpha = 1.0 - smoothstep(0.07, 0.235, diff);
    
    // Green spill suppression: despill fringe pixels to prevent green halo
    float t = clamp((diff - 0.07) / (0.235 - 0.07), 0.0, 1.0);
    float cleanG = mix(color.g, maxRB * 1.02, t);
    
    vec3 cleanRgb = vec3(color.r, cleanG, color.b);
    
    // Premultiplied alpha for physically correct WebGL compositing
    gl_FragColor = vec4(cleanRgb * alpha, color.a * alpha);
  }
`

export function HomeHeroVideo({
  videoSrc = '/media/antlia-home-hero.mp4',
  posterSrc = '/media/antlia-home-hero-transparent-poster.png',
  className = '',
}: HomeHeroVideoProps) {
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  )

  const containerRef = useRef<HTMLDivElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const isReadyRef = useRef(false)
  const [isReady, setIsReady] = useState(false)
  const [useFallback, setUseFallback] = useState(false)

  useEffect(() => {
    if (reduceMotion || typeof window === 'undefined') return

    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const gl = canvas.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
      antialias: true,
    })

    if (!gl) {
      setUseFallback(true)
      return
    }

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type)
      if (!shader) return null
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader)
        return null
      }
      return shader
    }

    const vertShader = createShader(gl.VERTEX_SHADER, VERTEX_SHADER_SRC)
    const fragShader = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC)
    if (!vertShader || !fragShader) {
      setUseFallback(true)
      return
    }

    const program = gl.createProgram()
    if (!program) {
      setUseFallback(true)
      return
    }

    gl.attachShader(program, vertShader)
    gl.attachShader(program, fragShader)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program)
      setUseFallback(true)
      return
    }

    gl.useProgram(program)

    // Position quad
    const positionLocation = gl.getAttribLocation(program, 'a_position')
    const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord')

    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
      ]),
      gl.STATIC_DRAW
    )

    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

    // Flip Y for texture coordinates
    const texCoordBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        0, 1,
        1, 1,
        0, 0,
        0, 0,
        1, 1,
        1, 0,
      ]),
      gl.STATIC_DRAW
    )

    gl.enableVertexAttribArray(texCoordLocation)
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0)

    // Setup Video Texture
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clearColor(0, 0, 0, 0)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

    let animationFrameId: number
    let isRunning = true

    const render = () => {
      if (!isRunning) return

      if (video.readyState >= 2 && !video.paused) {
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video)
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.drawArrays(gl.TRIANGLES, 0, 6)
        if (!isReadyRef.current) {
          isReadyRef.current = true
          setIsReady(true)
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    const handleVisibility = () => {
      if (document.hidden) {
        isRunning = false
        video.pause()
      } else {
        isRunning = true
        video.play().catch(() => {})
        animationFrameId = requestAnimationFrame(render)
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)

    // Start video playback
    video.play().then(() => {
      render()
    }).catch(() => {
      setUseFallback(true)
    })

    return () => {
      isRunning = false
      cancelAnimationFrame(animationFrameId)
      document.removeEventListener('visibilitychange', handleVisibility)
      if (program) gl.deleteProgram(program)
      if (vertShader) gl.deleteShader(vertShader)
      if (fragShader) gl.deleteShader(fragShader)
      if (texture) gl.deleteTexture(texture)
      if (positionBuffer) gl.deleteBuffer(positionBuffer)
      if (texCoordBuffer) gl.deleteBuffer(texCoordBuffer)
    }
  }, [reduceMotion])

  return (
    <div ref={containerRef} className={`home-hero-floating-workstation ${className}`} aria-hidden="true">
      {/* Ambient glowing radial backplate */}
      <div className="workstation-ambient-glow" />

      {/* Floating interactive stage with subtle bobbing */}
      <motion.div
        className="workstation-stage"
        animate={reduceMotion ? undefined : { y: [-7, 7, -7] }}
        transition={
          reduceMotion
            ? undefined
            : { duration: 6, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        {reduceMotion || useFallback ? (
          <img
            className="home-hero-floating-poster"
            src={posterSrc}
            alt=""
            loading="eager"
            decoding="async"
          />
        ) : (
          <>
            <video
              ref={videoRef}
              className="home-hero-video-source"
              src={videoSrc}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              style={{ display: 'none' }}
              onError={() => setUseFallback(true)}
            />
            {/* Show static transparent poster while WebGL starts */}
            {!isReady && (
              <img
                className="home-hero-floating-poster"
                src={posterSrc}
                alt=""
                loading="eager"
                decoding="async"
              />
            )}
            <canvas
              ref={canvasRef}
              className={`home-hero-chroma-canvas ${isReady ? 'visible' : 'hidden'}`}
              width={1280}
              height={720}
            />
          </>
        )}
      </motion.div>
    </div>
  )
}
