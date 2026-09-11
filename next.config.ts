import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
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
