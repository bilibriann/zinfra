import Link from 'next/link'
import { getAllServicios } from '@/lib/servicios'
import { ButtonLink } from '@/components/Button'
import { Reveal } from '@/components/Reveal'
import { siteConfig } from '@/config'

const RAZONES = [
  {
    titulo: 'Atención técnica',
    texto:
      'Te ayudamos a identificar el producto adecuado según tu aplicación y requerimientos.',
  },
  {
    titulo: 'Cobertura en todo Chile',
    texto:
      'Atendemos requerimientos industriales de empresas ubicadas a lo largo del territorio nacional.',
  },
  {
    titulo: 'Soluciones industriales',
    texto:
      'No se trata solamente de vender un producto: buscamos la alternativa adecuada para cada necesidad.',
  },
  {
    titulo: 'Respuesta directa',
    texto: 'Atendemos tus requerimientos de manera rápida y orientada a resolver.',
  },
]

// Una línea, un color del manual. Alternan claro y oscuro para que ninguna banda
// quede pegada a otra del mismo peso; el naranja no es fondo de nada — solo ordinal,
// bullet y enlace, que es su papel del 10%.
const TONOS_LINEA = [
  {
    fondo: 'bg-background',
    titulo: 'text-on-surface',
    texto: 'text-on-surface-variant',
    acento: 'text-accent',
    enlace: 'text-primary',
    regla: 'border-outline-variant',
  },
  {
    fondo: 'bg-secondary',
    titulo: 'text-on-secondary',
    texto: 'text-white/80',
    acento: 'text-accent',
    enlace: 'text-accent',
    regla: 'border-white/25',
  },
  {
    fondo: 'bg-surface-container',
    titulo: 'text-on-surface',
    texto: 'text-on-surface-variant',
    acento: 'text-accent',
    enlace: 'text-primary',
    regla: 'border-outline-variant',
  },
  {
    fondo: 'degradado-marca',
    titulo: 'text-white',
    texto: 'text-white/75',
    acento: 'text-accent',
    enlace: 'text-accent',
    regla: 'border-white/25',
  },
]

const DATOS_COTIZACION = [
  'Producto requerido',
  'Marca o modelo',
  'Cantidad',
  'Aplicación',
  'Ficha técnica o fotografía del equipo, si la tienes',
]

export default async function Home() {
  const servicios = await getAllServicios()

  return (
    <>
      <section className="degradado-continuo text-on-primary">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-12 lg:py-28">
          <Reveal>
            <p className="text-label-sm font-mono uppercase text-white/60">
              Instrumentación · Neumática · Vapor · Válvulas
            </p>
            <h1 className="text-display md:text-display-md lg:text-display-lg mt-4 max-w-4xl">
              Equipos de medición, control y conducción para la industria
            </h1>
            <p className="text-body-md mt-6 max-w-2xl text-white/80">
              En ZINFRA Solutions entregamos soluciones y equipos para medición, control y
              conducción de procesos industriales. Trabajamos con empresas de todo Chile,
              con una atención orientada a las necesidades específicas de cada proceso.
            </p>
            <div className="mt-8">
              <ButtonLink href="/contacto" variant="primary">
                Solicita una cotización
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-16 md:px-12 lg:pt-24">
        <Reveal>
          <h2 className="text-headline-lg-mobile md:text-headline-xl text-on-surface">
            Nuestros productos
          </h2>
          <p className="text-body-md mt-3 max-w-2xl text-on-surface-variant">
            Seleccionamos equipos y componentes pensando en las exigencias reales de la
            industria: precisión, continuidad operacional, seguridad y eficiencia.
          </p>
        </Reveal>
      </section>

      {servicios.map((servicio, i) => {
        const tono = TONOS_LINEA[i % TONOS_LINEA.length]
        return (
          <section key={servicio.slug} className={tono.fondo}>
            <Link
              href={`/${servicio.slug}`}
              className="group block focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-accent"
            >
              <div className="mx-auto max-w-7xl px-4 py-14 md:px-12 lg:py-20">
                <Reveal>
                  <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
                    <div>
                      <p className={`text-label-sm font-mono uppercase ${tono.acento}`}>
                        {String(i + 1).padStart(2, '0')} · {servicio.marca}
                      </p>
                      <h3
                        className={`text-display md:text-display-md mt-3 ${tono.titulo}`}
                      >
                        {servicio.titulo}
                      </h3>
                      <p className={`text-body-md mt-4 max-w-xl ${tono.texto}`}>
                        {servicio.resumen}
                      </p>
                      <span
                        className={`text-body-md mt-6 inline-block font-semibold ${tono.enlace}`}
                      >
                        Ver {servicio.titulo.toLowerCase()}
                        <span
                          aria-hidden="true"
                          className="ml-2 inline-block transition-transform duration-200 group-hover:translate-x-1"
                        >
                          →
                        </span>
                      </span>
                    </div>
                    <ul
                      className={`grid gap-2 border-t pt-6 sm:grid-cols-2 ${tono.regla}`}
                    >
                      {servicio.familias.map((familia) => (
                        <li
                          key={familia.nombre}
                          className={`text-body-md flex gap-2 ${tono.texto}`}
                        >
                          <span aria-hidden="true" className={tono.acento}>
                            +
                          </span>
                          <span>{familia.nombre}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              </div>
            </Link>
          </section>
        )
      })}

      <section className="bg-surface-container">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-12">
          <Reveal>
            <p className="text-label-sm font-mono uppercase text-on-surface-variant">
              Marca
            </p>
            <h2 className="text-headline-lg-mobile md:text-headline-xl mt-3 text-on-surface">
              DE WIT
            </h2>
            <p className="text-body-md mt-4 max-w-2xl text-on-surface-variant">
              Trabajamos con productos DE WIT, incorporando soluciones orientadas a
              aplicaciones industriales de medición, control y manejo de procesos. Cada
              línea tiene su catálogo disponible para descarga.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {servicios.map((servicio) => (
                <a
                  key={servicio.slug}
                  href={servicio.catalogo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-body-md rounded-md border border-outline-variant bg-background px-4 py-2 font-semibold text-primary transition-colors duration-200 hover:bg-surface-container-high"
                >
                  Catálogo {servicio.titulo} ↓
                </a>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-12 lg:py-24">
        <Reveal>
          <h2 className="text-headline-lg-mobile md:text-headline-xl text-on-surface">
            ¿Por qué ZINFRA Solutions?
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {RAZONES.map((razon) => (
            <Reveal key={razon.titulo}>
              <div className="h-full border-t-2 border-accent pt-5">
                <h3 className="text-headline-lg-mobile text-on-surface">
                  {razon.titulo}
                </h3>
                <p className="text-body-md mt-3 text-on-surface-variant">{razon.texto}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="degradado-marca text-on-primary">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-xl">
              <h2 className="text-headline-lg-mobile md:text-headline-xl">
                ¿Buscas un equipo específico?
              </h2>
              <p className="text-body-md mt-3 text-white/80">
                Envíanos tu requerimiento y nuestro equipo evaluará la alternativa
                adecuada para tu aplicación.
              </p>
              <div className="mt-6">
                <ButtonLink href="/contacto" variant="primary">
                  Solicita tu cotización
                </ButtonLink>
              </div>
            </div>
            <div className="rounded-md border border-white/20 p-6">
              <p className="text-label-sm font-mono uppercase text-white/60">
                Puedes indicarnos
              </p>
              <ul className="text-body-md mt-4 space-y-2 text-white/80">
                {DATOS_COTIZACION.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span aria-hidden="true" className="text-accent">
                      +
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-body-md mt-6 text-white/60">
                WhatsApp {siteConfig.contacto.whatsapp} · Santiago de Chile
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
