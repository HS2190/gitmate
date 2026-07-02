import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import './TopBar.css'

interface TopBarProps {
  /** 우측 영역 (조건 칩 요약 등) */
  aside?: ReactNode
}

export function TopBar({ aside }: TopBarProps) {
  return (
    <header className="topbar">
      <div className="topbar__inner">
        <Link to="/" className="topbar__brand" aria-label="깃메이트 홈으로">
          <span className="topbar__dot" aria-hidden="true" />
          <span className="topbar__name">깃메이트</span>
          <span className="topbar__tag">GitHub 자료를 나에게 맞게</span>
        </Link>
        {aside && <div className="topbar__aside">{aside}</div>}
      </div>
    </header>
  )
}
