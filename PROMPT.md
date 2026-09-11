# Zinfra — Sitio corporativo (prompt de construcción completo)

> **Cómo usar este archivo.** Es el brief único y ejecutable del proyecto y vive dentro
> del repositorio, en la raíz. Abre una sesión de Claude Code **en esta carpeta**,
> apúntalo con `@PROMPT.md` y pide: *"Construye el sitio siguiendo este documento de
> principio a fin."* El scaffold de Next ya está hecho: la sección **2. Stack** dice qué
> quedó instalado y qué configuración falta aplicar antes de escribir el primer
> componente. Todo lo que no esté aquí se decide con el criterio de la sección
> **19. Reglas duras**. Lo que queda abierto está listado en la sección
> **21. Pendientes del cliente** — no inventes esos datos: déjalos como TODO visible.

---

## 1. Contexto y objetivo

**Cliente:** Zinfra (empresa de soluciones industriales).
**Entregable:** sitio corporativo estático de **5 páginas**:

| Ruta | Página |
|---|---|
| `/` | Inicio |
| `/servicio-1` | Solución 1 |
| `/servicio-2` | Solución 2 |
| `/servicio-3` | Solución 3 |
| `/contacto` | Contacto |

(Los slugs reales salen de la sección 21; hasta tenerlos, usa `servicio-1/2/3`.)

**Objetivo de negocio:** captar cotizaciones. Toda página termina empujando al
formulario de contacto. No hay blog, no hay ecommerce, no hay login, no hay CMS.

**Referencia visual:** `https://www.solzt.com/` (WordPress + Elementor + tema
Woodmart + Slider Revolution). **De esa referencia se toma únicamente el lenguaje
visual y el repertorio de bloques.** No se copia su código, ni sus fotos, ni sus
iconos, ni sus textos, ni su logo. El sitio se reconstruye desde cero.

---

## 2. Stack

| Capa | Elección | Versión |
|---|---|---|
| Framework | Next.js App Router, `output: 'export'` | 16.x |
| React | React | 19.x |
| Lenguaje | TypeScript estricto | 5.x |
| Estilos | Tailwind CSS v4 (`@theme inline` en CSS, sin `tailwind.config.js`) | 4.x |
| PostCSS | `@tailwindcss/postcss` | ^4 |
| Iconos | `lucide-react` | ^1.31 |
| Scroll suave | `lenis` | ^1.3 |
| Formulario | Web3Forms (endpoint público, sin backend) | — |
| Validación | `zod` | ^4 |
| Lint/format | ESLint (`eslint-config-next`) + Prettier + `eslint-config-prettier` | — |
| Hosting | Hostinger, hosting estático vía FTP | — |

**Sin** framer-motion, sin GSAP, sin librerías de UI (shadcn, MUI, etc.), sin
`styled-components`. Todo el motion se hace con CSS + `IntersectionObserver`.

### El scaffold ya está hecho

El proyecto se creó el 10 de septiembre de 2026 con:

```bash
npx create-next-app@latest zinfra --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

Quedaron instalados `next@16.3.4`, `react` y `react-dom@19.2.8`, `tailwindcss@^4`,
`@tailwindcss/postcss@^4`, `typescript@^5`, `eslint@^9` y `eslint-config-next@16.3.4`;
`src/app/` con `layout.tsx`, `page.tsx`, `globals.css` y `favicon.ico`; `next.config.ts`,
`postcss.config.mjs`, `eslint.config.mjs` y `tsconfig.json` en la raíz; y un repositorio
git inicializado sin commits.

**No vuelvas a correr `create-next-app`.** Todo lo que sigue se ejecuta desde la raíz del
proyecto, sobre lo que ya existe.

### Configuración inicial

Los seis pasos de abajo son el paso 1 de la sección 18 y van **antes** de escribir
cualquier componente.

#### 1. Dependencias

```bash
npm i lucide-react lenis zod
npm i -D prettier eslint-config-prettier
```

Ninguna es de arrastre; cada una tiene un lugar fijado en este documento:

| Paquete | Para qué | Dónde |
|---|---|---|
| `lucide-react` | Los iconos SVG del sitio (p. ej. el `ChevronRight` de 16px de las tarjetas de categoría). Es lo único que se instala para UI: shadcn, MUI y similares están prohibidos. | §8, §9 |
| `lenis` | El scroll suave, en un componente cliente `<SmoothScroll>` dentro de `layout.tsx`, con `lerp: 0.1` y `duration: 1.2`. Se apaga solo si el visitante pide `prefers-reduced-motion: reduce`. | §7 |
| `zod` | Valida y tipa los datos de las 3 soluciones en `src/lib/servicios.ts`, y define el esquema del formulario de contacto, que se valida en cliente antes de enviar. Sin backend, esa validación es la única que existe. | §11, §12 |
| `prettier` + `eslint-config-prettier` | El formato de la sección 17. El segundo no formatea nada: apaga las reglas de ESLint que chocan con Prettier para que no se peleen. | §17 |

#### 2. `next.config.ts`

Reemplaza el que generó el scaffold (viene vacío):

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Hostinger es hosting estático: no corre Node. Sin 'export' el build genera un
  // servidor que allí no puede arrancar. Es también lo que vuelve ilegales headers(),
  // cookies() y revalidate en todo el proyecto (§16).
  output: 'export',
  // El optimizador de imágenes de Next necesita servidor, así que con 'export' el build
  // falla al usar <Image>. Un loader que devuelve el src tal cual lo desactiva y deja
  // seguir usando <Image> por el lazy-load y el width/height que evitan saltos de layout.
  images: {
    loader: 'custom',
    loaderFile: './src/lib/imageLoader.ts',
  },
  // Escribe /ruta/index.html en vez de ruta.html, que es lo que Apache sirve sin ayuda.
  // Con `false` hay que arreglarlo después a mano con rewrites en .htaccess.
  trailingSlash: true,
}

export default nextConfig
```

#### 3. `src/lib/imageLoader.ts`

```ts
export default function imageLoader({ src }: { src: string }) {
  return src
}
```

#### 4. Prettier

`.prettierrc` en la raíz:

```json
{
  "semi": false,
  "singleQuote": true,
  "printWidth": 90,
  "trailingComma": "es5"
}
```

`.prettierignore` en la raíz:

```
.next
out
node_modules
package-lock.json
```

Y en `package.json`, junto a los scripts que ya están:

```json
"format": "prettier --write .",
"format:check": "prettier --check ."
```

#### 5. `eslint.config.mjs`

Al config que generó el scaffold hay que sumarle `eslint-config-prettier`, **último**
en el arreglo para que gane a las reglas anteriores (`eslint-config-prettier/flat`
existe desde la v10; en versiones anteriores se importa el paquete directo):

```js
import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier/flat'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
])

export default eslintConfig
```

#### 6. Limpiar el demo del scaffold

`create-next-app` deja una página de muestra y archivos de plantilla que no son de este
proyecto. Antes de empezar:

- **Borrar** `AGENTS.md`, `CLAUDE.md` y `README.md` — son del template, no del sitio. El
  brief del proyecto es este archivo.
- **Borrar** `public/file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`.
- **Vaciar** `src/app/page.tsx`: el home se construye desde cero según §10.
- **Reescribir** `src/app/globals.css`: el scaffold trae un `@theme inline` de muestra con
  Geist y un bloque `prefers-color-scheme: dark`. Va reemplazado entero por los tokens de
  la §4. **El sitio no tiene modo oscuro**; ese bloque se elimina, no se adapta.
- **Reescribir** `src/app/layout.tsx`: el scaffold carga `Geist` y `Geist_Mono`, y la
  familia única del sitio es **Montserrat** (§5). También quedan ahí el `lang="en"` — va
  `lang="es"` — y el `metadata` de "Create Next App", que se reemplaza por el de §13.

---

## 3. Estructura de carpetas

```
src/
  app/
    layout.tsx                 # <html>, fuente, Header, Footer, SmoothScroll, metadata base
    page.tsx                   # Inicio
    globals.css                # @theme inline: TODOS los tokens
    robots.ts
    sitemap.ts
    favicon.ico
    _components/               # secciones exclusivas del home
      HeroSection.tsx
      CategoriasSection.tsx
      SplitSection.tsx
      BandaFotoSection.tsx
      IndustriasSection.tsx
    [servicio]/
      page.tsx                 # template único de las 3 páginas de solución
      _components/
        ServicioIntro.tsx
        ServicioTabs.tsx
    contacto/
      page.tsx
      _components/
        FormularioContacto.tsx
        DatosContacto.tsx
  components/                  # compartidos entre páginas
    Header.tsx
    Footer.tsx
    SmoothScroll.tsx
    CtaFinalSection.tsx
    Boton.tsx
    Container.tsx
    Section.tsx
    Eyebrow.tsx
    Reveal.tsx
    ImagenDuo.tsx
    TarjetaCategoria.tsx
    BotonWhatsApp.tsx
    BotonArriba.tsx
  content/
    servicios/                 # un archivo por servicio
  lib/
    servicios.ts               # lectura y tipado del contenido
    forms.ts                   # envío a Web3Forms + esquema zod
    imageLoader.ts
  types/
    index.ts
  config.ts                    # siteConfig: nav, contacto, redes, correo
public/
  images/
    hero/ categorias/ servicios/ industrias/
  logo.svg
```

**Convención:** un componente por archivo, nombre en PascalCase, texto de interfaz en
español. Los `_components` de una ruta son privados de esa ruta; si un bloque se usa
en dos páginas, sube a `src/components/`.

---

## 4. Sistema de diseño — tokens

Todo vive en `src/app/globals.css` bajo `@theme inline`. **Ningún componente escribe
un hex.** Los valores de abajo son los extraídos de la referencia y funcionan como
placeholder: cuando llegue el manual de marca de Zinfra se cambian **solo aquí** y el
sitio entero cambia de identidad sin tocar un componente.

```css
@import "tailwindcss";

@theme inline {
  --font-sans: var(--font-montserrat);

  /* --- Color: roles, no nombres de color --- */
  --color-primary: #4da15a;            /* verde CTA — SOLO botones de acción */
  --color-on-primary: #ffffff;
  --color-primary-hover: #3d8a4a;

  --color-secondary: #005d57;          /* teal oscuro — bandas a sangre y submit */
  --color-on-secondary: #ffffff;

  --color-accent: #038ea3;             /* teal claro — overlay duotono sobre foto */

  --color-background: #ffffff;
  --color-surface-alt: #f9f9f9;        /* bandas claras alternas */
  --color-on-surface: #242424;         /* títulos */
  --color-on-surface-variant: #767676; /* cuerpo */
  --color-inverse-surface: #343434;    /* footer */
  --color-inverse-on-surface: #ffffff;
  --color-subfooter: #2b2b2b;          /* franja de copyright, un tono bajo el footer */

  --color-outline: rgba(0, 0, 0, 0.1); /* bordes de input y divisorias */

  /* --- Tipografía --- */
  --text-display: 30px;                /* H1 móvil */
  --text-display--line-height: 1.15;
  --text-display--font-weight: 700;

  --text-display-lg: 44px;             /* H1 desktop */
  --text-display-lg--line-height: 1.1;
  --text-display-lg--font-weight: 700;

  --text-headline: 34px;               /* H2 de sección */
  --text-headline--line-height: 1.2;
  --text-headline--font-weight: 700;

  --text-headline-sm: 24px;            /* H3 */
  --text-headline-sm--line-height: 1.25;
  --text-headline-sm--font-weight: 700;

  --text-body: 18px;                   /* párrafo por defecto */
  --text-body--line-height: 1.3;

  --text-body-sm: 15px;
  --text-body-sm--line-height: 1.5;

  --text-nav: 13px;
  --text-nav--font-weight: 600;
  --text-nav--letter-spacing: 0.02em;

  --text-button: 14px;
  --text-button--font-weight: 600;

  /* --- Forma --- */
  --radius-none: 0px;                  /* botones, inputs */
  --radius-sm: 5px;                    /* imágenes y tarjetas */

  /* --- Sombra: una sola en todo el sistema --- */
  --shadow-card: 0 1px 8px rgba(0, 0, 0, 0.1);

  /* --- Motion --- */
  --ease-base: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Reglas de color nombradas

- **Regla del acento único.** El verde `primary` existe **solo** en botones de acción.
  Nunca titula, nunca es fondo de sección, nunca es un icono decorativo. Las dos
  excepciones permitidas, heredadas de la referencia: el item activo del nav y el
  bullet `+` de las listas.
- **Regla de la banda.** El teal `secondary` existe **solo** como banda a sangre (CTA
  de cierre, título de contacto) y como fondo del botón submit. El teal claro `accent`
  existe **solo** como overlay duotono sobre fotografía.
- **Regla del tercer color.** No hay un tercer color saturado. Si un bloque parece
  necesitarlo, el bloque está mal resuelto.

---

## 5. Tipografía

**Familia única: Montserrat.** Cargada con `next/font/google` en `layout.tsx`, pesos
400 / 600 / 700, `display: 'swap'`, expuesta como `--font-montserrat`.

```ts
import { Montserrat } from 'next/font/google'

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
})
```

| Rol | Clase | Uso |
|---|---|---|
| H1 | `text-display lg:text-display-lg uppercase` | Título de página. Uppercase en home y contacto; **sin uppercase** en las 3 interiores (la referencia las diferencia así). |
| H2 | `text-headline uppercase` | Encabezado de sección. |
| H3 | `text-headline-sm` | Título dentro de un bloque. |
| Eyebrow | `text-body text-on-surface-variant` | Línea corta sobre el H2, peso normal, sin uppercase. |
| Cuerpo | `text-body text-on-surface-variant` | Párrafo. |
| Cuerpo fuerte | `text-body font-bold text-on-surface-variant` | **El primer párrafo de cada split va en negrita** y el segundo en peso normal. Es un patrón deliberado de la referencia. |
| Nav | `text-nav uppercase` | Links del header. |
| Botón | `text-button uppercase` | Texto de botón. |

**Regla del eyebrow.** Toda sección mayor abre con eyebrow gris → H2 uppercase →
párrafo. Saltarse el eyebrow hace que la sección se lea como incompleta.

---

## 6. Layout y grilla

- **Contenedor:** `max-w-[1222px] mx-auto px-4 md:px-8`.
- **Ritmo vertical:** `py-[90px]` en secciones mayores (`py-16` en móvil).
- **Alternancia de fondo:** las secciones alternan `bg-background` / `bg-surface-alt`.
  Cada 2–3 secciones entra una **banda a sangre** (`w-full`, sin contenedor, fondo
  teal plano o foto con duotono) para cortar el ritmo.
- **Header:** 100px de alto; 56px en estado sticky. `<main>` compensa con `pt-[100px]`.
- **Grillas:** 1 columna en móvil → 2 en `sm:` → 4 en `lg:` para categorías e
  industrias. Los splits son `lg:grid-cols-2` y colapsan a una columna con la imagen
  **debajo** del texto en móvil.

---

## 7. Motion y efectos

Valores medidos sobre la referencia. Implementar exactamente estos, ni más ni menos.

| Efecto | Especificación | Implementación |
|---|---|---|
| Transición base | `0.25s ease` | Botones, links, iconos sociales. |
| Transición de superficie | `0.3s ease` sobre `background-color`, `border-color`, `box-shadow` | Tarjetas, inputs. |
| Zoom de foto en hover | `transform: scale(1.05)` en `0.4s ease` | Categorías circulares y tarjetas con foto. Contenedor con `overflow-hidden`. |
| Reveal al scroll | `opacity 0→1` + `translateY(24px)→0`, `0.6s var(--ease-base)`, stagger de **80ms** entre hermanos | Componente `<Reveal>` con `IntersectionObserver` (`threshold: 0.15`, `rootMargin: '0px 0px -10% 0px'`), dispara **una sola vez** y se desconecta. |
| Header sticky | Al bajar más de 200px el header se oculta; al **subir** reaparece encogido a 56px con un `fadeInDown` de `0.4s ease` y sombra `--shadow-card` | Listener de scroll dentro de `requestAnimationFrame`, guardando la última posición. |
| Scroll suave | Lenis con `lerp: 0.1`, `duration: 1.2` | `<SmoothScroll>` cliente en `layout.tsx`. Debe **desactivarse** si `prefers-reduced-motion: reduce`. |
| Botón "arriba" | Aparece pasados 400px de scroll, fade `0.25s` | Circular, 48px, borde 1px `--color-outline`, fondo blanco, chevron arriba. Esquina inferior derecha. |
| Underline de tabs | El subrayado verde del tab activo se desplaza en `0.25s ease` | `transform: translateX()` sobre una barra absoluta, no un `border-bottom` por tab. |
| Hover de botón | Fondo pasa a `--color-primary-hover`; el chevron se desplaza `4px` a la derecha en `0.25s` | Sin escala, sin sombra. |

**`prefers-reduced-motion: reduce` desactiva todo:** Lenis, reveals (los elementos
nacen visibles), zooms y desplazamientos. Es obligatorio, no opcional.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 8. Componentes base

### `<Boton>`
Props: `variante: 'primario' | 'sobre-banda' | 'submit'`, `href?`, `type?`, `children`.
Renderiza `<Link>` si hay `href`, `<button>` si no.

| Variante | Fondo | Texto | Uso |
|---|---|---|---|
| `primario` | `bg-primary` | blanco | CTA sobre fondo claro |
| `sobre-banda` | `bg-white` | `text-secondary` | CTA dentro de banda teal |
| `submit` | `bg-secondary` | blanco | Único submit del formulario |

Común a las tres: `rounded-none`, `px-7 py-3`, `text-button uppercase`, chevron
(`ChevronRight` de lucide, 16px) a la derecha, transición de 250ms. **Radio 0 sin
excepción.**

### `<Container>`
`max-w-[1222px] mx-auto px-4 md:px-8`. Nada más.

### `<Section>`
Props: `fondo: 'blanco' | 'alt' | 'teal' | 'sangre'`, `id?`, `children`. Aplica el
padding vertical y el fondo; `sangre` omite el `<Container>`.

### `<Eyebrow>`
`<p className="text-body text-on-surface-variant mb-2">`.

### `<Reveal>`
Cliente. Props: `delay?: number` (ms). Envuelve children en un `div` que pasa de
`opacity-0 translate-y-6` a `opacity-100 translate-y-0` usando `IntersectionObserver`.

### `<ImagenDuo>`
La composición firma del sitio: dos fotos con `--radius-sm` superpuestas en diagonal
— la trasera arriba-derecha, la delantera abajo-izquierda desplazada `-40px` en X e Y,
con `shadow-card`. En móvil se apila una sola foto (la delantera) sin superposición.

### `<TarjetaCategoria>`
Foto en círculo (`aspect-square rounded-full overflow-hidden`) + rótulo uppercase
centrado debajo. Hover: zoom 105% de la foto en 0.4s. Todo el bloque es un `<Link>`.

### `<CampoTexto>` / `<CampoSelect>` / `<CampoTextarea>`
Label de 15px arriba, control con `h-[42px]` (textarea `min-h-[180px]`),
`bg-transparent`, `border-2 border-outline`, `rounded-none`, `px-4`. Focus:
`border-color` pasa a `--color-secondary`, sin glow ni ring. Error: borde rojo +
mensaje de 13px debajo.

### `<Header>`
Cliente. 100px, `<Container>` interno, logo izquierda, nav centro-izquierda (uppercase
13px, item activo en `text-primary`), iconos sociales a la derecha. En `<lg` colapsa a
hamburguesa que abre un panel a pantalla completa desde arriba (0.3s ease); cierra con
Escape, con clic afuera y al cambiar de ruta.

### `<Footer>`
Banda `bg-inverse-surface` con logo centrado, una línea de teléfonos por ciudad
separados por `·`, iconos sociales centrados, y subfooter `bg-subfooter` con copyright
a la izquierda y "Aviso de privacidad" a la derecha.

### `<BotonWhatsApp>`
Burbuja circular verde WhatsApp (`#25d366`) fija abajo-derecha, 56px, `shadow-card`,
`aria-label="Escríbenos por WhatsApp"`, `target="_blank" rel="noopener noreferrer"`.

---

## 9. Bloques de página

Todo el sitio se compone con estos ocho. No inventes un noveno.

1. **Header** — descrito arriba.
2. **Hero** (solo home) — banda a sangre con foto de fondo, overlay oscuro
   `rgba(0,0,0,0.45)`, H1 uppercase blanco centrado, subtítulo y un CTA primario. Alto
   `min-h-[560px] lg:min-h-[640px]`. Sin carrusel: una sola imagen. *(La referencia usa
   Slider Revolution; una imagen fija rinde mejor y se ve igual.)*
3. **Categorías** — grilla de 4 `<TarjetaCategoria>` sobre fondo blanco, precedida de
   un H2 uppercase centrado.
4. **Split texto/imagen** — eyebrow + H2 uppercase + párrafo en negrita + párrafo
   normal + CTA primario, junto a un `<ImagenDuo>`. **Se invierte de lado en cada
   repetición** (`lg:order-*`). Es el bloque más repetido del sitio.
5. **Banda con foto** — a sangre: foto de fondo con duotono teal (`bg-accent
   mix-blend-multiply` sobre la imagen en escala de grises), y a un lado un panel
   `bg-on-surface/90` con H2 blanco, párrafo y CTA. Textura opcional de puntos
   (`radial-gradient` de 1px cada 8px, `opacity-20`).
6. **Industrias** — grilla de iconos lineales sobre `bg-surface-alt`: icono teal
   (stroke 1.5, 56px) + etiqueta debajo, 4 columnas.
7. **CTA de cierre** — banda a sangre `bg-secondary`: a la izquierda eyebrow blanco al
   70% + H2 uppercase blanco + párrafo; a la derecha un `<Boton variante="sobre-banda">`.
   **Va al pie de las 5 páginas, siempre justo antes del footer.**
8. **Footer** — descrito arriba.

---

## 10. Página por página

### `/` — Inicio
1. Hero.
2. H2 "NUESTRAS SOLUCIONES" centrado + Categorías (4).
3. Split A (imagen derecha) — sobre `bg-surface-alt`, con la grilla de Industrias
   embebida debajo del texto.
4. Banda con foto — solución 1.
5. Split B (imagen izquierda) — solución 2.
6. Banda con foto — solución 3.
7. Split C (imagen derecha) — la empresa: años en el mercado, respaldo técnico.
8. CTA de cierre + Footer.

### `/[servicio]` — las 3 páginas de solución (un solo template)
1. **Intro** sobre `bg-surface-alt`: dos columnas — H1 **sin uppercase** a la
   izquierda; a la derecha párrafo + CTA primario ("Cotizar ahora").
2. H2 centrado ("Nuestros productos y equipos").
3. **Tabs** (3–4 pestañas). Tab activo: texto oscuro + subrayado verde animado;
   inactivo: `text-on-surface-variant`. Cada panel: H3 + lista a dos columnas con
   bullet `+` verde + foto grande del producto a la derecha + CTA "Más información".
   Los tabs son accesibles: `role="tablist"`, `aria-selected`, navegación con flechas.
4. CTA de cierre + Footer.

Las tres páginas se generan del mismo template leyendo `src/content/servicios/`.
Usar `generateStaticParams()`.

### `/contacto`
1. **Banda de título** a sangre: foto con duotono teal + H1 uppercase blanco centrado,
   alto `min-h-[200px]`.
2. Dos columnas:
   - **Izquierda:** H2 "Escríbenos", párrafo (con la frase de cobertura en negrita),
     luego los teléfonos agrupados por ciudad en pares (nombre en negrita 18px, número
     en gris debajo), correo electrónico, y "Síguenos:" con iconos sociales en botones
     circulares grises de 40px.
   - **Derecha:** formulario sobre panel `bg-surface-alt` con `p-8`: grid 2×
     (`Nombre completo` / `Correo electrónico`, `Teléfono` / `Servicio` select),
     `Mensaje` a ancho completo, y `<Boton variante="submit">ENVIAR MENSAJE</Boton>`.
3. CTA de cierre + Footer.

---

## 11. Contenido y datos

`src/config.ts` centraliza todo lo que se repite:

```ts
export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'TODO@zinfra.cl'

export const siteConfig = {
  name: 'Zinfra',
  description: 'TODO — una línea, máximo 150 caracteres',
  url: 'https://TODO.cl',
  nav: [
    { label: 'Inicio', href: '/' },
    { label: 'Solución 1', href: '/servicio-1' },
    { label: 'Solución 2', href: '/servicio-2' },
    { label: 'Solución 3', href: '/servicio-3' },
    { label: 'Contacto', href: '/contacto' },
  ],
  contacto: {
    email: CONTACT_EMAIL,
    whatsapp: 'TODO',
    sedes: [{ ciudad: 'TODO', telefono: 'TODO' }],
  },
  redes: { linkedin: '', facebook: '', instagram: '' },
}
```

**Ningún componente escribe un teléfono, un correo ni una URL a mano.** Todo importa
de `siteConfig`.

Cada servicio es un archivo en `src/content/servicios/` con `slug`, `titulo`,
`resumen`, `imagenHero` y un array `tabs` de `{ nombre, titulo, items[], imagen, cta }`.
`src/lib/servicios.ts` los lee, los valida con zod y los tipa.

**Textos:** mientras no lleguen los del cliente, escribe copy plausible en español y
marca cada bloque con un comentario `{/* TODO copy cliente */}`. No uses lorem ipsum:
un texto real permite juzgar la maquetación; el lorem no.

**Imágenes:** mientras no lleguen las del cliente, **deja el espacio vacío con la
proporción correcta**, sin gris de relleno ni marca de agua. Un hueco honesto se lee
mejor que un placeholder decorativo, y no hay riesgo de que un placeholder llegue a
producción.

---

## 12. Formulario de contacto

- **Servicio:** Web3Forms. La `access_key` va en `NEXT_PUBLIC_WEB3FORMS_KEY` (archivo
  `.env.local`, nunca commiteada), y **debe apuntar a una cuenta del correo corporativo
  de Zinfra**, no al correo personal del desarrollador.
- **Campos:** nombre (requerido, 2–80), correo (requerido, formato válido), teléfono
  (opcional, 8–15 dígitos), servicio (select, requerido), mensaje (requerido, 10–1500).
  Esquema en zod, validación **en cliente antes de enviar**.
- **Honeypot:** campo `botcheck` oculto (`sr-only` + `tabIndex={-1}` + `aria-hidden`).
- **Estados:** `idle` → `enviando` (botón deshabilitado, texto "Enviando…") → `ok`
  (mensaje verde bajo el botón, formulario limpio) / `error` (mensaje rojo con el
  correo directo como alternativa).
- **Accesibilidad:** cada error se asocia con `aria-describedby`, y el bloque de
  resultado es `role="status" aria-live="polite"`.
- El formulario **no** redirige a una página de gracias: el estado se muestra en sitio.

---

## 13. SEO y metadata

- `metadata` exportada por página: `title`, `description`, `openGraph`,
  `alternates.canonical`.
- Plantilla de título en `layout.tsx`: `title: { template: '%s | Zinfra', default: 'Zinfra — …' }`.
- `src/app/sitemap.ts` y `src/app/robots.ts` generados por Next.
- Una sola `<h1>` por página.
- JSON-LD `Organization` en `layout.tsx` y `LocalBusiness` en `/contacto`, con los datos
  de `siteConfig` (omitir los campos que sigan en TODO, no inventarlos).
- `lang="es"` en `<html>`. `alt` descriptivo en cada imagen; `alt=""` en las decorativas.

---

## 14. Accesibilidad (obligatorio, no opcional)

- Contraste AA: el gris de cuerpo `#767676` sobre blanco da 4.6:1 — **no lo aclares**.
  Texto blanco sobre el verde `primary` da 3.1:1: por eso el texto de botón es **bold y
  ≥14px** (umbral de texto grande). No uses ese verde para texto normal.
- Foco visible en todo elemento interactivo: `focus-visible:outline-2
  focus-visible:outline-offset-2 focus-visible:outline-secondary`. **Nunca `outline: none`
  sin reemplazo.**
- Skip link "Saltar al contenido" como primer elemento del `<body>`.
- Área táctil mínima 44×44px en móvil (nav, iconos sociales, botón de arriba).
- Tabs con `role="tablist"` / `role="tab"` / `role="tabpanel"`, `aria-selected` y
  navegación con flechas izquierda/derecha.
- Menú móvil: `aria-expanded`, foco atrapado mientras está abierto, Escape cierra.

---

## 15. Rendimiento

- Imágenes en **WebP**, servidas ya redimensionadas (no hay optimizador en export
  estático). Hero ≤ 250 KB; fotos de sección ≤ 150 KB; iconos en SVG inline.
- `loading="lazy"` en todo salvo la imagen del hero, que va con `priority` /
  `fetchpriority="high"`.
- `width` y `height` explícitos en toda imagen para evitar CLS.
- Objetivo Lighthouse móvil: **Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95,
  SEO 100.**
- Solo son componentes cliente (`'use client'`): `Header`, `SmoothScroll`, `Reveal`,
  `ServicioTabs`, `FormularioContacto`, `BotonArriba`. Todo lo demás es server component.

---

## 16. Build y despliegue

```bash
npm run build        # genera ./out
```

Añadir un script `check:export` que falle el build si aparece cualquier ruta con API,
`headers()`, `cookies()` o `revalidate` — cosas incompatibles con `output: 'export'`.

**Despliegue:** subir el contenido de `out/` por FTP a Hostinger, a `public_html/`.
Workflow de GitHub Actions en `.github/workflows/deploy.yml` con `FTP_SERVER`,
`FTP_USERNAME` y `FTP_PASSWORD` como secrets del repositorio.

> Nota operativa: los fallos de FTP a Hostinger del tipo `Timeout (control socket)` son
> de red, no de configuración. Se resuelven reintentando el job.

---

## 17. Calidad de código

- TypeScript `strict: true`. Sin `any`. Sin `@ts-ignore`.
- Prettier: sin punto y coma, comillas simples, ancho 90, `trailingComma: 'es5'`.
- Comentarios **solo donde el código no puede explicarse solo**: una decisión de diseño
  no obvia, una restricción del cliente, un workaround. No comentar lo evidente.
- Commits en español, imperativo, con prefijo `feat:` / `fix:` / `refactor:` / `chore:`.
- Sin dependencias nuevas sin justificarlo primero.

---

## 18. Orden de construcción

1. Configuración inicial de la §2 (dependencias, `next.config.ts`, Prettier, ESLint,
   limpieza del demo) + `globals.css` con todos los tokens + fuente.
2. `config.ts` y tipos (el `imageLoader` ya quedó en el paso 1).
3. Primitivos: `Container`, `Section`, `Boton`, `Eyebrow`, `Reveal`, campos de formulario.
4. `Header` + `Footer` + `SmoothScroll` + `layout.tsx`. **Verificar en navegador.**
5. `CtaFinalSection` (se usa en las 5 páginas).
6. Home, bloque por bloque, en el orden de la sección 10.
7. Template `/[servicio]` + contenido de los 3 servicios.
8. `/contacto` + formulario + Web3Forms.
9. SEO, sitemap, robots, JSON-LD.
10. Pasada de accesibilidad + `prefers-reduced-motion` + Lighthouse.
11. Workflow de deploy.

Al terminar cada uno de los pasos 4, 6, 7 y 8: levantar el sitio, capturar la página en
desktop (1440) y móvil (390), y revisarla antes de seguir.

---

## 19. Reglas duras

**Do**
- Una sola familia tipográfica en todo el sitio.
- Todo color sale de un token de `globals.css`.
- Radio 0 en controles, 5px en imágenes, círculo en categorías. Tres valores, ninguno más.
- Toda sección abre con eyebrow → H2 uppercase → párrafo.
- El primer párrafo de un split va en negrita, el segundo en peso normal.
- Toda página termina con el CTA de cierre teal.
- Fotos reales de operación industrial; el recorte (círculo, superposición diagonal,
  duotono) es el recurso gráfico del sitio.

**Don't**
- No usar el verde para nada que no sea un CTA (excepto nav activo y bullet `+`).
- No agregar un tercer color saturado.
- No agregar sombras: la única del sistema es `--shadow-card`.
- No usar librerías de animación ni de componentes.
- No copiar fotos, iconos, textos ni el logo de Solzt.
- No inventar teléfonos, direcciones, certificaciones, años de experiencia ni nombres de
  clientes. Si el dato no está en la sección 21, va como TODO visible.
- No usar placeholders grises ni lorem ipsum.
- No dejar páginas largas de lectura: esto es una landing corporativa, se recorre de una
  pasada. Si un bloque exige lectura sostenida, sobra.

---

## 20. Criterios de aceptación

- [ ] Las 5 rutas existen, se exportan a HTML estático y funcionan abiertas desde `out/`.
- [ ] `npm run build` pasa sin errores ni warnings de ESLint/TS.
- [ ] Ningún hex escrito fuera de `globals.css`.
- [ ] Ningún teléfono o correo escrito fuera de `config.ts`.
- [ ] Navegación completa con teclado, con foco siempre visible.
- [ ] Con `prefers-reduced-motion: reduce` no se mueve nada y todo el contenido es visible.
- [ ] Sin scroll horizontal en 320px, 390px, 768px, 1024px y 1440px.
- [ ] El formulario valida, envía, y muestra estado de éxito y de error.
- [ ] Lighthouse móvil dentro de los objetivos de la sección 15.
- [ ] Cada TODO pendiente es visible en el código y está listado abajo.

---

## 21. Pendientes del cliente (no inventar)

| # | Dato | Estado |
|---|---|---|
| 1 | Logo de Zinfra (SVG, versión clara y oscura) | pendiente |
| 2 | Manual de marca o, mínimo, los 3 colores: CTA, banda, overlay | pendiente |
| 3 | Nombres y slugs reales de las 3 soluciones | pendiente |
| 4 | Textos de las 5 páginas | pendiente |
| 5 | Fotografías de operación (hero, 4 categorías, 3 bandas, 3 splits) | pendiente |
| 6 | Teléfonos por sede, correo corporativo, dirección | pendiente |
| 7 | `access_key` de Web3Forms creada con el correo de Zinfra | pendiente |
| 8 | Número de WhatsApp | pendiente |
| 9 | Dominio definitivo y credenciales FTP de Hostinger | pendiente |
| 10 | Texto del aviso de privacidad | pendiente |

Mientras un pendiente siga abierto, su lugar en la interfaz queda **vacío y marcado**,
nunca relleno con algo inventado.
