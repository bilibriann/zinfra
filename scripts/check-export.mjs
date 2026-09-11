#!/usr/bin/env node
/**
 * Verifica `out/` antes de subirlo a Hostinger. Existe porque los tres modos de
 * fallo que tiene este export son silenciosos: el sitio se ve bien en local y
 * llega roto al hosting.
 *
 *   npm run check:export
 */
import { readFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'

const OUT = path.join(process.cwd(), 'out')
const fallos = []
const avisos = []

async function existe(rel) {
  try {
    await stat(path.join(OUT, rel))
    return true
  } catch {
    return false
  }
}

/** Concatena todos los .js del bundle: ahí se hornean las NEXT_PUBLIC_*. */
async function bundle() {
  const dir = path.join(OUT, '_next/static/chunks')
  let acc = ''
  async function recorrer(d) {
    for (const e of await readdir(d, { withFileTypes: true })) {
      const p = path.join(d, e.name)
      if (e.isDirectory()) await recorrer(p)
      else if (e.name.endsWith('.js')) acc += await readFile(p, 'utf8')
    }
  }
  await recorrer(dir)
  return acc
}

if (!(await existe('index.html'))) {
  console.error('✗ No existe out/. Corre `npm run build` primero.')
  process.exit(1)
}

// 1. .htaccess — sin él toda ruta que no sea "/" responde 404 en Apache/LiteSpeed.
if (!(await existe('.htaccess'))) {
  fallos.push('Falta out/.htaccess: /contacto y las demás rutas darán 404.')
}

// 2. basePath — si se construyó con GITHUB_PAGES=true los assets van a /marea-alta/.
const index = await readFile(path.join(OUT, 'index.html'), 'utf8')
if (index.includes('/marea-alta/')) {
  fallos.push(
    'El build trae basePath /marea-alta/: se construyó con GITHUB_PAGES=true. Usa `npm run build` a secas.'
  )
}

// 3. Formularios — NEXT_PUBLIC_* se hornean en build; sin .env salen inertes.
const js = await bundle()
if (!js.includes('api.web3forms.com')) {
  fallos.push(
    'El endpoint de formularios no quedó en el bundle: falta .env al construir. Contacto, newsletter y cotizaciones quedarían muertos.'
  )
} else if (js.includes('PEGA_AQUI_LA_ACCESS_KEY')) {
  fallos.push(
    'La access key de Web3Forms sigue siendo el placeholder: pon la real en .env y reconstruye.'
  )
}

// 4. Contenido de prueba que no debe publicarse.
const noticiasDir = path.join(OUT, 'noticias')
try {
  const hay = (await readdir(noticiasDir)).filter((f) => f.includes('prueba'))
  if (hay.length) avisos.push(`Noticias placeholder en el export: ${hay.join(', ')}`)
} catch {
  /* sin carpeta noticias: correcto */
}

for (const a of avisos) console.warn(`⚠ ${a}`)
for (const f of fallos) console.error(`✗ ${f}`)

if (fallos.length) {
  console.error(`\n${fallos.length} problema(s). No subas este export.`)
  process.exit(1)
}
console.log('✓ Export listo para Hostinger.')
