/**
 * Deriva un logo con canal alfa desde ZINFRA-LOGO.png.
 *
 * El archivo que entregó el cliente es PNG truecolor sin alfa: su fondo blanco es
 * opaco, así que sobre el azul del header aparecía como un recinto blanco. Aquí se
 * convierte la luminancia en opacidad — el blanco desaparece, el trazo queda — y se
 * conserva el naranja de la A, que es lo único que distingue la marca cuando el
 * resto del wordmark va en blanco sobre el azul #0d2258 del header.
 *
 * Se ejecuta a mano (`node scripts/logo-transparente.mjs`), no en cada build: el
 * resultado se versiona como cualquier otro asset.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { inflateSync, deflateSync } from 'node:zlib'

const ENTRADA = 'public/logo/ZINFRA-LOGO.png'
const SALIDA = 'public/logo/zinfra-logo-claro.png'

const tablaCrc = (() => {
  const tabla = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    tabla[n] = c
  }
  return tabla
})()

function crc32(buf) {
  let c = 0xffffffff
  for (const byte of buf) c = tablaCrc[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(tipo, datos) {
  const largo = Buffer.alloc(4)
  largo.writeUInt32BE(datos.length)
  const cuerpo = Buffer.concat([Buffer.from(tipo, 'ascii'), datos])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(cuerpo))
  return Buffer.concat([largo, cuerpo, crc])
}

function leerPng(ruta) {
  const buf = readFileSync(ruta)
  let pos = 8
  let ihdr = null
  const idat = []
  while (pos < buf.length) {
    const largo = buf.readUInt32BE(pos)
    const tipo = buf.toString('ascii', pos + 4, pos + 8)
    const datos = buf.subarray(pos + 8, pos + 8 + largo)
    if (tipo === 'IHDR') {
      ihdr = {
        ancho: datos.readUInt32BE(0),
        alto: datos.readUInt32BE(4),
        profundidad: datos[8],
        tipoColor: datos[9],
        entrelazado: datos[12],
      }
    } else if (tipo === 'IDAT') {
      idat.push(datos)
    } else if (tipo === 'IEND') {
      break
    }
    pos += 12 + largo
  }
  if (!ihdr) throw new Error('PNG sin IHDR')
  if (ihdr.profundidad !== 8 || ihdr.tipoColor !== 2 || ihdr.entrelazado !== 0) {
    throw new Error(
      `Solo se soporta PNG truecolor 8 bits sin entrelazar; llegó profundidad ${ihdr.profundidad}, tipo ${ihdr.tipoColor}, entrelazado ${ihdr.entrelazado}`
    )
  }
  return { ...ihdr, datos: inflateSync(Buffer.concat(idat)) }
}

function desfiltrar({ ancho, alto, datos }) {
  const bpp = 3
  const bytesFila = ancho * bpp
  const salida = Buffer.alloc(alto * bytesFila)
  let origen = 0
  for (let y = 0; y < alto; y++) {
    const filtro = datos[origen++]
    const fila = origen
    origen += bytesFila
    for (let x = 0; x < bytesFila; x++) {
      const cruda = datos[fila + x]
      const a = x >= bpp ? salida[y * bytesFila + x - bpp] : 0
      const b = y > 0 ? salida[(y - 1) * bytesFila + x] : 0
      const c = x >= bpp && y > 0 ? salida[(y - 1) * bytesFila + x - bpp] : 0
      let valor
      switch (filtro) {
        case 0:
          valor = cruda
          break
        case 1:
          valor = cruda + a
          break
        case 2:
          valor = cruda + b
          break
        case 3:
          valor = cruda + ((a + b) >> 1)
          break
        case 4: {
          const p = a + b - c
          const pa = Math.abs(p - a)
          const pb = Math.abs(p - b)
          const pc = Math.abs(p - c)
          valor = cruda + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)
          break
        }
        default:
          throw new Error(`Filtro PNG desconocido: ${filtro}`)
      }
      salida[y * bytesFila + x] = valor & 0xff
    }
  }
  return salida
}

const png = leerPng(ENTRADA)
const rgb = desfiltrar(png)
const { ancho, alto } = png

// Una fila de filtro 0 por línea, luego RGBA.
const cruda = Buffer.alloc(alto * (1 + ancho * 4))
let destino = 0
for (let y = 0; y < alto; y++) {
  cruda[destino++] = 0
  for (let x = 0; x < ancho; x++) {
    const i = (y * ancho + x) * 3
    const r = rgb[i]
    const g = rgb[i + 1]
    const b = rgb[i + 2]

    // La opacidad sale de cuánto blanco tiene mezclado el píxel, no de su
    // luminancia: con luminancia el naranja brillante de la A quedaba casi
    // transparente y su parte oscura opaca, o sea el degradado al revés.
    // min(r,g,b) es 255 en el fondo blanco y baja en cualquier tinta, sea azul
    // oscuro o naranja saturado.
    let alfa = 255 - Math.min(r, g, b)

    // La sombra del original es un gris muy claro: por debajo de este umbral se
    // descarta, si no queda un halo alrededor de las letras.
    if (alfa < 34) alfa = 0
    else alfa = Math.min(255, Math.round(((alfa - 34) * 255) / (255 - 34)))

    // El wordmark original va en degradado de azul claro a casi negro. Traducido a
    // opacidad, eso deja una banda visible a media altura de las letras. Todo lo que
    // es claramente trazo se lleva a opaco; sólo los bordes conservan alfa parcial.
    if (alfa > 120) alfa = 255

    const esNaranja = r - b > 60 && r >= g && g > b
    if (esNaranja && alfa > 0) {
      // Naranja Zinfra plano: el degradado del archivo original no es de marca.
      cruda[destino++] = 0xff
      cruda[destino++] = 0x9c
      cruda[destino++] = 0x1a
    } else {
      cruda[destino++] = 255
      cruda[destino++] = 255
      cruda[destino++] = 255
    }
    cruda[destino++] = alfa
  }
}

const ihdr = Buffer.alloc(13)
ihdr.writeUInt32BE(ancho, 0)
ihdr.writeUInt32BE(alto, 4)
ihdr[8] = 8
ihdr[9] = 6 // RGBA
writeFileSync(
  SALIDA,
  Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(cruda, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
)

console.log(`${SALIDA} — ${ancho}x${alto} RGBA`)
