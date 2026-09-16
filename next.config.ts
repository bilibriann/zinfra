import type { NextConfig } from 'next'

// Vacío para el hosting final (el sitio cuelga de la raíz del dominio) y '/zinfra'
// para la demo en GitHub Pages, que lo sirve en bilibriann.github.io/zinfra/. Lo
// pone el workflow de Actions; `npm run build` a secas sigue construyendo para
// HostGator. El valor se hornea en build y no se puede cambiar sin reconstruir.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

const nextConfig: NextConfig = {
  // Con basePath vacío esta clave es un no-op, así que el build de HostGator sale
  // idéntico al de antes de existir el deploy provisorio. No se usa assetPrefix:
  // la doc lo reserva para CDNs y desaconseja usarlo para servir en un sub-path.
  basePath,
  // Hostinger es hosting estático: no corre Node. Sin 'export' el build genera un
  // servidor que allí no puede arrancar. Es también lo que vuelve ilegales headers(),
  // cookies() y revalidate en todo el proyecto.
  output: 'export',
  // El optimizador de imágenes de Next necesita servidor, así que con 'export' el build
  // falla al usar <Image>. Un loader que devuelve el src tal cual lo desactiva y deja
  // seguir usando <Image> por el lazy-load y el width/height que evitan saltos de layout.
  images: {
    loader: 'custom',
    loaderFile: './src/lib/imageLoader.ts',
  },
  // Escribe /ruta/index.html en vez de ruta.html, que es lo que Apache sirve sin ayuda.
  trailingSlash: true,
}

export default nextConfig
