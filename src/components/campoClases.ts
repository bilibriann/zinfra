// Foco sin ring ni glow: el indicador visible es el cambio de color del borde, de
// outline (10% negro) a secondary. Es el reemplazo exigido al quitar el outline.
export const CONTROL =
  'w-full rounded-none border-2 bg-transparent px-4 text-body-md text-on-surface transition-colors duration-300 focus:border-secondary focus:outline-none'

export function bordeCampo(hayError: boolean) {
  return hayError ? 'border-error' : 'border-outline'
}
