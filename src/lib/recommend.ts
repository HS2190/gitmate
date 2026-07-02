import {
  RESOURCES,
  type Resource,
  type Role,
  type Task,
  type Purpose,
  type Difficulty,
} from '../data/resources'

export interface Criteria {
  role?: Role
  tasks: Task[]
  purpose?: Purpose
  difficulty?: Difficulty
}

/**
 * 선택 조건으로 자료를 점수화한다.
 * - 작업 일치: 가장 강한 신호 (+3/개)
 * - 역할 일치: +2
 * - 난이도 일치: +1
 * 점수 0(아무 신호 없음)이면 제외.
 */
function score(r: Resource, c: Criteria): number {
  let s = 0
  if (c.tasks.length) {
    const hit = c.tasks.filter((t) => r.tasks.includes(t)).length
    s += hit * 3
  }
  if (c.role && r.roles.includes(c.role)) s += 2
  if (c.difficulty && r.difficulty === c.difficulty) s += 1
  return s
}

function shuffle<T>(arr: T[], seed: number): T[] {
  // 시드 기반 결정적 셔플 — 새로고침(seed 증가) 시 순서가 실제로 바뀐다.
  const a = [...arr]
  let m = a.length
  let s = seed || 1
  const rand = () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
  while (m) {
    const i = Math.floor(rand() * m--)
    ;[a[m], a[i]] = [a[i], a[m]]
  }
  return a
}

/**
 * 추천 목록. seed 를 바꾸면(새로고침) 동점 자료의 순서·노출 조합이 바뀐다.
 * 신호가 전혀 없으면(빈 조건) 전체를 셔플해 보여준다.
 */
export function recommend(c: Criteria, seed = 0): Resource[] {
  const scored = RESOURCES.map((r) => ({ r, s: score(r, c) }))
  const anySignal = c.tasks.length > 0 || Boolean(c.role) || Boolean(c.difficulty)

  let pool = anySignal ? scored.filter((x) => x.s > 0) : scored

  if (pool.length === 0) pool = scored // 조건이 너무 좁으면 전체로 폴백

  // 점수 내림차순 유지하되, 같은 점수 그룹은 seed 로 셔플해 새로고침마다 바뀌게.
  const byScore = new Map<number, Resource[]>()
  for (const { r, s } of pool) {
    const g = byScore.get(s) ?? []
    g.push(r)
    byScore.set(s, g)
  }
  const scoresDesc = [...byScore.keys()].sort((a, b) => b - a)
  const out: Resource[] = []
  for (const sc of scoresDesc) {
    out.push(...shuffle(byScore.get(sc)!, seed + sc))
  }
  return out
}

/** 키워드 검색 — 이름/태그/작업/요약을 대상으로 부분 일치. */
export function searchByKeyword(q: string, seed = 0): Resource[] {
  const query = q.trim().toLowerCase()
  if (!query) return []
  const hits = RESOURCES.filter((r) => {
    const hay = [
      r.name,
      r.tags.join(' '),
      r.tasks.join(' '),
      r.summaryKo.join(' '),
    ]
      .join(' ')
      .toLowerCase()
    // 공백 기준 토큰 중 하나라도 포함되면 매칭
    return query.split(/\s+/).some((tok) => hay.includes(tok))
  })
  return shuffle(hits, seed + 1)
}

/** GitHub URL 로 자료 매칭. 없으면 이름 유사도로 근접 매칭. */
export function matchByUrl(input: string): {
  resource?: Resource
  matched: 'exact' | 'fuzzy' | 'none'
} {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/+$/, '')
      .replace(/\.git$/, '')
  const target = norm(input)
  if (!target) return { matched: 'none' }

  // exact: repo url 포함 관계
  const exact = RESOURCES.find(
    (r) => norm(r.repo).includes(target) || target.includes(norm(r.repo)),
  )
  if (exact) return { resource: exact, matched: 'exact' }

  // fuzzy: owner/name 토큰 겹침이 가장 큰 것
  const tokens = target.split(/[\/\-_.\s]+/).filter(Boolean)
  let best: Resource | undefined
  let bestScore = 0
  for (const r of RESOURCES) {
    const rt = norm(r.repo).split(/[\/\-_.\s]+/)
    const overlap = tokens.filter((t) => rt.some((x) => x.includes(t))).length
    if (overlap > bestScore) {
      bestScore = overlap
      best = r
    }
  }
  if (best && bestScore > 0) return { resource: best, matched: 'fuzzy' }
  return { matched: 'none' }
}
