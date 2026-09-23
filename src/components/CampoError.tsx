export default function CampoError({ id, children }: { id: string; children: string }) {
  return (
    <p id={id} className="text-body-sm mt-1.5 text-error">
      {children}
    </p>
  )
}
