import Image from 'next/image'
import Link from 'next/link'
import { siteConfig } from '@/config'
import { CallIcon, MailIcon, ShareIcon, GlobeIcon } from '@/components/icons'

export function Footer() {
  return (
    <footer className="border-t-4 border-accent bg-primary py-20 text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 md:grid-cols-4 md:px-12">
        <div className="space-y-8">
          <Link href="/" className="inline-block shrink-0">
            <Image
              src="/logo/zinfra-logo-claro.png"
              alt="ZINFRA Solutions"
              width={400}
              height={180}
              className="h-14 w-auto object-contain"
            />
          </Link>
          <p className="leading-relaxed text-white/60">{siteConfig.description}</p>
        </div>
        <div className="space-y-6">
          <h4 className="text-sm font-bold uppercase tracking-widest text-inverse-on-surface">
            Enlaces Rápidos
          </h4>
          <ul className="space-y-4">
            {siteConfig.nav
              .filter((item) => !item.menu)
              .map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="nav-indicador inline-block text-white/70 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
          </ul>
        </div>
        <div className="space-y-6">
          <h4 className="text-sm font-bold uppercase tracking-widest text-inverse-on-surface">
            Contacto
          </h4>
          <div className="space-y-4">
            <p className="flex items-center gap-2 text-sm text-white/70">
              <MailIcon className="h-4 w-4 text-inverse-on-surface" />{' '}
              {siteConfig.contacto.email}
            </p>
            <p className="flex items-center gap-2 text-sm text-white/70">
              <CallIcon className="h-4 w-4 text-inverse-on-surface" />{' '}
              {siteConfig.contacto.telefono}
            </p>
          </div>
        </div>
        <div className="space-y-6">
          <h4 className="text-sm font-bold uppercase tracking-widest text-inverse-on-surface">
            Síguenos
          </h4>
          {/* Los iconos quedan a la vista pero sin enlace: las URLs de redes
              todavía no están confirmadas y no queremos mandar a nadie a un
              perfil equivocado. Para reactivarlos, rellena siteConfig.redes y
              vuelve a envolver cada icono en un <a href>. */}
          <div className="flex gap-4" aria-hidden="true">
            <span className="flex h-12 w-12 items-center justify-center rounded-md border border-white/10 bg-white/5">
              <ShareIcon className="h-5 w-5" />
            </span>
            <span className="flex h-12 w-12 items-center justify-center rounded-md border border-white/10 bg-white/5">
              <GlobeIcon className="h-5 w-5" />
            </span>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-20 max-w-7xl border-t border-white/10 px-4 pt-10 text-center text-sm text-white/40 md:px-12">
        © {new Date().getFullYear()} {siteConfig.name}. Todos los derechos reservados.
      </div>
    </footer>
  )
}
