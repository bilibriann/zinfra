import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { assetPath } from '@/lib/assetPath'
import { getAllServicios, getServicio } from '@/lib/servicios'
import { ButtonLink } from '@/components/Button'
import { Reveal } from '@/components/Reveal'

// Las 4 rutas se conocen en build: cualquier otro slug es 404, no una página vacía.
export const dynamicParams = false

// Cada familia es una franja de catálogo a todo el ancho: foto a un tercio con su
// pie, badges con los dos o tres datos que deciden la compra, y las
// especificaciones en dos columnas de campo/valor. La foto va siempre a la
// izquierda, así el ojo encuentra el producto en el mismo lugar en cada familia.
// Se hojea como el catálogo impreso y se escanea como una tabla, que es como un
// comprador técnico lee.
//
// No son tarjetas: nada va encajonado ni ensombrecido. Lo único que separa una
// familia de la siguiente es una línea, que es lo que hace una hoja de catálogo y no
// un tablero de fichas. Va a 2px y más intensa que las líneas de las filas de
// especificaciones: con el mismo trazo, el corte entre familias se perdía entre ellas.
//
// El naranja de marca no entra en la ficha. La 60-30-10 lo reserva para el 10% de
// punto focal, y un bloque de datos densos no compite con el CTA: dentro de la
// ficha manda el azul (#0d2258 = --color-primary, el azul del hero) y la jerarquía
// la hace el contraste, no un segundo color.

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
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:px-12 lg:grid-cols-[1fr_24rem] lg:items-center lg:py-24">
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
          {/* Foto de ejemplo de la línea, la misma de su banda en el home. En móvil
              va bajo los botones, topada en ancho para no ocupar toda la pantalla. El
              marco blanco es porque las fotos de catálogo vienen sobre blanco. */}
          {servicio.imagenDisponible && (
            <Reveal>
              <div className="aspect-[4/3] w-full max-w-sm overflow-hidden rounded-lg bg-white lg:max-w-none">
                <Image
                  src={servicio.imagen}
                  alt={`Producto de la línea ${servicio.titulo}`}
                  width={1200}
                  height={900}
                  priority
                  className="h-full w-full object-contain"
                />
              </div>
            </Reveal>
          )}
        </div>
      </section>

      <section className="bg-background">
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

          <div className="mt-12">
            {servicio.familias.map((familia, i) => {
              return (
                <Reveal key={familia.nombre}>
                  {/* La primera familia va sin línea arriba. Se decide por índice y no
                      con `first:`, porque cada <article> es el primer hijo de su
                      propio <Reveal> y `first:` le quitaba la línea a todas. */}
                  <article
                    className={
                      i === 0
                        ? 'pb-12 md:pb-16'
                        : 'border-t-2 border-primary/35 py-12 md:py-16'
                    }
                  >
                    <div className="grid items-start gap-8 md:grid-cols-12 md:gap-10 lg:gap-12">
                      {familia.pieDeFoto && (
                        // El tope de ancho es para el móvil, donde la franja se apila:
                        // sin él la foto pasa a ancho completo y queda más grande que
                        // en la fila de al lado, que es lo contrario de lo que busca
                        // una franja de catálogo.
                        <figure className="w-full max-w-[22rem] md:col-span-4 md:max-w-none">
                          {familia.imagenDisponible ? (
                            // `contain` y no `cover`: la foto de catálogo ya viene
                            // encuadrada a 4:3 sobre blanco y recortarla le cortaría
                            // la brida o el volante al producto.
                            <Image
                              src={familia.imagen}
                              alt={familia.pieDeFoto}
                              width={704}
                              height={528}
                              className="aspect-[4/3] w-full rounded-lg border border-outline-variant bg-background object-contain"
                            />
                          ) : (
                            // La foto la manda el cliente. Hasta entonces el hueco se
                            // muestra rotulado: un vacío marcado es preferible a una
                            // ficha que finge estar completa. Acá el pie va dentro del
                            // marco y no debajo, porque es el propio rótulo del hueco.
                            <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-outline-variant bg-surface-container px-6 text-center">
                              <span className="text-label-xs font-mono uppercase text-primary">
                                Foto pendiente
                              </span>
                              <span className="text-body-sm text-on-surface-variant">
                                {familia.pieDeFoto}
                              </span>
                            </div>
                          )}
                          {familia.imagenDisponible && (
                            <figcaption className="text-body-sm mt-3 text-on-surface-variant">
                              {familia.pieDeFoto}
                            </figcaption>
                          )}
                        </figure>
                      )}

                      <div
                        className={familia.pieDeFoto ? 'md:col-span-8' : 'md:col-span-12'}
                      >
                        <header>
                          <h3 className="text-headline-lg-mobile md:text-headline-lg text-on-surface">
                            {familia.nombre}
                          </h3>
                          {familia.subtitulo && (
                            <p className="text-body-sm mt-2 max-w-prose text-on-surface-variant">
                              {familia.subtitulo}
                            </p>
                          )}

                          {familia.destacados.length > 0 && (
                            // Los badges alternan azul sólido y azul pastel para que el
                            // primero —el dato que más pesa— gane sin recurrir a un
                            // color nuevo.
                            <ul className="mt-4 flex flex-wrap gap-2">
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

                        {/* Dos columnas de campo/valor: una tabla de nueve filas, como
                            la de la guillotina, se lee de un vistazo en vez de caer a
                            lo largo. Se apila en una sola columna bajo sm. */}
                        <dl className="mt-7 grid gap-x-10 sm:grid-cols-2">
                          {familia.items.map((spec) => (
                            <div
                              key={spec.valor}
                              className="flex gap-4 border-t border-outline-variant py-3"
                            >
                              {spec.campo && (
                                <dt className="text-label-xs w-28 shrink-0 pt-1 font-semibold uppercase tracking-wider text-primary">
                                  {spec.campo}
                                </dt>
                              )}
                              <dd className="text-body-sm min-w-0 flex-1 text-on-surface">
                                {spec.valor}
                              </dd>
                            </div>
                          ))}
                        </dl>

                        {/* Enlaces de texto y no botones: el CTA fuerte ya está en el
                            hero y en la banda final, aquí solo se deja la salida a
                            mano. La cotización llega con línea y familia rellenas; el
                            catálogo es el del servicio, no hay uno por familia. */}
                        <div className="text-body-sm mt-6 flex flex-wrap gap-x-8 gap-y-3 font-semibold text-primary">
                          <Link
                            href={{
                              pathname: '/contacto',
                              query: { linea: servicio.titulo, modelo: familia.nombre },
                            }}
                            className="underline-offset-4 hover:underline"
                          >
                            Solicitar cotización <span aria-hidden="true">→</span>
                          </Link>
                          <a
                            href={assetPath(servicio.catalogo)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline-offset-4 hover:underline"
                          >
                            Descargar catálogo <span aria-hidden="true">↓</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </article>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* Franja final en amarillo señal, igual que en el home. El CTA va en azul
          porque el naranja se pierde sobre amarillo. */}
      <section className="bg-signal text-on-signal">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-14 md:flex-row md:items-center md:justify-between md:px-12">
          <div>
            <h2 className="text-headline-lg-mobile md:text-headline-lg">
              ¿Buscas un equipo específico?
            </h2>
            <p className="text-body-md mt-2 max-w-xl">
              Indícanos producto, marca o modelo, cantidad y aplicación. Evaluamos la
              alternativa adecuada para tu proceso.
            </p>
          </div>
          <div className="shrink-0">
            <ButtonLink href="/contacto" variant="azul">
              Solicita tu cotización
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  )
}
