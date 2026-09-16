import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Metadata } from 'next'
import { assetPath } from '@/lib/assetPath'
import { getAllServicios, getServicio } from '@/lib/servicios'
import { ButtonLink } from '@/components/Button'
import { Reveal } from '@/components/Reveal'

// Las 4 rutas se conocen en build: cualquier otro slug es 404, no una página vacía.
export const dynamicParams = false

// Cada familia es una ficha técnica: foto de catálogo, badges de cabecera con los
// dos o tres datos que deciden la compra, y las especificaciones en filas de
// campo/valor con cebra. Se hojea como el catálogo impreso y se escanea como una
// tabla, que es como un comprador técnico lee.
//
// El naranja de marca no entra en la ficha. La 60-30-10 lo reserva para el 10% de
// punto focal, y una tarjeta de datos densos no compite con el CTA: dentro de la
// ficha manda el azul (#0d2258 = --color-primary, el azul del hero) y la jerarquía
// la hace el contraste, no un segundo color.
//
// La primera familia va destacada a todo el ancho. Es la de mayor peso comercial y,
// de paso, cuadra un número impar de tarjetas en dos columnas sin dejar hueco.

export async function generateStaticParams() {
  const servicios = await getAllServicios()
  return servicios.map((s) => ({ servicio: s.slug }))
}

export async function generateMetadata(
  props: PageProps<'/[servicio]'>
): Promise<Metadata> {
  const { servicio: slug } = await props.params
  const servicio = await getServicio(slug)
  if (!servicio) return {}
  return {
    title: servicio.tituloSeo,
    description: servicio.resumen,
    alternates: { canonical: `/${servicio.slug}/` },
  }
}

export default async function ServicioPage(props: PageProps<'/[servicio]'>) {
  const { servicio: slug } = await props.params
  const servicio = await getServicio(slug)
  if (!servicio) notFound()

  return (
    <>
      <section className="bg-primary text-on-primary">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-12 lg:py-24">
          <Reveal>
            <h1 className="text-display md:text-display-md max-w-3xl">
              {servicio.titulo}
            </h1>
            <p className="text-body-md mt-5 max-w-2xl text-white/80">
              {servicio.descripcion}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/contacto" variant="primary">
                Solicitar cotización
              </ButtonLink>
              <a
                href={assetPath(servicio.catalogo)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md border border-white/30 px-8 py-3.5 text-base font-bold transition-colors duration-200 hover:bg-white/10"
              >
                Descargar catálogo {servicio.marca}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-surface-container">
        {/* Más angosto que el resto del sitio: a ~1024px cada ficha (foto y datos)
            queda a una escala que se lee de un vistazo, sin dominar la página. */}
        <div className="mx-auto max-w-[70rem] px-4 py-16 md:px-12 lg:py-24">
          <Reveal>
            <h2 className="text-headline-lg-mobile md:text-headline-lg text-on-surface">
              Familias de producto
            </h2>
            <p className="text-body-md mt-3 max-w-2xl text-on-surface-variant">
              Lo que sigue es el contenido del catálogo {servicio.marca}. Si buscas un
              modelo que no aparece, escríbenos: lo cotizamos igual.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {servicio.familias.map((familia, i) => {
              const destacada = i === 0
              return (
                <Reveal
                  key={familia.nombre}
                  className={destacada ? 'md:col-span-2' : undefined}
                  retraso={destacada ? 0 : (i % 2) * 90}
                >
                  <article
                    className={`flex h-full overflow-hidden rounded-xl border border-outline-variant bg-background shadow-[0_1px_2px_color-mix(in_srgb,var(--color-primary)_4%,transparent),0_8px_24px_-12px_color-mix(in_srgb,var(--color-primary)_15%,transparent)] ${
                      destacada ? 'flex-col lg:flex-row' : 'flex-col'
                    }`}
                  >
                    {familia.pieDeFoto && (
                      // overflow-hidden recorta el zoom del hover dentro del marco.
                      <figure
                        className={`overflow-hidden ${destacada ? 'lg:w-2/5 lg:shrink-0' : ''}`}
                      >
                        {familia.imagenDisponible ? (
                          <Image
                            src={familia.imagen}
                            alt={familia.pieDeFoto}
                            width={704}
                            height={528}
                            className="foto-zoom aspect-[4/3] w-full object-cover lg:h-full"
                          />
                        ) : (
                          // La foto la manda el cliente. Hasta entonces el hueco se
                          // muestra rotulado: un vacío marcado es preferible a una
                          // ficha que finge estar completa.
                          <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 border-b border-dashed border-outline-variant bg-surface-container px-6 text-center lg:h-full">
                            <span className="text-label-xs font-mono uppercase text-primary">
                              Foto pendiente
                            </span>
                            <span className="text-body-sm text-on-surface-variant">
                              {familia.pieDeFoto}
                            </span>
                          </div>
                        )}
                      </figure>
                    )}

                    <div className="flex flex-1 flex-col p-6 md:p-8">
                      <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
                        <div className="min-w-0">
                          <h3 className="text-headline-lg-mobile md:text-headline-lg text-on-surface">
                            {familia.nombre}
                          </h3>
                          {familia.subtitulo && (
                            <p className="text-body-sm mt-2 max-w-prose text-on-surface-variant">
                              {familia.subtitulo}
                            </p>
                          )}
                        </div>

                        {familia.destacados.length > 0 && (
                          // Los badges alternan azul sólido y azul pastel para que el
                          // primero —el dato que más pesa— gane sin recurrir a un
                          // color nuevo. Van en el bloque de texto y no sobre la foto:
                          // encima de una foto oscura, como la de conexiones, dejarían
                          // de leerse.
                          <ul className="flex flex-wrap gap-2 md:justify-end">
                            {familia.destacados.map((dato, j) => (
                              <li
                                key={dato}
                                className={`text-label-xs rounded-full px-3 py-1.5 font-mono uppercase ${
                                  j === 0
                                    ? 'bg-primary text-on-primary'
                                    : 'bg-primary-tint text-primary'
                                }`}
                              >
                                {dato}
                              </li>
                            ))}
                          </ul>
                        )}
                      </header>

                      <dl className="mt-6 overflow-hidden rounded-md border border-outline-variant">
                        {familia.items.map((spec, j) => (
                          <div
                            key={spec.valor}
                            className={`flex gap-3 border-l-[3px] border-primary px-4 py-3 sm:gap-4 ${
                              j % 2 === 1 ? 'bg-surface-container' : 'bg-background'
                            }`}
                          >
                            <span
                              aria-hidden="true"
                              className="text-label-sm mt-0.5 shrink-0 font-mono text-primary"
                            >
                              &gt;
                            </span>
                            <div className="min-w-0 flex-1 sm:flex sm:gap-4">
                              {spec.campo && (
                                <dt className="text-label-xs shrink-0 pt-0.5 font-semibold uppercase tracking-wider text-primary sm:w-36">
                                  {spec.campo}
                                </dt>
                              )}
                              <dd
                                className={`text-body-sm min-w-0 text-on-surface ${
                                  spec.campo ? 'mt-1 sm:mt-0' : ''
                                }`}
                              >
                                {spec.valor}
                              </dd>
                            </div>
                          </div>
                        ))}
                      </dl>
                    </div>
                  </article>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-primary text-on-primary">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-14 md:flex-row md:items-center md:justify-between md:px-12">
          <div>
            <h2 className="text-headline-lg-mobile md:text-headline-lg">
              ¿Buscas un equipo específico?
            </h2>
            <p className="text-body-md mt-2 max-w-xl text-white/70">
              Indícanos producto, marca o modelo, cantidad y aplicación. Evaluamos la
              alternativa adecuada para tu proceso.
            </p>
          </div>
          <div className="shrink-0">
            <ButtonLink href="/contacto" variant="primary">
              Solicita tu cotización
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  )
}
