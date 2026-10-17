import { useEffect, useId, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { categories } from '../data/categories'
import type { ReportDraft, ReportLocation, Severity } from '../types'
import { MapView } from './MapView'
import { validateReportLocation } from '../utils/reportLocation'

type ReportFormProps = {
  onClose: () => void
  onSubmit: (report: ReportDraft) => void
}

type Field = 'category' | 'description' | 'severity' | 'location'
const DESCRIPTION_LIMIT = 140
const severityOptions: { value: Severity; label: string }[] = [
  { value: 'low', label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
]
const emptyReports: [] = []
const ignoreReportSelection = () => {}

export function ReportForm({ onClose, onSubmit }: ReportFormProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const categoryRef = useRef<HTMLSelectElement>(null)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)
  const severityRef = useRef<HTMLInputElement>(null)
  const locationRef = useRef<HTMLButtonElement>(null)
  const gpsRequest = useRef(0)
  const id = useId()
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [severity, setSeverity] = useState<Severity | ''>('')
  const [location, setLocation] = useState<ReportLocation | null>(null)
  const [locationSource, setLocationSource] = useState<'gps' | 'map'>('map')
  const [showMap, setShowMap] = useState(false)
  const [locating, setLocating] = useState(false)
  const [gpsError, setGpsError] = useState('')
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})
  const category = categories.find((item) => item.id === categoryId)

  useEffect(() => {
    const dialog = dialogRef.current
    const previousFocus = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    // Native modal dialogs keep keyboard focus inside and make the background inert.
    dialog?.showModal()
    categoryRef.current?.focus()
    document.body.style.overflow = 'hidden'
    return () => {
      gpsRequest.current += 1
      dialog?.close()
      document.body.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [])

  const clearError = (field: Field) => {
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const trapFocus = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== 'Tab') return
    const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(
      'button:not([disabled]), select:not([disabled]), textarea:not([disabled]), input:not([disabled]), a[href], [tabindex="0"]',
    )).filter((element) => element.getClientRects().length > 0)
    const first = controls[0]
    const last = controls[controls.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last?.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first?.focus()
    }
  }

  const selectLocation = (point: ReportLocation, source: 'gps' | 'map' = 'map') => {
    gpsRequest.current += 1
    setLocating(false)
    setGpsError('')
    const error = validateReportLocation(point)
    if (error) {
      // A rejected attempt must not silently submit an earlier valid location.
      setLocation(null)
      setErrors((current) => ({ ...current, location: error }))
      return
    }
    setLocation(point)
    setLocationSource(source)
    clearError('location')
  }

  const useMyLocation = () => {
    setGpsError('')
    if (!window.isSecureContext) {
      setGpsError('La ubicación requiere HTTPS o localhost. Puedes seleccionar un punto del mapa.')
      return
    }
    if (!navigator.geolocation) {
      setGpsError('Tu navegador no permite obtener la ubicación. Selecciona un punto del mapa.')
      return
    }
    const request = ++gpsRequest.current
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (request !== gpsRequest.current) return
        selectLocation({ latitude: coords.latitude, longitude: coords.longitude }, 'gps')
      },
      (error) => {
        if (request !== gpsRequest.current) return
        setLocating(false)
        setGpsError(error.code === 1
          ? 'Permiso de ubicación denegado. Puedes habilitarlo en el navegador o elegir un punto del mapa.'
          : error.code === 3
            ? 'La ubicación tardó demasiado. Intenta de nuevo o elige un punto del mapa.'
            : 'No se pudo obtener tu ubicación. Intenta de nuevo o elige un punto del mapa.')
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    )
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors: Partial<Record<Field, string>> = {}
    const trimmedDescription = description.trim()
    if (!category) nextErrors.category = 'Selecciona una categoría.'
    if (!trimmedDescription) nextErrors.description = 'Describe brevemente el incidente.'
    else if (trimmedDescription.length > DESCRIPTION_LIMIT) nextErrors.description = 'La descripción debe tener como máximo 140 caracteres.'
    if (category?.requiresSeverity && !severity) nextErrors.severity = 'Selecciona la severidad del incidente.'
    const locationError = validateReportLocation(location)
    if (locationError) nextErrors.location = locationError
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      if (nextErrors.category) categoryRef.current?.focus()
      else if (nextErrors.description) descriptionRef.current?.focus()
      else if (nextErrors.severity) severityRef.current?.focus()
      else locationRef.current?.focus()
      return
    }
    if (!category || !location) return
    // Release background inertness before App updates its live success message.
    dialogRef.current?.close()
    onSubmit({
      categoryId: category.id,
      description: trimmedDescription,
      severity: severity || 'low',
      ...location,
      location: locationSource === 'gps' ? 'Ubicación obtenida por GPS' : 'Ubicación seleccionada en el mapa',
    })
  }

  return (
    <dialog ref={dialogRef} className="report-dialog" aria-labelledby={`${id}-title`} aria-describedby={`${id}-intro`} onKeyDown={trapFocus}
      onCancel={(event) => { event.preventDefault(); onClose() }}>
      <div className="report-form-header">
        <div>
          <h2 id={`${id}-title`}>Reportar un incidente</h2>
          <p id={`${id}-intro`}>Cuéntanos qué ocurre y dónde. Los campos marcados con * son obligatorios.</p>
        </div>
        <button className="report-close" type="button" aria-label="Cerrar formulario de reporte" onClick={onClose}>×</button>
      </div>
      <form className="report-form" onSubmit={handleSubmit} noValidate>
        <div className="report-field">
          <label htmlFor={`${id}-category`}>Categoría *</label>
          <select id={`${id}-category`} ref={categoryRef} value={categoryId} required
            aria-invalid={!!errors.category} aria-describedby={errors.category ? `${id}-category-error` : undefined}
            onChange={(event) => { setCategoryId(event.target.value); setSeverity(''); clearError('category'); clearError('severity') }}>
            <option value="">Selecciona una categoría</option>
            {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          {errors.category && <p className="report-error" id={`${id}-category-error`} role="alert">{errors.category}</p>}
        </div>

        <div className="report-field">
          <label htmlFor={`${id}-description`}>Descripción breve *</label>
          <textarea id={`${id}-description`} ref={descriptionRef} value={description} required rows={3} maxLength={DESCRIPTION_LIMIT}
            placeholder="Por ejemplo: calle inundada, el agua cubre la banqueta."
            aria-invalid={!!errors.description} aria-describedby={`${id}-count${errors.description ? ` ${id}-description-error` : ''}`}
            onChange={(event) => { setDescription(event.target.value); clearError('description') }} />
          <span className="report-character-count" id={`${id}-count`}>{description.length}/{DESCRIPTION_LIMIT} caracteres</span>
          {errors.description && <p className="report-error" id={`${id}-description-error`} role="alert">{errors.description}</p>}
        </div>

        {category?.requiresSeverity && <fieldset className="report-field report-severity" aria-describedby={errors.severity ? `${id}-severity-error` : undefined}>
          <legend>Severidad *</legend>
          <div className="report-severity-options">
            {severityOptions.map((option, index) => <label key={option.value}>
              <input ref={index === 0 ? severityRef : undefined} type="radio" name={`${id}-severity`} value={option.value}
                checked={severity === option.value} required aria-invalid={!!errors.severity}
                onChange={() => { setSeverity(option.value); clearError('severity') }} />
              {option.label}
            </label>)}
          </div>
          {errors.severity && <p className="report-error" id={`${id}-severity-error`} role="alert">{errors.severity}</p>}
        </fieldset>}

        <fieldset className="report-field report-location" aria-describedby={`${id}-coverage`}>
          <legend>Ubicación *</legend>
          <p className="report-location-status" id={`${id}-coverage`}>Solo se aceptan ubicaciones dentro de la zona de cobertura de Ciudad del Carmen.</p>
          <div className="report-location-actions">
            <button ref={locationRef} type="button" className="report-secondary" disabled={locating} onClick={useMyLocation}
              aria-describedby={errors.location ? `${id}-location-error` : undefined}>
              {locating ? 'Obteniendo ubicación…' : 'Usar mi ubicación'}
            </button>
            <button type="button" className="report-secondary" aria-expanded={showMap} aria-controls={`${id}-map`}
              onClick={() => {
                gpsRequest.current += 1
                setLocating(false)
                setGpsError('')
                setShowMap((current) => !current)
              }}>{showMap ? 'Ocultar mapa' : 'Elegir en el mapa'}</button>
          </div>
          {gpsError && <p className="report-error" role="alert">{gpsError}</p>}
          {errors.location && <p className="report-error" id={`${id}-location-error`} role="alert">{errors.location}</p>}
          <p className="report-location-status" role="status">
            {locating ? 'Esperando la ubicación del dispositivo.' : location
              ? `Ubicación seleccionada: ${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
              : 'Aún no has seleccionado una ubicación.'}
          </p>
          {showMap && <div id={`${id}-map`} className="report-map-picker">
            <p>Toca un punto del mapa. Con teclado, mueve el mapa con las flechas o WASD y pulsa «Usar el centro del mapa».</p>
            <MapView reports={emptyReports} categories={categories} selectedId={null} onSelectReport={ignoreReportSelection}
              onSelectLocation={selectLocation} selectedLocation={location} />
          </div>}
        </fieldset>

        <p className="report-form-note">El reporte se mostrará como «sin verificar». En esta versión se guarda durante la sesión y se pierde al recargar.</p>
        <div className="report-form-actions">
          <button type="button" className="report-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" className="report-submit" disabled={locating}>Crear reporte</button>
        </div>
      </form>
    </dialog>
  )
}
