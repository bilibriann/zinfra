import type { Metadata } from 'next'
import { Poppins, JetBrains_Mono } from 'next/font/google'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { SmoothScroll } from '@/components/SmoothScroll'
import { siteConfig } from '@/config'
import { getAllServicios } from '@/lib/servicios'
import './globals.css'

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  weight: ['500'],
})

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — Soluciones industriales`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
}

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  // El Header es cliente y no puede leer el contenido: la lista del desplegable
  // de Soluciones se resuelve aquí, en build.
  const servicios = await getAllServicios()
  const enlacesServicios = servicios.map((s) => ({ slug: s.slug, titulo: s.titulo }))

  return (
    <html lang="es">
      <head>
        {/* Sin JS el IntersectionObserver nunca corre y los bloques envueltos en
            <Reveal> se quedarían en opacidad 0. Esto los deja visibles y quietos. */}
        <noscript>
          <style>{`.al-ver,.al-ver-izq,.al-ver-der{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body
        className={`${poppins.variable} ${jetbrainsMono.variable} flex min-h-screen flex-col bg-background font-sans text-on-background antialiased`}
      >
        <SmoothScroll />
        <Header servicios={enlacesServicios} />
        <main className="flex-1 pt-20">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
