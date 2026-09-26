import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { Category, Report, ReportLocation, Severity } from '../types'

type Props = {
  categories: Category[]
  location: ReportLocation | null
  pickingLocation: boolean
  onLocationChange: (location: ReportLocation) => void
  onPickLocation: () => void
  onClose: () => void
  onSubmit: (report: Report) => void
}
type Errors = Partial<Record<'category' | 'description' | 'severity' | 'location', string>>

export function ReportForm({ categories, location, pickingLocation, onLocationChange, onPickLocation, onClose, onSubmit }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const requestRef = useRef(0)
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [severity, setSeverity] = useState<Severity | ''>('')
  const [errors, setErrors] = useState<Errors>({})
  const [gpsError, setGpsError] = useState('')
  const [locating, setLocating] = useState(false)
  const category = categories.find((item) => item.id === categoryId)

  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null
    return () => { requestRef.current += 1; queueMicrotask(() => trigger?.focus()) }
  }, [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (pickingLocation) dialog.close()
    else dialog.showModal()
    return () => dialog.close()
  }, [pickingLocation])

  useEffect(() => {
    if (pickingLocation) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [pickingLocation])

  const useGps = () => {
    setGpsError('')
    if (!navigator.geolocation) {
      setGpsError('Tu navegador no permite obtener la ubicación. Selecciona un punto del mapa.')
      return
    }
    const request = ++requestRef.current
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (request !== requestRef.current) return
        setLocating(false)
        onLocationChange({ latitude: coords.latitude, longitude: coords.longitude })
        setErrors((current) => ({ ...current, location: undefined }))
      },
      (error) => {
        if (request !== requestRef.current) return
        setLocating(false)
        setGpsError(error.code === 1
          ? 'Permiso de ubicación denegado. Puedes habilitarlo en tu navegador o elegir un punto del mapa.'
          : error.code === 3
            ? 'La ubicación tardó demasiado. Inténtalo de nuevo o elige un punto del mapa.'
            : 'No se pudo obtener tu ubicación. Inténtalo de nuevo o elige un punto del mapa.')
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    )
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const next: Errors = {}
    if (!category) next.category = 'Selecciona una categoría.'
    if (!description.trim()) next.description = 'Escribe una descripción del incidente.'
    else if (description.length > 140) next.description = 'La descripción debe tener como máximo 140 caracteres.'
    if (category?.requiresSeverity && !severity) next.severity = 'Selecciona la severidad.'
    if (!location || !Number.isFinite(location.latitude) || !Number.isFinite(location.longitude)
      || Math.abs(location.latitude) > 90 || Math.abs(location.longitude) > 180) {
      next.location = 'Usa tu ubicación o selecciona un punto del mapa.'
    }
    setErrors(next)
    const first = Object.keys(next)[0]
    if (first) { document.getElementById(`report-${first}`)?.focus(); return }
    if (!category || !location) return
    onSubmit({
      id: crypto.randomUUID(), categoryId: category.id, description: description.trim(),
      severity: severity || 'low', ...location,
      location: `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`,
      status: 'unverified', createdAt: new Date().toISOString(),
    })
  }

  return (
    <dialog ref={dialogRef} className="report-dialog" aria-labelledby="report-title"
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return
        const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(
          'button:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]',
        ))
        const first = controls[0]
        const last = controls[controls.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault(); last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault(); first?.focus()
        }
      }}
      onCancel={(event) => { event.preventDefault(); onClose() }}>
      <form noValidate onSubmit={submit} className="report-form">
        <div className="report-form-heading">
          <h2 id="report-title">Reportar un incidente</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar formulario de reporte">×</button>
        </div>
        <p>El reporte aparecerá como sin verificar. Se guarda solo durante esta sesión.</p>
        <div className="report-field">
          <label htmlFor="report-category">Categoría (obligatoria)</label>
          <select id="report-category" required value={categoryId} aria-invalid={!!errors.category}
            aria-describedby="category-error" onChange={(event) => {
              setCategoryId(event.target.value); setSeverity('')
              setErrors((current) => ({ ...current, category: undefined, severity: undefined }))
            }}>
            <option value="">Selecciona una categoría</option>
            {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <span className="field-error" id="category-error">{errors.category}</span>
        </div>
        <div className="report-field">
          <label htmlFor="report-description">Descripción breve (obligatoria)</label>
          <textarea id="report-description" required maxLength={140} rows={3} value={description}
            aria-invalid={!!errors.description} aria-describedby="description-count description-error"
            onChange={(event) => { setDescription(event.target.value); setErrors((current) => ({ ...current, description: undefined })) }} />
          <small id="description-count">{description.length}/140 caracteres</small>
          <span className="field-error" id="description-error">{errors.description}</span>
        </div>
        <div className="report-field">
          <label htmlFor="report-severity">Severidad ({category?.requiresSeverity ? 'obligatoria' : 'opcional'})</label>
          <select id="report-severity" value={severity} required={category?.requiresSeverity}
            aria-invalid={!!errors.severity} aria-describedby="severity-error severity-help"
            onChange={(event) => { setSeverity(event.target.value as Severity | ''); setErrors((current) => ({ ...current, severity: undefined })) }}>
            <option value="">Selecciona la severidad</option>
            <option value="low">Baja</option><option value="medium">Media</option><option value="high">Alta</option>
          </select>
          <small id="severity-help">{!category?.requiresSeverity && 'Si no eliges una, se guardará como baja.'}</small>
          <span className="field-error" id="severity-error">{errors.severity}</span>
        </div>
        <fieldset className="report-field">
          <legend>Ubicación (obligatoria)</legend>
          <div className="location-actions">
            <button id="report-location" type="button" onClick={useGps} disabled={locating}
              aria-describedby="location-error gps-error">{locating ? 'Obteniendo ubicación…' : 'Usar mi ubicación'}</button>
            <button type="button" onClick={() => {
              requestRef.current += 1; setLocating(false); setGpsError('')
              setErrors((current) => ({ ...current, location: undefined }))
              onPickLocation()
            }}>Elegir en el mapa</button>
          </div>
          <p role="status">{location ? `Ubicación seleccionada: ${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}` : 'Todavía no has seleccionado una ubicación.'}</p>
          <span className="field-error" id="location-error">{errors.location}</span>
          <span className="field-error" id="gps-error" role="alert">{gpsError}</span>
        </fieldset>
        <div className="report-form-footer">
          <button type="button" onClick={onClose}>Cancelar</button>
          <button className="submit-report" type="submit" disabled={locating}>Crear reporte</button>
        </div>
      </form>
    </dialog>
  )
}