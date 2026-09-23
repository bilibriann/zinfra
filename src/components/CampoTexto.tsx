import CampoError from '@/components/CampoError'
import CampoLabel from '@/components/CampoLabel'
import { ALTO_CONTROL, CONTROL, bordeCampo } from '@/components/campoClases'

type CampoTextoProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> & {
  id: string
  label: string
  error?: string
  /** Va al contenedor, no al input: es donde el formulario declara cuántas columnas ocupa el campo. */
  className?: string
}

export default function CampoTexto({
  id,
  label,
  error,
  className = '',
  ...props
}: CampoTextoProps) {
  const idError = `${id}-error`

  return (
    <div className={className}>
      <CampoLabel htmlFor={id}>{label}</CampoLabel>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? idError : undefined}
        className={`${CONTROL} ${bordeCampo(Boolean(error))} ${ALTO_CONTROL}`}
        {...props}
      />
      {error && <CampoError id={idError}>{error}</CampoError>}
    </div>
  )
}
