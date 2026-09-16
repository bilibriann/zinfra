/**
 * Desactiva el optimizador de imágenes, que necesita servidor y no existe con
 * output: 'export'. Devolver el src tal cual deja seguir usando <Image> por el
 * lazy-load y el width/height que evitan saltos de layout.
 *
 * Aprovecha para prefijar basePath: la doc de Next dice que a <Image src> hay
 * que ponerle el prefijo a mano, y este loader es el único punto por el que
 * pasan todas las imágenes del sitio. Hacerlo acá es lo que evita tener que
 * acordarse en cada <Image> nuevo.
 */
export default function imageLoader({ src }: { src: string }) {
  if (/^https?:\/\//.test(src)) return src
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
  if (!basePath || src.startsWith(`${basePath}/`)) return src
  return `${basePath}${src}`
}
