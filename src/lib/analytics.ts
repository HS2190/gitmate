// ============================================================
// Google Analytics 4
// gtag 자체는 index.html의 공식 스니펫에서 부트스트랩한다.
// 여기서는 SPA(HashRouter) 라우트별 페이지뷰와 커스텀 이벤트만
// window.gtag 로 전송한다. (config에 send_page_view:false 설정)
// ============================================================

type GtagArgs = unknown[]

declare global {
  interface Window {
    dataLayer?: GtagArgs[]
    gtag?: (...args: GtagArgs) => void
  }
}

/** 라우트 변경 시 페이지뷰. path 예: "/recommend?role=..." (HashRouter 경로) */
export function trackPageview(path: string): void {
  if (typeof window === 'undefined' || !window.gtag) return
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  })
}

/** 커스텀 이벤트(방법 선택·실시간 분석 등). */
export function trackEvent(name: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined' || !window.gtag) return
  window.gtag('event', name, params ?? {})
}
