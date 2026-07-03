import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPageview } from '../lib/analytics'

/** 라우트 이동 시 스크롤을 맨 위로 되돌리고, GA 가상 페이지뷰를 보낸다. */
export function ScrollToTop() {
  const { pathname, search } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
    trackPageview(pathname + search)
  }, [pathname, search])
  return null
}
