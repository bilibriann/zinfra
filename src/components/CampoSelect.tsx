import CampoError from '@/components/CampoError'
import CampoLabel from '@/components/CampoLabel'
import { ALTO_CONTROL, CONTROL, bordeCampo } from '@/components/campoClases'

type CampoSelectProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  'className'
> & {
  id: string
  label: string
  error?: string
  opciones: { valor: string; etiqueta: string }[]
  /** Va al contenedor, no al select: es donde el formulario declara cuántas columnas ocupa el campo. */
  className?: string
}

export default function CampoSelect({
  id,
  label,
  error,
  opciones,
  className = '',
  ...props
}: CampoSelectProps) {
  const idError = `${id}-error`

  return (
    <div className={className}>
      <CampoLabel htmlFor={id}>{label}</CampoLabel>
      <select
        id={id}
        defaultValue=""
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? idError : undefined}
        className={`${CONTROL} ${bordeCampo(Boolean(error))} ${ALTO_CONTROL}`}
        {...props}
      >
        <option value="" disabled>
          Selecciona una opción
        </option>
        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.etiqueta}
          </option>
        ))}
      </select>
      {error && <CampoError id={idError}>{error}</CampoError>}
    </div>
  )
}
