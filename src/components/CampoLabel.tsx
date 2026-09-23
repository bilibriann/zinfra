/**
 * El rótulo es el mismo objeto tipográfico que los `dt` de la columna de
 * contacto: mono, 12px, uppercase. Así el formulario y el aside se leen como una
 * sola pieza, y el label deja de competir en tamaño con lo que se escribe dentro
 * del campo.
 */
export default function CampoLabel({
  htmlFor,
  children,
}: {
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-label-sm mb-2 block font-mono uppercase text-on-surface-variant"
    >
      {children}
    </label>
  )
}
