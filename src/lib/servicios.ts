import path from 'path'
import fs from 'fs/promises'
import matter from 'gray-matter'

export interface Servicio {
  slug: string
  titulo: string
  /** Título largo para <title> y buscadores. El corto manda en el menú y las cards. */
  tituloSeo: string
  resumen: string
  descripcion: string
  /** Una línea sobre dónde y cuándo aplica el servicio. Opcional en el CMS. */
  alcance: string
  imagen: string
  /** true solo si el archivo declarado en `imagen` existe en /public al momento del build. */
  imagenDisponible: boolean
  /** Se conserva para el CMS; la página de detalle ya no lo renderiza. */
  beneficios: string[]
  normas: string[]
  /** Slugs de src/content/sectores.json donde este servicio aplica. */
  sectores: string[]
  orden: number
  /** Fabricante del catálogo. Zinfra distribuye, no fabrica: la marca se declara. */
  marca: string
  /** PDF del proveedor en /public/catalogos. Se enlaza tal cual, con su marca. */
  catalogo: string
  /** Familias de producto, tomadas del catálogo. Nada aquí se inventa. */
  familias: FamiliaProducto[]
}

/**
 * Fila de la ficha técnica. `campo` es opcional: el contenido viejo es una lista
 * de frases sueltas y debe seguir renderizando, así que una fila sin campo pinta
 * solo el valor. La etiqueta aparece cuando el CMS la declara.
 */
export interface Especificacion {
  campo: string
  valor: string
}

export interface FamiliaProducto {
  nombre: string
  /** Bajada técnica bajo el título de la familia. Opcional. */
  subtitulo: string
  /** Badges de la esquina superior: 2 o 3 datos de cabecera, cortos. */
  destacados: string[]
  items: Especificacion[]
  /** Foto de la familia en /public. Vacío o inexistente deja el hueco marcado. */
  imagen: string
  /** Pie de foto, y también el texto del placeholder mientras la foto no llega. */
  pieDeFoto: string
  imagenDisponible: boolean
}

const serviciosDir = path.join(process.cwd(), 'src/content/servicios')
const publicDir = path.join(process.cwd(), 'public')

async function comoFamilias(valor: unknown): Promise<FamiliaProducto[]> {
  if (!Array.isArray(valor)) return []
  const familias = await Promise.all(
    valor.map(async (f): Promise<FamiliaProducto[]> => {
      if (typeof f !== 'object' || f === null) return []
      const { nombre, subtitulo, destacados, items, imagen, pieDeFoto } =
        f as Record<string, unknown>
      if (typeof nombre !== 'string') return []
      const ruta = typeof imagen === 'string' ? imagen : ''
      return [
        {
          nombre,
          subtitulo: typeof subtitulo === 'string' ? subtitulo : '',
          destacados: comoLista(destacados),
          items: comoEspecificaciones(items),
          imagen: ruta,
          pieDeFoto: typeof pieDeFoto === 'string' ? pieDeFoto : '',
          imagenDisponible: await existeEnPublic(ruta),
        },
      ]
    })
  )
  return familias.flat()
}

function comoLista(valor: unknown): string[] {
  return Array.isArray(valor)
    ? valor.filter((item): item is string => typeof item === 'string')
    : []
}

/**
 * Acepta las dos formas que convive el CMS: la frase suelta de siempre
 * (`- 'Servicio WOG, 1.000 PSIG'`) y el par declarado
 * (`- campo: Servicio` / `  valor: 'WOG, 1.000 PSIG'`).
 */
function comoEspecificaciones(valor: unknown): Especificacion[] {
  if (!Array.isArray(valor)) return []
  return valor.flatMap((item) => {
    if (typeof item === 'string') return [{ campo: '', valor: item }]
    if (typeof item !== 'object' || item === null) return []
    const { campo, valor: v } = item as Record<string, unknown>
    if (typeof v !== 'string') return []
    return [{ campo: typeof campo === 'string' ? campo : '', valor: v }]
  })
}

/**
 * El contenido lo edita un CMS, así que ningún campo nuevo puede asumirse presente:
 * un archivo escrito antes de esta versión debe seguir renderizando sin romper.
 */
async function normalizar(data: Record<string, unknown>): Promise<Servicio> {
  const imagen = typeof data.imagen === 'string' ? data.imagen : ''

  return {
    slug: String(data.slug ?? ''),
    titulo: String(data.titulo ?? ''),
    tituloSeo: typeof data.tituloSeo === 'string' ? data.tituloSeo : String(data.titulo ?? ''),
    resumen: String(data.resumen ?? ''),
    descripcion: String(data.descripcion ?? ''),
    alcance: typeof data.alcance === 'string' ? data.alcance : '',
    imagen,
    imagenDisponible: await existeEnPublic(imagen),
    beneficios: comoLista(data.beneficios),
    normas: comoLista(data.normas),
    sectores: comoLista(data.sectores),
    orden: Number(data.orden ?? 0),
    marca: typeof data.marca === 'string' ? data.marca : '',
    catalogo: typeof data.catalogo === 'string' ? data.catalogo : '',
    familias: await comoFamilias(data.familias),
  }
}

/**
 * Las fotos de servicio aún no existen en /public. La página se diseñó para
 * funcionar sin ellas, así que se verifica en build en vez de renderizar un roto.
 */
async function existeEnPublic(ruta: string): Promise<boolean> {
  if (!ruta.startsWith('/')) return false
  try {
    await fs.access(path.join(publicDir, ruta.slice(1)))
    return true
  } catch {
    return false
  }
}

export async function getAllServicios(): Promise<Servicio[]> {
  const files = await fs.readdir(serviciosDir)
  const servicios = await Promise.all(
    files
      .filter((f) => f.endsWith('.md'))
      .map(async (file) => {
        const raw = await fs.readFile(path.join(serviciosDir, file), 'utf8')
        const { data } = matter(raw)
        return normalizar(data)
      })
  )
  return servicios.sort((a, b) => a.orden - b.orden)
}

export async function getServicio(slug: string): Promise<Servicio | null> {
  try {
    const raw = await fs.readFile(path.join(serviciosDir, `${slug}.md`), 'utf8')
    const { data } = matter(raw)
    return normalizar(data)
  } catch {
    return null
  }
}
