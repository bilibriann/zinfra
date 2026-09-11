import type { SiteConfig } from '@/types'

// Fuente única de todo dato que se repite en el sitio. Ningún componente escribe un
// teléfono, un correo ni una URL a mano: todo importa de aquí.
//
// Los valores TODO son pendientes del cliente (§21 del brief) y se dejan visibles a
// propósito: un hueco marcado es preferible a un dato inventado.

export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'TODO@zinfra.cl'

export const siteConfig: SiteConfig = {
  name: 'ZINFRA Solutions',
  description:
    'Instrumentación, neumática, vapor y válvulas para la industria. Distribuidor DE WIT en Chile.',
  url: 'https://TODO.cl',
  nav: [
    { label: 'Inicio', href: '/' },
    // El desplegable lo arma el Header desde src/content/servicios.
    { label: 'Soluciones', href: '#', menu: 'servicios' },
    { label: 'Contacto', href: '/contacto' },
  ],
  contacto: {
    email: CONTACT_EMAIL,
    // Único canal confirmado por el cliente. El teléfono fijo, la dirección y el
    // horario siguen pendientes: van como TODO hasta que lleguen.
    telefono: '+56 9 2631 3009',
    direccion: 'TODO — Santiago de Chile',
    horario: 'TODO',
    whatsapp: '+56 9 2631 3009',
    sedes: [{ ciudad: 'Santiago de Chile', telefono: '+56 9 2631 3009' }],
  },
  redes: { linkedin: '', facebook: '', instagram: '' },
}

// Un pendiente del cliente no debe llegar al HTML publicado (ni al JSON-LD, ni a un
// href). Esta guarda es el filtro único que decide si un valor ya es real.
export function esPendiente(valor: string | undefined | null): boolean {
  return !valor || valor.trim() === '' || valor.includes('TODO')
}
