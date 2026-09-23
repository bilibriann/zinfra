// Foco sin ring ni glow: el indicador visible es el borde, que pasa de outline a
// primary y se engrosa. El engrosamiento va por sombra interior y no por
// border-width, porque cambiar el grosor correría el contenido del campo un
// píxel en cada foco.
export const CONTROL =
  'w-full rounded-md border bg-surface px-4 text-body-md text-on-surface transition-colors duration-300 focus:border-primary focus:shadow-[inset_0_0_0_1px_var(--color-primary)] focus:outline-none'

// Alto común de input y select. 48px es el mínimo cómodo para un control de
// 16px: por debajo, el texto queda pegado al borde.
export const ALTO_CONTROL = 'h-12'

export function bordeCampo(hayError: boolean) {
  return hayError ? 'border-error' : 'border-outline'
}
