import CampoError from '@/components/CampoError'
import CampoLabel from '@/components/CampoLabel'
import { CONTROL, bordeCampo } from '@/components/campoClases'

type CampoTextoProps = React.InputHTMLAttributes<HTMLInputElement> & {
  id: string
  label: string
  error?: string
}

export default function CampoTexto({ id, label, error, ...props }: CampoTextoProps) {
  const idError = `${id}-error`

  return (
    <div>
      <CampoLabel htmlFor={id}>{label}</CampoLabel>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? idError : undefined}
        className={`${CONTROL} ${bordeCampo(Boolean(error))} h-[42px]`}
        {...props}
      />
      {error && <CampoError id={idError}>{error}</CampoError>}
    </div>
  )
}
