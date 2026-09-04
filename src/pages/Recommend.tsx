import { useEffect, useMemo, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { TopBar } from '../components/TopBar'
import { Chip } from '../components/Chip'
import { Button } from '../components/Button'
import { ResourceCard, buildReason } from '../components/ResourceCard'
import { readCriteria } from '../lib/criteria'
import { recommend } from '../lib/recommend'
import { emojiFor } from '../data/options'
import { trackEvent } from '../lib/analytics'
import { RESOURCES } from '../data/resources'
import './List.css'

export function Recommend() {
  const { search } = useLocation()
  const criteria = useMemo(() => readCriteria(search), [search])
  const [seed, setSeed] = useState(0)

  const results = useMemo(
    () => recommend(criteria, seed),
    [criteria, seed],
  )

  // 추천 결과가 실제로 몇 건 나왔는지 남긴다.
  // select_method(방법 선택)와 analyze_result(분석 완료) 사이가 계측 공백이라
  // 결과 0건으로 되돌아가는 건지, 결과를 보고도 안 눌러보는 건지 구분되지 않았다.
  useEffect(() => {
    trackEvent('recommend_results', {
      result_count: results.length,
      role: criteria.role ?? '(none)',
      task_count: criteria.tasks.length,
      reshuffled: seed > 0,
    })
  }, [results, criteria, seed])

  const linkQuery = search.replace(/^\?/, '')
  const taskLabel = criteria.tasks[0] ?? '내 상황'

  const summaryChips = [
    criteria.role,
    ...criteria.tasks,
    criteria.purpose,
    criteria.difficulty,
  ].filter(Boolean) as string[]

  return (
    <>
      <TopBar
        aside={
          summaryChips.length ? (
            <>
              {summaryChips.slice(0, 4).map((c) => (
                <Chip key={c} label={c} emoji={emojiFor(c)} readOnly />
              ))}
            </>
          ) : undefined
        }
      />
      <main className="page list">
        <header className="list__head">
          <h1 className="list__title">
            <span aria-hidden="true">🔎</span> {taskLabel}에 맞는 자료
          </h1>
          <p className="list__subtitle">
            역할·작업·목적에 맞춰 골랐어요. 마음에 안 들면 새로고침해 다른
            자료를 볼 수 있어요.
          </p>
          <div className="list__meta">
            <span className="list__count">
              {RESOURCES.length}개 중 당신에게 맞는 {results.length}개
            </span>
            <Button
              variant="secondary"
              onClick={() => setSeed((s) => s + 1)}
              aria-label="다른 자료 추천받기"
            >
              <span aria-hidden="true">↻</span> 다른 자료 추천받기
            </Button>
          </div>
        </header>

        {results.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="list__cards">
            {results.map((r) => (
              <ResourceCard
                key={r.id}
                resource={r}
                reason={buildReason(r, criteria.role)}
                linkQuery={linkQuery}
              />
            ))}
          </div>
        )}
      </main>
    </>
  )
}

function EmptyState() {
  return (
    <div className="empty">
      <p className="empty__title">조건에 딱 맞는 자료를 못 찾았어요.</p>
      <p className="empty__desc">조건을 넓히거나 처음 화면에서 다시 골라보세요.</p>
      <Link to="/">
        <Button variant="secondary">처음으로 돌아가기</Button>
      </Link>
    </div>
  )
}
