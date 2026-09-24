import type { Metadata } from 'next'
import { siteConfig, esPendiente } from '@/config'
import { Reveal } from '@/components/Reveal'
import CotizacionForm from './_components/CotizacionForm'

export const metadata: Metadata = {
  title: 'Contacto',
  description:
    'Solicita una cotización de instrumentación, neumática, vapor o válvulas. Atendemos empresas de todo Chile.',
  alternates: { canonical: '/contacto/' },
}

const whatsapp = siteConfig.contacto.whatsapp ?? ''
const whatsappUrl = `https://wa.me/${whatsapp.replace(/\D/g, '')}`

export default function ContactoPage() {
  const correo = esPendiente(siteConfig.contacto.email) ? null : siteConfig.contacto.email
  const direccion = esPendiente(siteConfig.contacto.direccion)
    ? null
    : siteConfig.contacto.direccion
  const horario = esPendiente(siteConfig.contacto.horario)
    ? null
    : siteConfig.contacto.horario

  return (
    <>
      <section className="bg-primary text-on-primary">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-12">
          <Reveal>
            <h1 className="text-display md:text-display-md max-w-3xl">
              Cotiza con nosotros
            </h1>
            <p className="text-body-md mt-5 max-w-2xl text-white/80">
              Envíanos tu requerimiento y nuestro equipo evaluará la alternativa adecuada
              para tu aplicación.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-12 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 className="text-headline-lg-mobile md:text-headline-lg text-on-surface">
              Escríbenos
            </h2>
            <p className="text-body-md mt-3 text-on-surface-variant">
              <strong className="text-on-surface">
                Atendemos empresas de todo Chile.
              </strong>{' '}
              Instrumentación, neumática, vapor y válvulas.
            </p>

            <dl className="mt-8 space-y-5">
              <div>
                <dt className="text-label-sm font-mono uppercase text-on-surface-variant">
                  WhatsApp
                </dt>
                <dd className="text-body-md mt-1">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-primary hover:underline"
                  >
                    {whatsapp}
                  </a>
                </dd>
              </div>

              <div>
                <dt className="text-label-sm font-mono uppercase text-on-surface-variant">
                  Ciudad
                </dt>
                <dd className="text-body-md mt-1 text-on-surface">Santiago de Chile</dd>
              </div>

              {correo && (
                <div>
                  <dt className="text-label-sm font-mono uppercase text-on-surface-variant">
                    Correo
                  </dt>
                  <dd className="text-body-md mt-1">
                    <a
                      href={`mailto:${correo}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      {correo}
                    </a>
                  </dd>
                </div>
              )}

              {direccion && (
                <div>
                  <dt className="text-label-sm font-mono uppercase text-on-surface-variant">
                    Dirección
                  </dt>
                  <dd className="text-body-md mt-1">
                    {/* Enlace a la búsqueda de Maps y no a un pin fijo: con la
                        dirección escrita basta, y no hay coordenadas que mantener. */}
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-primary hover:underline"
                    >
                      {direccion}
                    </a>
                  </dd>
                </div>
              )}

              {horario && (
                <div>
                  <dt className="text-label-sm font-mono uppercase text-on-surface-variant">
                    Horario
                  </dt>
                  <dd className="text-body-md mt-1 text-on-surface">{horario}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* El panel va un tono por debajo del blanco para que los campos, que
              sí son blancos, se lean como huecos donde se escribe. */}
          <div className="rounded-md border border-outline-variant bg-surface-container p-8 md:p-10">
            <CotizacionForm />
          </div>
        </div>
      </section>
    </>
  )
}
