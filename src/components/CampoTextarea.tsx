import CampoError from '@/components/CampoError'
import CampoLabel from '@/components/CampoLabel'
import { CONTROL, bordeCampo } from '@/components/campoClases'

type CampoTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  id: string
  label: string
  error?: string
}

export default function CampoTextarea({
  id,
  label,
  error,
  ...props
}: CampoTextareaProps) {
  const idError = `${id}-error`

  return (
    <div>
      <CampoLabel htmlFor={id}>{label}</CampoLabel>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? idError : undefined}
        className={`${CONTROL} ${bordeCampo(Boolean(error))} min-h-[180px] py-3`}
        {...props}
      />
      {error && <CampoError id={idError}>{error}</CampoError>}
    </div>
  )
}
