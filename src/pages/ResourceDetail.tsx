import { useMemo } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { TopBar } from '../components/TopBar'
import { Chip } from '../components/Chip'
import { Button } from '../components/Button'
import { MatchBadge } from '../components/MatchBadge'
import { getResource, type Role } from '../data/resources'
import { readCriteria } from '../lib/criteria'
import './ResourceDetail.css'

/** stars를 104000 → "104k"로 */
function fmtStars(n: number): string {
  return n >= 1000 ? `${Math.round(n / 1000)}k` : String(n)
}

export function ResourceDetail() {
  const { id = '' } = useParams()
  const { search } = useLocation()
  const resource = getResource(id)

  const criteria = useMemo(() => readCriteria(search), [search])
  const role: Role = criteria.role ?? '기타'
  const linkQuery = search.replace(/^\?/, '')

  if (!resource) {
    return (
      <>
        <TopBar />
        <main className="page">
          <div className="empty">
            <p className="empty__title">자료를 찾을 수 없어요.</p>
            <Link to="/">
              <Button variant="secondary">처음으로 돌아가기</Button>
            </Link>
          </div>
        </main>
      </>
    )
  }

  const applySteps = resource.applyByRole[role]
  const purposeLabel = criteria.purpose ? ` · ${criteria.purpose}` : ''
  const githubUrl = resource.repo

  return (
    <>
      <TopBar />
      <main className="page rd">
        <nav className="rd__crumb" aria-label="이동 경로">
          <Link to="/">홈</Link>
          <span aria-hidden="true">›</span>
          <span>자료 정리</span>
        </nav>

        <article className="rd__card">
          <header className="rd__header">
            <div>
              <h1 className="rd__name">{resource.name}</h1>
              <p className="rd__source">
                ⭐ {fmtStars(resource.stars)} · GitHub · 영어 README
              </p>
              <p
                style={{
                  color: 'var(--mut)',
                  fontSize: 13,
                  marginTop: 4,
                  fontStyle: 'italic',
                }}
              >
                {resource.descEn}
              </p>
            </div>
            <MatchBadge label="당신에게 맞아요" />
          </header>

          <div className="rd__tags">
            {resource.tags.map((t) => (
              <Chip key={t} label={t} readOnly />
            ))}
          </div>

          <p
            style={{
              color: 'var(--sub)',
              fontSize: 13,
              margin: '14px 0 2px',
              display: 'flex',
              gap: 6,
              alignItems: 'center',
            }}
          >
            <span aria-hidden="true">🤖</span>
            실제 GitHub 자료(README)를 바탕으로 AI가 한국어로 정리했어요.
          </p>

          {/* 한눈에 · 한국어 */}
          <section className="rd__section">
            <h2 className="rd__h2">
              <span aria-hidden="true">👀</span> 한눈에 · 한국어
            </h2>
            <ul className="rd__bullets">
              {resource.summaryKo.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </section>

          {/* 나에게 적용하면 */}
          <section className="rd__section">
            <h2 className="rd__h2">
              <span aria-hidden="true">🧭</span> 나에게 적용하면 ·{' '}
              <span className="rd__role">
                {role}
                {purposeLabel}
              </span>
            </h2>
            <ol className="rd__steps">
              {applySteps.map((step, i) => (
                <li key={i}>
                  <span className="rd__stepnum" aria-hidden="true">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* 막힘 */}
          <section className="rd__warn" role="note">
            <span className="rd__warnicon" aria-hidden="true">
              ⚠
            </span>
            <div>
              <strong className="rd__warntitle">여기서 막힐 수 있어요</strong>
              <p className="rd__warntext">{resource.pitfall}</p>
            </div>
          </section>

          {/* 이 자료로 가기 */}
          <section className="rd__section rd__go">
            <h2 className="rd__h2">
              <span aria-hidden="true">🔗</span> 이 자료로 가기
            </h2>
            <div className="rd__golink">
              <code className="rd__url">
                {githubUrl.replace('https://', '')}
              </code>
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button>
                  GitHub에서 열기 <span aria-hidden="true">↗</span>
                </Button>
              </a>
            </div>
          </section>
        </article>

        <div className="rd__more">
          <Link to={`/similar/${resource.id}${linkQuery ? `?${linkQuery}` : ''}`}>
            <Button variant="ghost" size="lg">
              비슷한 자료 더 보기 <span aria-hidden="true">→</span>
            </Button>
          </Link>
        </div>
      </main>
    </>
  )
}
