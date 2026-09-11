import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAllServicios, getServicio } from '@/lib/servicios'
import { ButtonLink } from '@/components/Button'
import { Reveal } from '@/components/Reveal'

// Las 4 rutas se conocen en build: cualquier otro slug es 404, no una página vacía.
export const dynamicParams = false

// Cada familia es una banda a sangre. La rotación de tres mantiene la proporción
// 60-30-10 del manual: dos secciones claras por cada una azul, y el naranja nunca
// como fondo — solo en el ordinal y el bullet, que es su único papel.
const TONOS = [
  {
    fondo: 'bg-background',
    titulo: 'text-on-surface',
    texto: 'text-on-surface-variant',
    numero: 'text-accent',
    regla: 'border-outline-variant',
  },
  {
    fondo: 'bg-surface-container',
    titulo: 'text-on-surface',
    texto: 'text-on-surface-variant',
    numero: 'text-accent',
    regla: 'border-outline-variant',
  },
  {
    fondo: 'bg-secondary',
    titulo: 'text-on-secondary',
    texto: 'text-white/80',
    numero: 'text-accent',
    regla: 'border-white/25',
  },
]

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
    title: servicio.titulo,
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
      <section className="degradado-continuo text-on-primary">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-12 lg:py-24">
          <Reveal>
            <p className="text-label-sm font-mono uppercase text-white/60">
              {servicio.marca}
            </p>
            <h1 className="text-display md:text-display-md mt-3 max-w-3xl">
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
                href={servicio.catalogo}
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

      {(servicio.alcance || servicio.normas.length > 0) && (
        <section className="border-b border-outline-variant bg-surface-container">
          <div className="mx-auto flex max-w-7xl flex-wrap gap-x-12 gap-y-4 px-4 py-6 md:px-12">
            {servicio.alcance && (
              <p className="text-body-md text-on-surface-variant">
                <span className="font-semibold text-on-surface">Alcance:</span>{' '}
                {servicio.alcance}
              </p>
            )}
            {servicio.normas.length > 0 && (
              <p className="text-body-md text-on-surface-variant">
                <span className="font-semibold text-on-surface">Normas:</span>{' '}
                {servicio.normas.join(' · ')}
              </p>
            )}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 pt-16 md:px-12 lg:pt-24">
        <Reveal>
          <h2 className="text-headline-lg-mobile md:text-headline-lg text-on-surface">
            Familias de producto
          </h2>
          <p className="text-body-md mt-3 max-w-2xl text-on-surface-variant">
            Lo que sigue es el contenido del catálogo {servicio.marca}. Si buscas un
            modelo que no aparece, escríbenos: lo cotizamos igual.
          </p>
        </Reveal>
      </section>

      {servicio.familias.map((familia, i) => {
        const tono = TONOS[i % TONOS.length]
        return (
          <section key={familia.nombre} className={tono.fondo}>
            <div className="mx-auto max-w-7xl px-4 py-14 md:px-12 lg:py-20">
              <Reveal>
                <div className="grid gap-8 lg:grid-cols-[minmax(0,22rem)_1fr]">
                  <div>
                    <p className={`text-label-sm font-mono uppercase ${tono.numero}`}>
                      {String(i + 1).padStart(2, '0')}
                    </p>
                    <h3
                      className={`text-headline-lg-mobile md:text-headline-lg mt-3 ${tono.titulo}`}
                    >
                      {familia.nombre}
                    </h3>
                  </div>
                  <ul
                    className={`grid gap-x-10 gap-y-3 border-t pt-6 sm:grid-cols-2 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10 ${tono.regla}`}
                  >
                    {familia.items.map((item) => (
                      <li key={item} className={`text-body-md flex gap-2 ${tono.texto}`}>
                        <span aria-hidden="true" className={tono.numero}>
                          +
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>
          </section>
        )
      })}

      <section className="degradado-marca text-on-primary">
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
