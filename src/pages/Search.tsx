import { useMemo, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { TopBar } from '../components/TopBar'
import { Chip } from '../components/Chip'
import { Button } from '../components/Button'
import { ResourceCard } from '../components/ResourceCard'
import { searchByKeyword } from '../lib/recommend'
import './List.css'

const SUGGESTIONS = ['자막', '이미지', '자동화', '문서 변환', '화이트보드']

export function Search() {
  const { search } = useLocation()
  const navigate = useNavigate()
  const q = useMemo(
    () => new URLSearchParams(search).get('q') ?? '',
    [search],
  )
  const [seed, setSeed] = useState(0)

  const results = useMemo(() => searchByKeyword(q, seed), [q, seed])

  const go = (term: string) =>
    navigate(`/search?q=${encodeURIComponent(term)}`)

  return (
    <>
      <TopBar />
      <main className="page list">
        <header className="list__head">
          <h1 className="list__title">
            <span className="list__searchterm">
              <span aria-hidden="true">🔎</span> “{q}”
            </span>{' '}
            검색 결과
          </h1>
          {results.length > 0 && (
            <div className="list__meta">
              <span className="list__count">{results.length}개 찾았어요</span>
              <Button
                variant="secondary"
                onClick={() => setSeed((s) => s + 1)}
                aria-label="다른 순서로 다시 보기"
              >
                <span aria-hidden="true">↻</span> 다시 정렬
              </Button>
            </div>
          )}
        </header>

        {results.length === 0 ? (
          <div className="empty">
            <p className="empty__title">“{q}”에 맞는 자료가 없어요.</p>
            <p className="empty__desc">
              다른 키워드로 찾거나, 역할·상황으로 추천받아 보세요.
            </p>
            <div className="empty__chips">
              {SUGGESTIONS.map((s) => (
                <Chip key={s} label={s} onClick={() => go(s)} />
              ))}
            </div>
            <Link to="/">
              <Button>역할·상황으로 추천받기 →</Button>
            </Link>
          </div>
        ) : (
          <div className="list__cards">
            {results.map((r) => (
              <ResourceCard key={r.id} resource={r} showMatch={false} />
            ))}
          </div>
        )}
      </main>
    </>
  )
}
