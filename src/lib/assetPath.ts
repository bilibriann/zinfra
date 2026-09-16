/**
 * Prefija basePath a una ruta de public/. next/link lo hace solo; un <a href>
 * plano (la descarga de un PDF de /catalogos/, por ejemplo) no.
 *
 * Las imágenes NO pasan por acá: de ellas se encarga imageLoader.ts, que es el
 * único punto por el que pasa todo <Image>. Llamar a assetPath() sobre un
 * <Image src> duplicaría el prefijo — de ahí la guarda de abajo.
 *
 * El valor se hornea en build: vacío para HostGator (sitio en la raíz del
 * dominio), '/zinfra' para la demo en GitHub Pages.
 */
export function assetPath(src: string): string {
  if (/^https?:\/\//.test(src)) return src
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
  if (!basePath || src.startsWith(`${basePath}/`)) return src
  return `${basePath}${src}`
}
