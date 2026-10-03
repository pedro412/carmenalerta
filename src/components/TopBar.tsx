function BellIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
    </svg>
  )
}

export function TopBar() {

  return (
    <header className="top-bar">
      <div className="brand">
        <BellIcon />
        <strong>Alertas Carmen</strong>
        <span>en vivo</span>
      </div>

      <div className="top-actions">
        {/* Actions removed as requested */}
      </div>
    </header>
  )
}
