import { useMemo, useState } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { TopBar } from '../components/TopBar'
import { Chip } from '../components/Chip'
import { Button } from '../components/Button'
import { MatchBadge } from '../components/MatchBadge'
import {
  getResource,
  getRelated,
  RESOURCES,
  type Resource,
} from '../data/resources'
import { matchByUrl } from '../lib/recommend'
import './Similar.css'

/**
 * 두 경로를 함께 처리:
 * - /similar/:id            → 결과 화면·추천에서 진입 (id 기준)
 * - /similar/lookup?url=... → 방법3(GitHub 주소) 진입. url 로 매칭한 자료 기준.
 */
export function Similar() {
  const { id = '' } = useParams()
  const { search } = useLocation()
  const [seed, setSeed] = useState(0)

  const urlParam = useMemo(
    () => new URLSearchParams(search).get('url') ?? '',
    [search],
  )

  const { base, matchNote } = useMemo(() => {
    if (id === 'lookup') {
      const m = matchByUrl(urlParam)
      return {
        base: m.resource,
        matchNote: m.matched, // 'exact' | 'fuzzy' | 'none'
      }
    }
    return { base: getResource(id), matchNote: 'exact' as const }
  }, [id, urlParam])

  // 관련 자료 풀: relatedIds 우선, 부족하면 태그 겹치는 자료로 보충. seed 로 섞음.
  const related = useMemo(() => {
    if (!base) return []
    const primary = getRelated(base.id)
    const primaryIds = new Set([base.id, ...primary.map((r) => r.id)])
    const secondary = RESOURCES.filter(
      (r) =>
        !primaryIds.has(r.id) &&
        r.tags.some((t) => base.tags.includes(t)),
    )
    const pool = [...primary, ...secondary]
    // seed 기반 회전으로 "다른 자료 더 보기" 시 순서/노출이 바뀌게
    const rotate = seed % (pool.length || 1)
    return [...pool.slice(rotate), ...pool.slice(0, rotate)].slice(0, 6)
  }, [base, seed])

  if (!base) {
    return (
      <>
        <TopBar />
        <main className="page">
          <div className="empty">
            <p className="empty__title">
              “{urlParam}” 와 맞는 자료를 못 찾았어요.
            </p>
            <p className="empty__desc">
              아직 정리된 자료가 아니에요. 키워드로 찾거나 추천을 받아보세요.
            </p>
            <div className="empty__chips">
              <Link to="/">
                <Button>처음 화면으로 →</Button>
              </Link>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <TopBar />
      <main className="page sim">
        {matchNote === 'fuzzy' && (
          <div className="sim__hint" role="note">
            정확히 일치하는 자료는 없어, 가장 비슷한{' '}
            <strong>{base.name}</strong>(으)로 정리했어요.
          </div>
        )}

        {/* 조회한 자료 요약 (정리 완료) */}
        <section className="sim__base">
          <div className="sim__basehead">
            <div>
              <p className="sim__eyebrow">정리 완료</p>
              <h1 className="sim__basename">{base.name}</h1>
            </div>
            <MatchBadge label="정리했어요" />
          </div>
          <ul className="sim__basesummary">
            {base.summaryKo.slice(0, 2).map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
          <Link to={`/resource/${base.id}`}>
            <Button variant="secondary">전체 정리 보기 →</Button>
          </Link>
        </section>

        {/* 비슷한 자료 */}
        <section className="sim__list">
          <div className="sim__listhead">
            <h2 className="sim__h2">
              <span aria-hidden="true">🧩</span> 비슷한 자료도 찾았어요
            </h2>
            <Button
              variant="secondary"
              onClick={() => setSeed((s) => s + 1)}
              aria-label="다른 자료 더 보기"
            >
              <span aria-hidden="true">↻</span> 다른 자료 더 보기
            </Button>
          </div>

          <div className="sim__cards">
            {related.map((r) => (
              <SimilarRow key={r.id} base={base} r={r} />
            ))}
          </div>
        </section>
      </main>
    </>
  )
}

function diffFrom(base: Resource, r: Resource): string {
  if (base.tasks[0] === r.tasks[0]) {
    return `${base.name.split(' / ')[1] ?? base.name}와 비슷하지만, ${r.summaryKo[0]}`
  }
  return r.summaryKo[0]
}

function SimilarRow({ base, r }: { base: Resource; r: Resource }) {
  return (
    <Link to={`/resource/${r.id}`} className="simrow">
      <div className="simrow__body">
        <h3 className="simrow__name">{r.name}</h3>
        <p className="simrow__diff">{diffFrom(base, r)}</p>
        <div className="simrow__tags">
          {r.tags.slice(0, 3).map((t) => (
            <Chip key={t} label={t} readOnly />
          ))}
        </div>
      </div>
      <span className="simrow__arrow" aria-hidden="true">
        →
      </span>
    </Link>
  )
}
