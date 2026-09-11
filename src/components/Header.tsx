'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { siteConfig } from '@/config'
import { CloseIcon, MenuIcon, ArrowRightIcon } from '@/components/icons'

export interface EnlaceServicio {
  slug: string
  titulo: string
}

interface Props {
  servicios: EnlaceServicio[]
}

export function Header({ servicios }: Props) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [serviciosOpen, setServiciosOpen] = useState(false)
  const [serviciosMovilOpen, setServiciosMovilOpen] = useState(false)
  const [lastPathname, setLastPathname] = useState(pathname)
  const [scrolled, setScrolled] = useState(false)
  const serviciosRef = useRef<HTMLLIElement>(null)

  const enServicio = servicios.some((s) => pathname === `/${s.slug}`)

  if (pathname !== lastPathname) {
    setLastPathname(pathname)
    setOpen(false)
    setServiciosOpen(false)
    setServiciosMovilOpen(false)
  }

  useEffect(() => {
    if (!open && !serviciosOpen) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      setOpen(false)
      setServiciosOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, serviciosOpen])

  useEffect(() => {
    if (!serviciosOpen) return
    function handlePointerDown(event: MouseEvent) {
      if (serviciosRef.current?.contains(event.target as Node)) return
      setServiciosOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [serviciosOpen])

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 8)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const enlaceBase =
    'relative block text-[11px] font-medium uppercase tracking-[0.08em] transition-colors duration-200'
  const enlaceActivo = scrolled ? 'text-primary' : 'text-white'
  const enlaceInactivo = scrolled
    ? 'text-on-surface-variant hover:text-primary'
    : 'text-white/70 hover:text-white'

  return (
    <header
      className={
        scrolled
          ? 'fixed top-0 z-50 w-full border-b border-outline-variant/50 bg-white/90 backdrop-blur-md transition-colors duration-300'
          : // Primer tramo del degradado del wordmark: de la coronilla al cuerpo en
            // sus 80px, y el hero lo continúa hasta la base. Sin alfa ni blur —
            // cualquier transparencia aclara el azul y deja de ser el del logo.
            'degradado-cabecera fixed top-0 z-50 w-full border-b border-white/10 transition-colors duration-300'
      }
    >
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 md:px-12">
        <Link href="/" className="shrink-0">
          {/* Dos archivos, no un filtro: el original es opaco y `invert` lo volvía un
              rectángulo blanco. La versión clara la deriva scripts/logo-transparente.mjs. */}
          <Image
            src={scrolled ? '/logo/ZINFRA-LOGO.png' : '/logo/zinfra-logo-claro.png'}
            alt="ZINFRA Solutions"
            width={400}
            height={180}
            priority
            className="h-12 w-auto object-contain transition-all duration-300"
          />
        </Link>
        <ul
          className={
            scrolled
              ? 'pill-nav hidden items-center gap-1 text-primary md:flex'
              : 'pill-nav hidden items-center gap-1 text-white md:flex'
          }
        >
          {siteConfig.nav.map((item) => {
            if (item.menu === 'servicios') {
              if (servicios.length === 0) return null
              return (
                /* Solo clic, sin hover: el hover abría el panel y el clic siguiente
                   lo cerraba de inmediato. Además el clic funciona igual con
                   teclado y en pantallas táctiles. */
                <li key="servicios" ref={serviciosRef} className="relative z-10">
                  <button
                    type="button"
                    data-active={enServicio}
                    aria-expanded={serviciosOpen}
                    aria-controls="menu-servicios"
                    onClick={() => setServiciosOpen((value) => !value)}
                    className={`${enlaceBase} cursor-pointer ${enServicio ? enlaceActivo : enlaceInactivo}`}
                  >
                    <span className="relative z-10 inline-flex items-center gap-1.5 rounded-full px-4 py-2">
                      {item.label}
                      <ArrowRightIcon
                        aria-hidden="true"
                        className={`h-3 w-3 transition-transform duration-200 ${
                          serviciosOpen ? '-rotate-90' : 'rotate-90'
                        }`}
                      />
                    </span>
                  </button>
                  {serviciosOpen && (
                    <ul
                      id="menu-servicios"
                      className="absolute left-1/2 top-full z-20 w-72 -translate-x-1/2 overflow-hidden rounded-md border border-outline-variant/60 bg-white py-2"
                    >
                      {servicios.map((servicio) => {
                        const active = pathname === `/${servicio.slug}`
                        return (
                          <li key={servicio.slug}>
                            <Link
                              href={`/${servicio.slug}`}
                              aria-current={active ? 'page' : undefined}
                              className={`block px-5 py-2.5 text-sm font-medium transition-colors ${
                                active
                                  ? 'bg-surface-container-high text-primary'
                                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary'
                              }`}
                            >
                              {servicio.titulo}
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </li>
              )
            }

            const active = pathname === item.href
            return (
              <li key={item.href} className="relative z-10">
                <Link
                  href={item.href}
                  data-active={active}
                  className={`${enlaceBase} ${active ? enlaceActivo : enlaceInactivo}`}
                >
                  <span className="relative z-10 inline-block rounded-full px-4 py-2">
                    {item.label}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
        <div className="flex items-center gap-2">
          <Link
            href="/contacto"
            className={
              scrolled
                ? 'rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-container hover:text-on-primary-container active:scale-95 md:px-6'
                : 'rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary-container hover:text-on-primary-container active:scale-95 md:px-6'
            }
          >
            Cotizar Ahora
          </Link>
          <button
            type="button"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((value) => !value)}
            className={
              scrolled
                ? 'flex h-10 w-10 items-center justify-center border border-outline-variant text-on-background transition-colors hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:hidden'
                : 'flex h-10 w-10 items-center justify-center border border-white/30 text-white transition-colors hover:border-white hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:hidden'
            }
          >
            {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </nav>
      {open && (
        <div
          id="mobile-nav"
          className={
            scrolled
              ? 'border-t border-outline-variant/50 bg-white md:hidden'
              : 'border-t border-white/10 bg-primary md:hidden'
          }
        >
          <div
            className={
              scrolled
                ? 'flex flex-col divide-y divide-outline-variant/30 px-4'
                : 'flex flex-col divide-y divide-white/10 px-4'
            }
          >
            {siteConfig.nav.map((item) => {
              if (item.menu === 'servicios') {
                if (servicios.length === 0) return null
                return (
                  <div key="servicios">
                    <button
                      type="button"
                      aria-expanded={serviciosMovilOpen}
                      aria-controls="menu-servicios-movil"
                      onClick={() => setServiciosMovilOpen((value) => !value)}
                      className={`flex w-full items-center justify-between py-4 text-sm font-bold tracking-wide ${
                        scrolled
                          ? enServicio
                            ? 'text-primary'
                            : 'text-on-surface'
                          : enServicio
                            ? 'text-white'
                            : 'text-white/70'
                      }`}
                    >
                      {item.label}
                      <ArrowRightIcon
                        aria-hidden="true"
                        className={`h-4 w-4 transition-transform duration-200 ${
                          serviciosMovilOpen ? '-rotate-90' : 'rotate-90'
                        }`}
                      />
                    </button>
                    {serviciosMovilOpen && (
                      <ul id="menu-servicios-movil" className="pb-4">
                        {servicios.map((servicio) => {
                          const active = pathname === `/${servicio.slug}`
                          return (
                            <li key={servicio.slug}>
                              <Link
                                href={`/${servicio.slug}`}
                                aria-current={active ? 'page' : undefined}
                                className={`block py-2.5 pl-4 text-sm font-medium ${
                                  scrolled
                                    ? active
                                      ? 'text-primary'
                                      : 'text-on-surface-variant hover:text-primary'
                                    : active
                                      ? 'text-white'
                                      : 'text-white/70 hover:text-white'
                                }`}
                              >
                                {servicio.titulo}
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>
                )
              }

              const active = pathname === item.href
              const clase = scrolled
                ? active
                  ? 'text-primary'
                  : 'text-on-surface transition-colors hover:text-primary'
                : active
                  ? 'text-white'
                  : 'text-white/70 transition-colors hover:text-white'
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`py-4 text-sm font-bold tracking-wide ${clase}`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </header>
  )
}
