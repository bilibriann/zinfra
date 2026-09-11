import Link from 'next/link'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'white'

// El levantar-y-asentar es el gesto compartido de todos los CTA: sube medio
// paso en hover con una sombra teñida de azul de marca (nunca negra) y vuelve
// a apoyarse al presionar. `active:translate-y-0` es necesario: sin él el
// botón se queda flotando mientras se hunde por el scale.
const base =
  'inline-flex items-center justify-center rounded-md px-8 py-3.5 text-base font-bold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-95'

const variants: Record<Variant, string> = {
  primary:
    'bg-accent text-on-accent hover:bg-accent-container hover:shadow-lg hover:shadow-accent/30',
  white:
    'bg-white text-primary hover:bg-white/85 hover:shadow-lg hover:shadow-primary/30',
}

function buttonClass(variant: Variant, className: string) {
  return `${base} ${variants[variant]} ${className}`
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return <button className={buttonClass(variant, className)} {...props} />
}

interface ButtonLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string
  variant?: Variant
}

/**
 * Un CTA que navega. Existe para no envolver <Button> en <Link>: anidar un
 * <button> dentro de un <a> es HTML inválido y en móvil deja el tap en tierra
 * de nadie entre los dos elementos.
 */
export function ButtonLink({
  href,
  variant = 'primary',
  className = '',
  ...props
}: ButtonLinkProps) {
  return <Link href={href} className={buttonClass(variant, className)} {...props} />
}
