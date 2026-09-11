'use client'

import { useState } from 'react'
import { z } from 'zod'
import { sendCotizacion } from '@/lib/forms'
import { siteConfig, esPendiente } from '@/config'
import { Button } from '@/components/Button'
import CampoTexto from '@/components/CampoTexto'
import CampoSelect from '@/components/CampoSelect'
import CampoTextarea from '@/components/CampoTextarea'

const esquema = z.object({
  nombre: z.string().trim().min(2, 'Indica tu nombre').max(80),
  empresa: z.string().trim().max(120).optional(),
  email: z.string().trim().email('Revisa el correo'),
  telefono: z
    .string()
    .trim()
    .regex(/^[\d\s+()-]{8,20}$/, 'Revisa el teléfono')
    .optional()
    .or(z.literal('')),
  producto: z.string().trim().min(1, 'Elige una línea'),
  marcaModelo: z.string().trim().max(120).optional(),
  cantidad: z.string().trim().max(60).optional(),
  aplicacion: z.string().trim().max(200).optional(),
  mensaje: z.string().trim().min(10, 'Cuéntanos algo más del requerimiento').max(1500),
})

type Errores = Partial<Record<keyof z.infer<typeof esquema>, string>>
type Estado = 'idle' | 'enviando' | 'ok' | 'error'

const LINEAS = [
  { valor: 'Instrumentación', etiqueta: 'Instrumentación' },
  { valor: 'Neumática', etiqueta: 'Neumática' },
  { valor: 'Vapor', etiqueta: 'Vapor' },
  { valor: 'Válvulas', etiqueta: 'Válvulas' },
  { valor: 'Otro', etiqueta: 'Otro / no estoy seguro' },
]

export default function CotizacionForm() {
  const [errores, setErrores] = useState<Errores>({})
  const [estado, setEstado] = useState<Estado>('idle')
  const [mensajeError, setMensajeError] = useState('')

  async function alEnviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const form = evento.currentTarget
    const datos = Object.fromEntries(new FormData(form)) as Record<string, string>

    // Honeypot: sólo un bot rellena un campo que no se ve.
    if (datos.botcheck) return

    const validado = esquema.safeParse(datos)
    if (!validado.success) {
      const nuevos: Errores = {}
      for (const issue of validado.error.issues) {
        const campo = issue.path[0] as keyof Errores
        if (!nuevos[campo]) nuevos[campo] = issue.message
      }
      setErrores(nuevos)
      return
    }

    setErrores({})
    setEstado('enviando')
    const resultado = await sendCotizacion({
      nombre: validado.data.nombre,
      empresa: validado.data.empresa ?? '',
      email: validado.data.email,
      telefono: validado.data.telefono ?? '',
      producto: validado.data.producto,
      marcaModelo: validado.data.marcaModelo ?? '',
      cantidad: validado.data.cantidad ?? '',
      aplicacion: validado.data.aplicacion ?? '',
      mensaje: validado.data.mensaje,
    })

    if (resultado.ok) {
      setEstado('ok')
      form.reset()
      return
    }
    setMensajeError(resultado.error ?? 'No se pudo enviar.')
    setEstado('error')
  }

  const correoVisible = esPendiente(siteConfig.contacto.email)
    ? null
    : siteConfig.contacto.email

  return (
    <form onSubmit={alEnviar} noValidate className="space-y-5">
      <input
        type="text"
        name="botcheck"
        tabIndex={-1}
        aria-hidden="true"
        autoComplete="off"
        className="sr-only"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <CampoTexto
          id="nombre"
          name="nombre"
          label="Nombre"
          autoComplete="name"
          error={errores.nombre}
        />
        <CampoTexto
          id="empresa"
          name="empresa"
          label="Empresa"
          autoComplete="organization"
          error={errores.empresa}
        />
        <CampoTexto
          id="email"
          name="email"
          type="email"
          label="Correo electrónico"
          autoComplete="email"
          error={errores.email}
        />
        <CampoTexto
          id="telefono"
          name="telefono"
          type="tel"
          label="Teléfono"
          autoComplete="tel"
          error={errores.telefono}
        />
      </div>

      <CampoSelect
        id="producto"
        name="producto"
        label="Producto requerido"
        opciones={LINEAS}
        error={errores.producto}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <CampoTexto
          id="marcaModelo"
          name="marcaModelo"
          label="Marca o modelo"
          error={errores.marcaModelo}
        />
        <CampoTexto
          id="cantidad"
          name="cantidad"
          label="Cantidad"
          error={errores.cantidad}
        />
      </div>

      <CampoTexto
        id="aplicacion"
        name="aplicacion"
        label="Aplicación"
        error={errores.aplicacion}
      />

      <CampoTextarea
        id="mensaje"
        name="mensaje"
        label="Requerimiento"
        error={errores.mensaje}
      />

      <Button type="submit" variant="primary" disabled={estado === 'enviando'}>
        {estado === 'enviando' ? 'Enviando…' : 'Enviar cotización'}
      </Button>

      <div role="status" aria-live="polite">
        {estado === 'ok' && (
          <p className="text-body-md font-semibold text-primary">
            Recibimos tu requerimiento. Te respondemos a la brevedad.
          </p>
        )}
        {estado === 'error' && (
          <p className="text-body-md text-error">
            {mensajeError}
            {correoVisible && <> Escríbenos directo a {correoVisible}.</>}
          </p>
        )}
      </div>
    </form>
  )
}
