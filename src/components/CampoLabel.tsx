export default function CampoLabel({
  htmlFor,
  children,
}: {
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <label htmlFor={htmlFor} className="text-body-md mb-2 block text-on-surface">
      {children}
    </label>
  )
}
