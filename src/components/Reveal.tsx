'use client'

import { useEffect, useRef, type ElementType, type ReactNode } from 'react'

type Variante = 'arriba' | 'izquierda' | 'derecha'

const CLASE: Record<Variante, string> = {
  arriba: 'al-ver',
  izquierda: 'al-ver-izq',
  derecha: 'al-ver-der',
}

interface Props {
  children: ReactNode
  className?: string
  variante?: Variante
  retraso?: number
  as?: ElementType
}

/**
 * Envuelve contenido y lo revela cuando entra en viewport: opacidad 0 -> 1 más
 * un desplazamiento de 36px (hacia arriba, o desde la izquierda/derecha). El
 * estado inicial y la transición viven en `.al-ver*` (globals.css); aquí solo
 * se añade la clase `visible` la primera vez que el elemento se cruza.
 *
 * `retraso` (ms) escalona varios hijos: pásalo como `indice * 120`.
 */
export function Reveal({
  children,
  className = '',
  variante = 'arriba',
  retraso = 0,
  as: Tag = 'div',
}: Props) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return
        el.classList.add('visible')
        observer.unobserve(el)
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      className={`${CLASE[variante]}${className ? ` ${className}` : ''}`}
      style={retraso ? { transitionDelay: `${retraso}ms` } : undefined}
    >
      {children}
    </Tag>
  )
}
