// ============================================================
// Google Analytics 4 — 경량 연동 (gtag)
//
// Measurement ID는 빌드 시 VITE_GA_ID 로 주입한다(공개값, 비밀 아님).
// 값이 없으면 모든 함수가 no-op → 개발/미설정 환경에서 안전.
//
// HashRouter(SPA)라 자동 page_view를 끄고, 라우트 변경 시 수동 전송한다.
// ============================================================

// 측정 ID(G-…)는 공개값이라 코드에 둬도 안전. Vercel 환경변수 VITE_GA_ID로 덮어쓸 수 있음.
const GA_ID = (import.meta.env.VITE_GA_ID ?? 'G-2LXH7JET3M').trim()

type GtagArgs = unknown[]

declare global {
  interface Window {
    dataLayer?: GtagArgs[]
    gtag?: (...args: GtagArgs) => void
  }
}

let ready = false

/** gtag.js 를 1회 주입하고 GA를 초기화한다. (ID 없으면 아무것도 안 함) */
export function initAnalytics(): void {
  if (ready || !GA_ID || typeof window === 'undefined') return
  ready = true

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag(...args: GtagArgs) {
    window.dataLayer!.push(args)
  }
  window.gtag('js', new Date())
  // SPA라 자동 페이지뷰 OFF — 라우트 변경 시 trackPageview로 직접 보낸다.
  window.gtag('config', GA_ID, { send_page_view: false })

  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(s)
}

/** 라우트 변경 시 가상 페이지뷰. path 예: "/recommend?role=..." */
export function trackPageview(path: string): void {
  if (!ready || !window.gtag) return
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  })
}

/** 커스텀 이벤트(방법 선택·실시간 분석 등). */
export function trackEvent(name: string, params?: Record<string, unknown>): void {
  if (!ready || !window.gtag) return
  window.gtag('event', name, params ?? {})
}
