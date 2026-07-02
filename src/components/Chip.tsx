import './Chip.css'

interface ChipProps {
  label: string
  emoji?: string
  active?: boolean
  onClick?: () => void
  /** 선택 컨트롤이 아닌 순수 표시용 (조건 요약 등) */
  readOnly?: boolean
}

export function Chip({ label, emoji, active, onClick, readOnly }: ChipProps) {
  if (readOnly) {
    return (
      <span className="chip chip--readonly">
        {emoji && <span aria-hidden="true">{emoji}</span>}
        {label}
      </span>
    )
  }
  return (
    <button
      type="button"
      className={`chip chip--btn${active ? ' chip--active' : ''}`}
      aria-pressed={active}
      onClick={onClick}
    >
      {emoji && <span aria-hidden="true">{emoji}</span>}
      {label}
    </button>
  )
}
