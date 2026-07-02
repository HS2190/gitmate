// ============================================================
// Vercel 서버리스 핸들러 — POST /api/analyze
// core.ts 의 analyze() 를 감싼다. env 는 process.env 에서 주입.
// 응답 규칙:
//   - 성공(live): 200 + AnalyzeResult
//   - 폴백: FALLBACK_STATUS 의 코드 + { fallback:true, reason, message }
//     → 프론트가 이 코드/reason 을 보고 캐시 매칭으로 전환한다.
// ============================================================

import { analyze, FALLBACK_STATUS, type AnalyzeEnv } from './_lib/core.js'

// Vercel Node 런타임 최소 시그니처 (외부 타입 의존 없이 구조만 맞춘다)
interface VercelReq {
  method?: string
  body?: unknown
  headers: Record<string, string | string[] | undefined>
}
interface VercelRes {
  status(code: number): VercelRes
  setHeader(name: string, value: string): void
  json(body: unknown): void
  end(): void
}

function headerVal(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v
}

/**
 * 신뢰 가능한 클라이언트 IP.
 * x-forwarded-for 의 "첫 값"은 클라이언트가 위조할 수 있으므로(뒤에 실제 IP가
 * 덧붙는 구조) 쓰지 않는다. Vercel 이 채워 주는 x-real-ip 를 우선하고,
 * 없으면 x-forwarded-for 의 "마지막" 값(플랫폼이 붙인 실제 IP)을 쓴다.
 */
function clientIp(req: VercelReq): string {
  const real = headerVal(req.headers['x-real-ip'])
  if (real && real.trim()) return real.trim()
  const raw = headerVal(req.headers['x-forwarded-for'])
  if (!raw) return 'unknown'
  const parts = raw.split(',').map((s) => s.trim()).filter(Boolean)
  return parts.length ? parts[parts.length - 1] : 'unknown'
}

async function readJsonBody(req: VercelReq): Promise<Record<string, unknown>> {
  // Vercel 은 보통 body 를 파싱해 준다. 문자열/미파싱 케이스도 방어.
  if (req.body && typeof req.body === 'object') {
    return req.body as Record<string, unknown>
  }
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body) as Record<string, unknown>
    } catch {
      return {}
    }
  }
  return {}
}

export default async function handler(req: VercelReq, res: VercelRes) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method Not Allowed' })
      return
    }

    const body = await readJsonBody(req)
    const url = typeof body.url === 'string' ? body.url : ''
    const role = typeof body.role === 'string' ? body.role : undefined
    const purpose = typeof body.purpose === 'string' ? body.purpose : undefined

    if (!url) {
      res.status(400).json({
        fallback: true,
        reason: 'bad_url',
        message: 'url 이 필요해요.',
      })
      return
    }

    const env: AnalyzeEnv = {
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
      ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL,
      GITHUB_TOKEN: process.env.GITHUB_TOKEN,
      KV_REST_API_URL: process.env.KV_REST_API_URL,
      KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
    }

    const result = await analyze({ url, role, purpose, ip: clientIp(req), env })

    res.setHeader('Cache-Control', 'no-store')
    if ('fallback' in result) {
      res.status(FALLBACK_STATUS[result.reason]).json(result)
      return
    }
    res.status(200).json(result)
  } catch {
    // analyze() 는 무예외 설계지만, 만일의 예외도 생 500 대신 폴백 JSON 으로.
    res.setHeader('Cache-Control', 'no-store')
    res.status(502).json({
      fallback: true,
      reason: 'network_error',
      message: '분석 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.',
    })
  }
}
