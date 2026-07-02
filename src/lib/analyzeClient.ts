// ============================================================
// 방법3 실시간 분석 — 프론트 클라이언트
// /api/analyze 를 호출하고, 같은 세션의 재조회는 sessionStorage 캐시로
// 처리해 서버(그리고 Claude)를 다시 부르지 않는다.
// 서버가 폴백을 반환하거나 네트워크가 실패하면 fallback 결과를 돌려주고,
// 호출부(Analyze 페이지)가 캐시 유사 매칭으로 전환한다.
// ============================================================

import type { Role, Purpose } from '../data/resources'

/** 서버 core.ts 의 AnalyzeResult 와 대응하는 프론트 타입 */
export interface LiveResult {
  live: true
  slug: string
  name: string
  repo: string
  descEn: string
  stars: number
  topics: string[]
  role: string
  purpose: string
  content: {
    summaryKo: string[]
    applySteps: string[]
    pitfall: string
    tags: string[]
  }
  model: string
  cached: boolean
}

export interface LiveFallback {
  fallback: true
  reason: string
  message: string
  slug?: string
}

export type LiveResponse = LiveResult | LiveFallback

function cacheKey(url: string, role: string, purpose: string): string {
  return `gm.live:${url.trim().toLowerCase()}@${role}@${purpose}`
}

function readSession(key: string): LiveResult | null {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as LiveResult
  } catch {
    return null
  }
}

function writeSession(key: string, value: LiveResult): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* sessionStorage 접근 불가 환경 무시 */
  }
}

/**
 * 실시간 분석 요청. 같은 세션에서 동일 (url, role, purpose)면 캐시를 쓴다.
 * 항상 LiveResponse 를 반환(throw 하지 않음) — 실패도 fallback 으로 표현.
 */
export async function requestAnalyze(
  url: string,
  role: Role,
  purpose: Purpose | undefined,
): Promise<LiveResponse> {
  const purposeStr = purpose ?? '학습·탐색'
  const key = cacheKey(url, role, purposeStr)

  const cached = readSession(key)
  if (cached) return { ...cached, cached: true }

  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, role, purpose: purposeStr }),
    })
    const data = (await res.json()) as LiveResponse
    if ('live' in data && data.live) {
      writeSession(key, data)
      return data
    }
    // 서버가 폴백을 반환 (no_key / rate_limited / repo_not_found ...)
    return data as LiveFallback
  } catch {
    // 네트워크 실패(로컬에서 dev:api 미기동 등) → 폴백
    return {
      fallback: true,
      reason: 'network_error',
      message: '실시간 분석 서버에 연결하지 못했어요.',
    }
  }
}
