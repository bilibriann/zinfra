/**
 * Convierte una foto de catálogo del proveedor en la imagen que sirve el sitio.
 *
 *   npm run fotos
 *
 * Los originales del cliente son de cámara: 349 MB en total, hasta 48 megapíxeles
 * por archivo. Todo lo que vive en public/ se copia tal cual a out/ y de ahí sube
 * a Hostinger, así que los originales se guardan fuera (assets-originales/, que va
 * en .gitignore) y aquí se derivan las copias webp que sí se publican.
 *
 * El encuadre es `contain` sobre blanco, no `cover`: son fotos de producto sobre
 * fondo blanco y recortarlas a 4:3 le cortaría el volante o la brida a la válvula.
 * Prefiere una banda blanca a un producto mutilado.
 *
 * Para sumar una foto nueva basta agregar una línea a MAPA.
 */
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const ORIGENES = 'assets-originales/fotos productos dewit/Fotos productos DEWIT'
const DESTINO = 'public/images'

const ANCHO = 1200
const ALTO = 900

// destino <- origen. El destino cuelga de public/images y es el que declara
// familias[].imagen en src/content/servicios/*.md; si no coincide, la página deja
// el hueco rotulado en vez de romperse.
const MAPA = [
  ['valvulas/bola.webp', `${ORIGENES}/WATSON MCDANIEL/Válvula de bola.jpg`],
  ['valvulas/globo.webp', `${ORIGENES}/WATSON MCDANIEL/ANSI 150LB-foto 1.jpg`],
  ['valvulas/aguja.webp', `${ORIGENES}/WATSON MCDANIEL/Dewit_220-png.png`],
  ['valvulas/solenoides.webp', `${ORIGENES}/WATSON MCDANIEL/Dewit W-220.jpg`],

  ['vapor/trampeo.webp', `${ORIGENES}/WATSON MCDANIEL/TD-52.jpg`],
  ['vapor/regulacion.webp', `${ORIGENES}/WATSON MCDANIEL/04 (2).png`],
  ['vapor/solenoides.webp', `${ORIGENES}/WATSON MCDANIEL/W210-0.jpg`],
  ['vapor/juntas-rotativas.webp', `${ORIGENES}/WATSON MCDANIEL/HS.jpg`],
  ['vapor/instrumentacion.webp', `${ORIGENES}/WATSON MCDANIEL/Valvula aguja laton.jpg`],

  ['instrumentacion/industriales.webp', `${ORIGENES}/DE WIT/255-100-2-A.png`],
  ['instrumentacion/proceso.webp', `${ORIGENES}/DE WIT/2005SS-100.jpg`],
  ['instrumentacion/frente-solido.webp', `${ORIGENES}/DE WIT/2000-115L.jpg`],
  ['instrumentacion/alta-precision.webp', `${ORIGENES}/DE WIT/91-P a.png`],
  ['instrumentacion/diafragma.webp', `${ORIGENES}/DE WIT/65R-63.jpg`],
  ['instrumentacion/diferencial.webp', `${ORIGENES}/DE WIT/PMD100L.jpg`],
  [
    'instrumentacion/transmisores.webp',
    `${ORIGENES}/WATSON MCDANIEL/Transmisor de Presión 1.png`,
  ],

  ['neumatica/tratamiento-aire.webp', `${ORIGENES}/DE WIT NEUMÁTICA/filtros1 72dpi.png`],
  ['neumatica/complementos.webp', `${ORIGENES}/DE WIT NEUMÁTICA/7902.jpg`],
  ['neumatica/proceso.webp', `${ORIGENES}/WATSON MCDANIEL/2W.JPG`],
  ['neumatica/cilindros.webp', `${ORIGENES}/DE WIT NEUMÁTICA/DNC-32X50-A.jpg`],
  ['neumatica/conexiones.webp', `${ORIGENES}/DE WIT NEUMÁTICA/Grupo_5.jpg`],

  // Foto de cada línea en el home: la declara `imagen` en el frontmatter del servicio.
  ['servicios/instrumentacion.webp', `${ORIGENES}/DE WIT/2005SS-100.jpg`],
  ['servicios/neumatica.webp', `${ORIGENES}/DE WIT NEUMÁTICA/DNC-32X50-A.jpg`],
  ['servicios/vapor.webp', `${ORIGENES}/WATSON MCDANIEL/TD-52.jpg`],
  ['servicios/valvulas.webp', `${ORIGENES}/WATSON MCDANIEL/Válvula de bola.jpg`],
]

for (const [nombre, origen] of MAPA) {
  const salida = path.join(DESTINO, nombre)
  await mkdir(path.dirname(salida), { recursive: true })
  const info = await sharp(origen)
    .resize(ANCHO, ALTO, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .webp({ quality: 82 })
    .toFile(salida)

  const kb = Math.round(info.size / 1024)
  console.log(
    `${nombre.padEnd(36)} ${String(kb).padStart(4)} kB  <- ${path.basename(origen)}`
  )
}
