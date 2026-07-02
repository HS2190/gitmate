import { Link } from 'react-router-dom'
import type { Resource, Role } from '../data/resources'
import { MatchBadge } from './MatchBadge'
import { Chip } from './Chip'
import './ResourceCard.css'

interface ResourceCardProps {
  resource: Resource
  /** "왜 당신에게" 한 줄. 없으면 요약 첫 줄로 폴백. */
  reason?: string
  /** 맞춤 배지 표시 여부 */
  showMatch?: boolean
  /** 딥링크에 붙일 쿼리(조건 유지용) */
  linkQuery?: string
}

/** 역할·작업 기반 "왜 당신에게" 문구 생성 */
export function buildReason(r: Resource, role?: Role): string {
  if (role && r.applyByRole[role]?.length) {
    return `${role}라면: ${r.applyByRole[role][0]}`
  }
  return r.summaryKo[0]
}

export function ResourceCard({
  resource,
  reason,
  showMatch = true,
  linkQuery,
}: ResourceCardProps) {
  const to = `/resource/${resource.id}${linkQuery ? `?${linkQuery}` : ''}`
  return (
    <article className="rcard">
      <div className="rcard__head">
        <h3 className="rcard__name">{resource.name}</h3>
        {showMatch && <MatchBadge />}
      </div>

      <p className="rcard__reason">{reason ?? resource.summaryKo[0]}</p>

      <div className="rcard__tags">
        {resource.tags.slice(0, 4).map((t) => (
          <Chip key={t} label={t} readOnly />
        ))}
      </div>

      <div className="rcard__foot">
        <span className="rcard__lang">
          ⭐{' '}
          {resource.stars >= 1000
            ? `${Math.round(resource.stars / 1000)}k`
            : resource.stars}
          {' · '}
          {resource.repo.replace('https://github.com/', 'github.com/')}
        </span>
        <Link to={to} className="rcard__more">
          자세히 보기 <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  )
}
