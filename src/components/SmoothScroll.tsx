'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Lenis from 'lenis'

/**
 * Scroll suave global (Lenis). Además intercepta los enlaces de ancla
 * (`#contacto`, ...) para que naveguen con la misma inercia y queden por
 * debajo del header fijo de 80px en lugar de saltar de golpe.
 *
 * No renderiza nada: se monta una vez en el layout raíz. Si el usuario pidió
 * menos movimiento, Lenis ni siquiera se inicializa y el scroll queda nativo.
 */
export function SmoothScroll() {
  const pathname = usePathname()
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.1,
      touchMultiplier: 1.8,
      anchors: { offset: -96 },
    })
    lenisRef.current = lenis

    let rafId = requestAnimationFrame(function raf(time: number) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    })

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  // Al cambiar de página el router deja el scroll arriba, pero Lenis mantiene
  // su propia posición animada: hay que resetearla o la nueva ruta abre a
  // media altura. Con `#hash` no se toca, ahí manda el ancla.
  useEffect(() => {
    if (window.location.hash) return
    lenisRef.current?.scrollTo(0, { immediate: true })
  }, [pathname])

  return null
}
