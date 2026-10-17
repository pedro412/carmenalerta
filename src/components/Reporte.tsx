import { useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { ReportForm } from './ReportForm'
import type { ReportDraft } from '../types'

type ReporteProps = {
  onCreateReport: (report: ReportDraft) => void
}

export function Reporte({ onCreateReport }: ReporteProps) {
  const clickAnimation = useRef<Animation | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    clickAnimation.current?.cancel()

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      clickAnimation.current = event.currentTarget.animate(
        [{ scale: '1' }, { scale: '0.94' }, { scale: '1.04' }, { scale: '1' }],
        { duration: 320, easing: 'ease-out' },
      )
    }

    setIsOpen(true)
  }

  return (
    <>
      <button className="report-button" type="button" onClick={handleClick} aria-haspopup="dialog">
        <span className="report-button-icon" aria-hidden="true">＋</span>
        Reportar
      </button>
      {isOpen && createPortal(
        <ReportForm
          onClose={() => setIsOpen(false)}
          onSubmit={(report) => {
            onCreateReport(report)
            setIsOpen(false)
          }}
        />,
        document.body,
      )}
    </>
  )
}
