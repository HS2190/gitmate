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

/**
 * 해시 라우트를 해시 없는 정규 URL로 합성한다.
 *   "/recommend?role=x" → "https://호스트/recommend?role=x"
 *
 * GA4는 pagePath를 page_location에서 해시를 떼고 만든다. HashRouter의 실제
 * URL은 "https://호스트/#/recommend" 라서 해시를 떼면 무조건 "/"가 된다.
 * 실제 경로를 담은 URL을 직접 만들어 넘겨야 자동 이벤트까지 경로가 맞는다.
 */
function canonicalUrl(path: string): string {
  return `${window.location.origin}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * 라우트 변경 시 페이지뷰. path 예: "/recommend?role=..." (HashRouter 경로)
 *
 * page_path를 page_view 이벤트에만 실으면 안 된다. 그렇게 하면 page_view만
 * 올바른 경로로 집계되고, user_engagement·scroll 같은 자동 이벤트는 계속
 * 실제 URL(해시 제거 → "/")로 들어가 한 페이지가 GA에서 두 행으로 쪼개진다.
 * 체류시간이 전부 "/"에 몰려 페이지별 인게이지먼트를 읽을 수 없게 된다.
 *
 * gtag('set')은 이후 전송되는 모든 이벤트의 기본값을 바꾸므로,
 * 라우트가 바뀔 때마다 기본값 자체를 갈아끼운 뒤 page_view를 보낸다.
 */
export function trackPageview(path: string): void {
  if (typeof window === 'undefined' || !window.gtag) return
  window.gtag('set', {
    page_path: path,
    page_location: canonicalUrl(path),
    page_title: document.title,
  })
  window.gtag('event', 'page_view')
}

/** 커스텀 이벤트(방법 선택·실시간 분석 등). */
export function trackEvent(name: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined' || !window.gtag) return
  window.gtag('event', name, params ?? {})
}
