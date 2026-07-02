import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopBar } from '../components/TopBar'
import { Chip } from '../components/Chip'
import { Button } from '../components/Button'
import { IntroModal } from '../components/IntroModal'
import {
  ROLE_OPTIONS,
  TASK_OPTIONS,
  PURPOSE_OPTIONS,
  DIFFICULTY_OPTIONS,
} from '../data/options'
import type { Role, Task, Purpose, Difficulty } from '../data/resources'
import { criteriaToQuery, saveCriteria } from '../lib/criteria'
import './Onboarding.css'

const SEARCH_EXAMPLES = ['영상 자막', '무드보드 이미지', '문서 자동화']

const INTRO_SEEN_KEY = 'gm.intro.v1'

export function Onboarding() {
  const navigate = useNavigate()

  // 작동 범위 안내 모달 — 첫 방문 시 자동 1회, 이후엔 히어로 버튼으로 재확인
  const [showIntro, setShowIntro] = useState(false)
  useEffect(() => {
    try {
      if (!localStorage.getItem(INTRO_SEEN_KEY)) setShowIntro(true)
    } catch {
      setShowIntro(true) // 저장소 접근 불가(프라이빗 모드 등)면 그냥 보여준다
    }
  }, [])
  const closeIntro = () => {
    setShowIntro(false)
    try {
      localStorage.setItem(INTRO_SEEN_KEY, '1')
    } catch {
      /* 저장 실패는 무시 — 다음에 또 떠도 무방 */
    }
  }

  // 방법 1 — 조건
  const [role, setRole] = useState<Role | undefined>()
  const [tasks, setTasks] = useState<Task[]>([])
  const [purpose, setPurpose] = useState<Purpose | undefined>()
  const [difficulty, setDifficulty] = useState<Difficulty | undefined>()

  // 방법 2 — 키워드
  const [keyword, setKeyword] = useState('')

  // 방법 3 — GitHub URL
  const [repoUrl, setRepoUrl] = useState('')

  const canRecommend = Boolean(role) || tasks.length > 0

  const toggleTask = (t: Task) =>
    setTasks((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    )

  const single = <T,>(cur: T | undefined, v: T, set: (x?: T) => void) =>
    set(cur === v ? undefined : v)

  const onRecommend = () => {
    const c = { role, tasks, purpose, difficulty }
    saveCriteria(c)
    navigate(`/recommend?${criteriaToQuery(c)}`)
  }

  const onSearch = (q: string) => {
    const query = q.trim()
    if (!query) return
    navigate(`/search?q=${encodeURIComponent(query)}`)
  }

  const onRepo = () => {
    const v = repoUrl.trim()
    if (!v) return
    // 실시간 분석으로 이동. 방법1에서 역할/목적을 골랐다면 함께 넘겨
    // 역할·목적 맞춤 정리를 받는다(안 골랐어도 동작).
    const c = { role, tasks, purpose, difficulty }
    saveCriteria(c)
    const q = criteriaToQuery(c)
    navigate(`/analyze?url=${encodeURIComponent(v)}${q ? `&${q}` : ''}`)
  }

  return (
    <>
      <IntroModal open={showIntro} onClose={closeIntro} />
      <TopBar />
      <main className="page onb">
        <header className="onb__hero">
          <h1 className="onb__title">어떻게 시작할까요?</h1>
          <p className="onb__subtitle">
            세 가지 방법 중 편한 걸로 — 각각 따로 써도 돼요.
          </p>
          <button
            type="button"
            className="onb__intro-link"
            onClick={() => setShowIntro(true)}
          >
            <span aria-hidden="true">ⓘ</span> 이 데모, 어디까지 진짜로
            작동하나요?
          </button>
        </header>

        <div className="onb__grid">
          {/* 방법 1 — 큰 패널 */}
          <section className="panel panel--main" aria-labelledby="m1-title">
            <div className="panel__badge">방법 1</div>
            <h2 id="m1-title" className="panel__title">
              역할·상황으로 추천받기 <span className="panel__demo">데모</span>
            </h2>
            <p className="panel__desc">
              지금 나와 하려는 일을 고르면, 딱 맞는 자료를 골라드려요.
            </p>

            <fieldset className="field">
              <legend className="field__label">나는 (역할)</legend>
              <div className="field__chips">
                {ROLE_OPTIONS.map((o) => (
                  <Chip
                    key={o.value}
                    label={o.label}
                    emoji={o.emoji}
                    active={role === o.value}
                    onClick={() => single(role, o.value, setRole)}
                  />
                ))}
              </div>
            </fieldset>

            <fieldset className="field">
              <legend className="field__label">
                지금 하려는 건 (작업 · 하나 이상)
              </legend>
              <div className="field__chips">
                {TASK_OPTIONS.map((o) => (
                  <Chip
                    key={o.value}
                    label={o.label}
                    emoji={o.emoji}
                    active={tasks.includes(o.value)}
                    onClick={() => toggleTask(o.value)}
                  />
                ))}
              </div>
            </fieldset>

            <fieldset className="field">
              <legend className="field__label">목적</legend>
              <div className="field__chips">
                {PURPOSE_OPTIONS.map((o) => (
                  <Chip
                    key={o.value}
                    label={o.label}
                    emoji={o.emoji}
                    active={purpose === o.value}
                    onClick={() => single(purpose, o.value, setPurpose)}
                  />
                ))}
              </div>
            </fieldset>

            <fieldset className="field">
              <legend className="field__label">실행은 (난이도)</legend>
              <div className="field__chips">
                {DIFFICULTY_OPTIONS.map((o) => (
                  <Chip
                    key={o.value}
                    label={o.label}
                    emoji={o.emoji}
                    active={difficulty === o.value}
                    onClick={() => single(difficulty, o.value, setDifficulty)}
                  />
                ))}
              </div>
            </fieldset>

            <Button
              size="lg"
              onClick={onRecommend}
              disabled={!canRecommend}
              className="onb__cta"
            >
              이 조건으로 추천받기 <span aria-hidden="true">→</span>
            </Button>
            {!canRecommend && (
              <p className="field__hint">
                역할 또는 작업을 하나 이상 골라주세요.
              </p>
            )}
          </section>

          {/* 오른쪽 세로 두 패널 */}
          <div className="onb__side">
            {/* 방법 2 */}
            <section className="panel" aria-labelledby="m2-title">
              <div className="panel__badge">방법 2</div>
              <h2 id="m2-title" className="panel__title">
                키워드로 찾기 <span className="panel__demo">데모</span>
              </h2>
              <form
                className="searchbar"
                onSubmit={(e) => {
                  e.preventDefault()
                  onSearch(keyword)
                }}
              >
                <input
                  className="input"
                  type="search"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="예: 영상 자막, 무드보드 이미지…"
                  aria-label="키워드 검색"
                />
                <Button type="submit" aria-label="검색">
                  찾기
                </Button>
              </form>
              <div className="panel__examples">
                {SEARCH_EXAMPLES.map((ex) => (
                  <Chip
                    key={ex}
                    label={ex}
                    onClick={() => onSearch(ex)}
                  />
                ))}
              </div>
            </section>

            {/* 방법 3 */}
            <section className="panel" aria-labelledby="m3-title">
              <div className="panel__badge">방법 3</div>
              <h2 id="m3-title" className="panel__title">
                GitHub 주소로 알아보기 <span className="panel__live">⚡ 실시간</span>
              </h2>
              <p className="panel__desc">
                아무 공개 저장소 주소나 붙여넣으면, AI가 실제 README를 읽고
                한국어로 정리해 드려요.
              </p>
              <form
                className="stack"
                style={{ gap: 'var(--sp-2)' }}
                onSubmit={(e) => {
                  e.preventDefault()
                  onRepo()
                }}
              >
                <input
                  className="input"
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="github.com/openai/whisper"
                  aria-label="GitHub 주소"
                />
                <Button type="submit" variant="secondary">
                  이 주소 정리하기 <span aria-hidden="true">→</span>
                </Button>
              </form>
            </section>
          </div>
        </div>
      </main>
    </>
  )
}
