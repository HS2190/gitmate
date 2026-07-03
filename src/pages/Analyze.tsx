import { useEffect, useMemo, useState } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { TopBar } from '../components/TopBar'
import { Chip } from '../components/Chip'
import { Button } from '../components/Button'
import { MatchBadge } from '../components/MatchBadge'
import { readCriteria } from '../lib/criteria'
import { requestAnalyze, type LiveResult } from '../lib/analyzeClient'
import { trackEvent } from '../lib/analytics'
import type { Role } from '../data/resources'
import './ResourceDetail.css'
import './Analyze.css'

/** stars 104000 → "104k" */
function fmtStars(n: number): string {
  return n >= 1000 ? `${Math.round(n / 1000)}k` : String(n)
}

type Phase =
  | { kind: 'loading' }
  | { kind: 'live'; result: LiveResult }
  | { kind: 'fallback'; reason: string; message: string; url: string }

/**
 * 방법3 실시간 분석 결과 화면.
 * /analyze?url=..(&role=..&purpose=..)
 *  - 로딩: 스켈레톤
 *  - 성공(live): ResourceDetail 레이아웃 재사용 + "실시간 분석" 뱃지
 *  - 실패/폴백: 안내 배너 + 캐시 유사 매칭(/similar/lookup)으로 이동 버튼
 */
export function Analyze() {
  const { search } = useLocation()
  const navigate = useNavigate()

  const url = useMemo(
    () => new URLSearchParams(search).get('url') ?? '',
    [search],
  )
  const criteria = useMemo(() => readCriteria(search), [search])
  const role: Role = criteria.role ?? '기타'
  const purpose = criteria.purpose

  const [phase, setPhase] = useState<Phase>({ kind: 'loading' })

  useEffect(() => {
    let alive = true
    if (!url) {
      setPhase({
        kind: 'fallback',
        reason: 'bad_url',
        message: '분석할 GitHub 주소가 없어요.',
        url: '',
      })
      return
    }
    setPhase({ kind: 'loading' })
    trackEvent('analyze_submit', { repo: url.slice(0, 100) })
    requestAnalyze(url, role, purpose).then((res) => {
      if (!alive) return
      if ('fallback' in res) {
        trackEvent('analyze_result', { outcome: 'fallback', reason: res.reason })
        setPhase({
          kind: 'fallback',
          reason: res.reason,
          message: res.message,
          url,
        })
      } else {
        trackEvent('analyze_result', { outcome: 'live' })
        setPhase({ kind: 'live', result: res })
      }
    })
    return () => {
      alive = false
    }
  }, [url, role, purpose])

  // 폴백 안내 문구 — 사유별 분기
  const fallbackNote = (reason: string): string => {
    switch (reason) {
      case 'no_key':
        return '실시간 분석이 아직 설정되지 않았어요. 비슷한 캐시 자료로 안내할게요.'
      case 'rate_limited_ip':
      case 'rate_limited_global':
        return '오늘 실시간 분석 한도에 도달했어요. 비슷한 캐시 자료로 안내할게요.'
      case 'repo_not_found':
        return '공개된 저장소를 못 찾았어요. 비슷한 캐시 자료로 안내할게요.'
      case 'bad_url':
        return '주소 형식을 인식하지 못했어요. 비슷한 캐시 자료로 안내할게요.'
      default:
        return '실시간 분석에 실패했어요. 비슷한 캐시 자료로 안내할게요.'
    }
  }

  // ---- 로딩 (스켈레톤) ----
  if (phase.kind === 'loading') {
    return (
      <>
        <TopBar />
        <main className="page rd">
          <nav className="rd__crumb" aria-label="이동 경로">
            <Link to="/">홈</Link>
            <span aria-hidden="true">›</span>
            <span>실시간 분석</span>
          </nav>
          <div
            className="rd__card sk"
            role="status"
            aria-live="polite"
            aria-busy="true"
          >
            <div className="sk__spinnerrow">
              <span className="sk__spinner" aria-hidden="true" />
              <p className="sk__label">
                AI가 방금 GitHub의 실제 README를 읽고 정리하고 있어요…
              </p>
            </div>
            <div className="sk__line sk__line--title" />
            <div className="sk__line sk__line--sub" />
            <div className="sk__block" />
            <div className="sk__line" />
            <div className="sk__line" />
            <div className="sk__line sk__line--short" />
          </div>
        </main>
      </>
    )
  }

  // ---- 폴백 (안내 배너 + 캐시 매칭으로 이동) ----
  if (phase.kind === 'fallback') {
    return (
      <>
        <TopBar />
        <main className="page rd">
          <nav className="rd__crumb" aria-label="이동 경로">
            <Link to="/">홈</Link>
            <span aria-hidden="true">›</span>
            <span>실시간 분석</span>
          </nav>

          <div className="live-banner live-banner--warn" role="note">
            <span aria-hidden="true">💡</span>
            <span>{fallbackNote(phase.reason)}</span>
          </div>

          <div className="rd__card" style={{ alignItems: 'flex-start' }}>
            <p style={{ color: 'var(--ink)', fontSize: 15, lineHeight: 1.6 }}>
              <strong>{phase.url.replace(/^https?:\/\//, '')}</strong> 를
              실시간으로 정리하지 못했어요.
            </p>
            <p style={{ color: 'var(--sub)', fontSize: 14 }}>
              대신 저장된 자료 중 비슷한 것을 찾아 정리해 드릴게요.
            </p>
            <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
              <Button
                onClick={() =>
                  navigate(
                    `/similar/lookup?url=${encodeURIComponent(phase.url)}`,
                  )
                }
              >
                비슷한 캐시 자료로 보기 <span aria-hidden="true">→</span>
              </Button>
              <Link to="/">
                <Button variant="secondary">처음 화면으로</Button>
              </Link>
            </div>
          </div>
        </main>
      </>
    )
  }

  // ---- 성공 (live) — ResourceDetail 레이아웃 재사용 ----
  const { result } = phase
  const c = result.content
  const purposeLabel = result.purpose ? ` · ${result.purpose}` : ''

  return (
    <>
      <TopBar />
      <main className="page rd">
        <nav className="rd__crumb" aria-label="이동 경로">
          <Link to="/">홈</Link>
          <span aria-hidden="true">›</span>
          <span>실시간 분석</span>
        </nav>

        <div className="live-banner" role="note">
          <span aria-hidden="true">⚡</span>
          <span>
            AI가 방금 실제 README를 읽고 정리했어요
            {result.cached ? ' (이 세션에서 다시 불러옴)' : ''}.
          </span>
        </div>

        <article className="rd__card">
          <header className="rd__header">
            <div>
              <h1 className="rd__name">{result.name}</h1>
              <p className="rd__source">
                ⭐ {fmtStars(result.stars)} · GitHub · 영어 README
              </p>
              {result.descEn && (
                <p
                  style={{
                    color: 'var(--mut)',
                    fontSize: 13,
                    marginTop: 4,
                    fontStyle: 'italic',
                  }}
                >
                  {result.descEn}
                </p>
              )}
            </div>
            <span className="live-badge">
              <span aria-hidden="true">⚡</span> 실시간 분석
            </span>
          </header>

          {(c.tags.length > 0 || result.topics.length > 0) && (
            <div className="rd__tags">
              {(c.tags.length ? c.tags : result.topics)
                .slice(0, 6)
                .map((t) => (
                  <Chip key={t} label={t} readOnly />
                ))}
            </div>
          )}

          <p
            style={{
              color: 'var(--sub)',
              fontSize: 13,
              margin: '2px 0',
              display: 'flex',
              gap: 6,
              alignItems: 'center',
            }}
          >
            <span aria-hidden="true">🤖</span>
            실제 GitHub 자료(README)를 바탕으로 AI가 방금 한국어로 정리했어요.
          </p>

          {/* 한눈에 · 한국어 */}
          <section className="rd__section">
            <h2 className="rd__h2">
              <span aria-hidden="true">👀</span> 한눈에 · 한국어
            </h2>
            <ul className="rd__bullets">
              {c.summaryKo.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </section>

          {/* 나에게 적용하면 */}
          <section className="rd__section">
            <h2 className="rd__h2">
              <span aria-hidden="true">🧭</span> 나에게 적용하면 ·{' '}
              <span className="rd__role">
                {result.role}
                {purposeLabel}
              </span>
            </h2>
            <ol className="rd__steps">
              {c.applySteps.map((step, i) => (
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
          {c.pitfall && (
            <section className="rd__warn" role="note">
              <span className="rd__warnicon" aria-hidden="true">
                ⚠
              </span>
              <div>
                <strong className="rd__warntitle">여기서 막힐 수 있어요</strong>
                <p className="rd__warntext">{c.pitfall}</p>
              </div>
            </section>
          )}

          {/* 이 자료로 가기 */}
          <section className="rd__section rd__go">
            <h2 className="rd__h2">
              <span aria-hidden="true">🔗</span> 이 자료로 가기
            </h2>
            <div className="rd__golink">
              <code className="rd__url">
                {result.repo.replace('https://', '')}
              </code>
              <a href={result.repo} target="_blank" rel="noopener noreferrer">
                <Button>
                  GitHub에서 열기 <span aria-hidden="true">↗</span>
                </Button>
              </a>
            </div>
          </section>
        </article>

        <div className="rd__more">
          <Link
            to={`/similar/lookup?url=${encodeURIComponent(result.repo)}`}
          >
            <Button variant="ghost" size="lg">
              비슷한 자료 더 보기 <span aria-hidden="true">→</span>
            </Button>
          </Link>
        </div>

        <p className="live-footnote">
          <MatchBadge label="실제 자료 기반" /> 이 정리는 방금 GitHub API로 받은
          실제 README를 근거로 생성했어요. 추천·키워드·유사 자료는 저장된 캐시를
          사용합니다.
        </p>
      </main>
    </>
  )
}
