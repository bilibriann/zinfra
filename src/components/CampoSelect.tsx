import CampoError from '@/components/CampoError'
import CampoLabel from '@/components/CampoLabel'
import { CONTROL, bordeCampo } from '@/components/campoClases'

type CampoSelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  id: string
  label: string
  error?: string
  opciones: { valor: string; etiqueta: string }[]
}

export default function CampoSelect({
  id,
  label,
  error,
  opciones,
  ...props
}: CampoSelectProps) {
  const idError = `${id}-error`

  return (
    <div>
      <CampoLabel htmlFor={id}>{label}</CampoLabel>
      <select
        id={id}
        defaultValue=""
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? idError : undefined}
        className={`${CONTROL} ${bordeCampo(Boolean(error))} h-[42px]`}
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
