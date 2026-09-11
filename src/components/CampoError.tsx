export default function CampoError({ id, children }: { id: string; children: string }) {
  return (
    <p id={id} className="mt-1 text-[13px] text-error">
      {children}
    </p>
  )
}
