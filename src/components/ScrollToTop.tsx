import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPageview } from '../lib/analytics'
import { routeTitle } from '../lib/pageTitle'

/**
 * 라우트 이동 시 스크롤을 맨 위로 되돌리고, 문서 제목을 갱신한 뒤
 * GA 가상 페이지뷰를 보낸다.
 *
 * 제목 갱신이 trackPageview보다 먼저여야 GA에 현재 페이지 제목이 실린다.
 */
export function ScrollToTop() {
  const { pathname, search } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = routeTitle(pathname, search)
    trackPageview(pathname + search)
  }, [pathname, search])
  return null
}
