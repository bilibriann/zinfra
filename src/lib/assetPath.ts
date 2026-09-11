/**
 * Prefija basePath a una ruta de public/. next/link y next/image lo hacen solos;
 * un <a href> plano (descarga de PDF, por ejemplo) no, y en GitHub Pages el sitio
 * cuelga de /marea-alta.
 */
export function assetPath(src: string): string {
  if (/^https?:\/\//.test(src)) return src
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
  return `${basePath}${src}`
}
