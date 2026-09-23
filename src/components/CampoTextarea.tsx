import CampoError from '@/components/CampoError'
import CampoLabel from '@/components/CampoLabel'
import { CONTROL, bordeCampo } from '@/components/campoClases'

type CampoTextareaProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'className'
> & {
  id: string
  label: string
  error?: string
  /** Va al contenedor, no al textarea: es donde el formulario declara cuántas columnas ocupa el campo. */
  className?: string
}

export default function CampoTextarea({
  id,
  label,
  error,
  className = '',
  ...props
}: CampoTextareaProps) {
  const idError = `${id}-error`

  return (
    <div className={className}>
      <CampoLabel htmlFor={id}>{label}</CampoLabel>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? idError : undefined}
        className={`${CONTROL} ${bordeCampo(Boolean(error))} min-h-[160px] py-3`}
        {...props}
      />
      {error && <CampoError id={idError}>{error}</CampoError>}
    </div>
  )
}
