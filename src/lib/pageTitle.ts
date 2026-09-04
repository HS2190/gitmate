import { getResource } from '../data/resources'

const BRAND = '깃메이트'
export const DEFAULT_TITLE = '깃메이트 · GitHub 자료를 나에게 맞게'

/**
 * 라우트 → 문서 제목.
 *
 * 페이지 컴포넌트 각자가 document.title을 세팅하지 않고 여기서 한 번에 만든다.
 * 제목을 쓰는 쪽(ScrollToTop의 GA 페이지뷰)이 <Routes>의 형제라서 페이지
 * 컴포넌트보다 effect가 먼저 돈다 — 각 페이지에서 세팅하면 GA가 직전 페이지
 * 제목을 실어 보내게 된다. 경로에서 제목을 유도하면 그 순서 문제가 없어진다.
 */
export function routeTitle(pathname: string, search: string): string {
  const params = new URLSearchParams(search)

  if (pathname === '/') return DEFAULT_TITLE
  if (pathname === '/recommend') return `맞춤 추천 · ${BRAND}`
  if (pathname === '/analyze') return `실시간 분석 · ${BRAND}`

  if (pathname === '/search') {
    const q = params.get('q')?.trim()
    return q ? `“${q}” 검색 결과 · ${BRAND}` : `검색 · ${BRAND}`
  }

  const resourceMatch = pathname.match(/^\/resource\/(.+)$/)
  if (resourceMatch) {
    const r = getResource(decodeURIComponent(resourceMatch[1]))
    return r ? `${r.name} · ${BRAND}` : `자료 · ${BRAND}`
  }

  const similarMatch = pathname.match(/^\/similar\/(.+)$/)
  if (similarMatch) {
    const id = decodeURIComponent(similarMatch[1])
    if (id === 'lookup') return `비슷한 자료 · ${BRAND}`
    const r = getResource(id)
    return r ? `${r.name}과 비슷한 자료 · ${BRAND}` : `비슷한 자료 · ${BRAND}`
  }

  return DEFAULT_TITLE
}
