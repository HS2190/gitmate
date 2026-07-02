import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** 라우트 이동 시 스크롤을 맨 위로 되돌린다. */
export function ScrollToTop() {
  const { pathname, search } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname, search])
  return null
}
