import './MatchBadge.css'

interface MatchBadgeProps {
  /** 표시 문구. 기본 "맞아요" */
  label?: string
}

/** 판단 신호 배지 — 초록. 색 외 단서로 🎯 아이콘과 텍스트를 함께 제공(접근성). */
export function MatchBadge({ label = '맞아요' }: MatchBadgeProps) {
  return (
    <span className="match-badge">
      <span aria-hidden="true">🎯</span>
      {label}
    </span>
  )
}
