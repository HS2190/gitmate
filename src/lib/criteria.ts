import type { Criteria } from './recommend'
import type { Role, Task, Purpose, Difficulty } from '../data/resources'

const KEY = 'gitmate.criteria'

/** Criteria -> URLSearchParams 문자열 */
export function criteriaToQuery(c: Criteria): string {
  const p = new URLSearchParams()
  if (c.role) p.set('role', c.role)
  if (c.tasks.length) p.set('tasks', c.tasks.join(','))
  if (c.purpose) p.set('purpose', c.purpose)
  if (c.difficulty) p.set('difficulty', c.difficulty)
  return p.toString()
}

/** URL 쿼리(우선) → 없으면 sessionStorage 에서 복원 */
export function readCriteria(search: string): Criteria {
  const p = new URLSearchParams(search)
  const fromUrl: Criteria = {
    role: (p.get('role') as Role) || undefined,
    tasks: (p.get('tasks')?.split(',').filter(Boolean) as Task[]) || [],
    purpose: (p.get('purpose') as Purpose) || undefined,
    difficulty: (p.get('difficulty') as Difficulty) || undefined,
  }
  const hasUrl =
    fromUrl.role || fromUrl.tasks.length || fromUrl.purpose || fromUrl.difficulty
  if (hasUrl) return fromUrl

  try {
    const raw = sessionStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as Criteria
  } catch {
    /* sessionStorage 접근 불가 환경 무시 */
  }
  return { tasks: [] }
}

export function saveCriteria(c: Criteria): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(c))
  } catch {
    /* 무시 */
  }
}
