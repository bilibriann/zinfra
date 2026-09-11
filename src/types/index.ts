export interface NavItem {
  label: string
  href: string
  /**
   * Marca el item como desplegable en vez de enlace. El Header lo reemplaza por
   * el menú de servicios; el Footer lo omite, porque no hay página que enlazar.
   */
  menu?: 'servicios'
}

export interface SiteConfig {
  name: string
  description: string
  url: string
  nav: NavItem[]
  contacto: {
    email: string
    telefono: string
    direccion: string
    horario: string
    /** Pendiente #8 del brief: sin número no se renderiza la burbuja. */
    whatsapp?: string
    /** Zinfra opera en varias ciudades; /contacto los agrupa por sede. */
    sedes?: { ciudad: string; telefono: string }[]
  }
  redes: {
    facebook?: string
    instagram?: string
    linkedin?: string
  }
}
