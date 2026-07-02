// ============================================================
// 로컬 테스트용 최소 API 서버 (Node http, 기본 포트 8787)
// 동일한 core.ts 로직을 /api/analyze 에 마운트한다.
// .env.local 을 직접 읽는다(dotenv 의존 없이 최소 파서).
//
// 실행:  npm run dev:api
// 프론트(npm run dev)와 동시에 띄우면 vite dev 프록시가
// /api → http://localhost:8787 로 넘겨준다.
//
// 키가 없어도 기동된다. 그 경우 /api/analyze 는 no_key 폴백을 반환하고,
// 프론트는 캐시 매칭 화면으로 우아하게 전환한다.
// ============================================================

import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const PORT = Number(process.env.DEV_API_PORT) || 8787

// --- .env.local 최소 파서 (dotenv 대체) ---
function loadEnvLocal() {
  const p = path.join(ROOT, '.env.local')
  if (!fs.existsSync(p)) return
  const text = fs.readFileSync(p, 'utf-8')
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let val = trimmed.slice(eq + 1).trim()
    // 양쪽 따옴표 제거
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    if (!(key in process.env)) process.env[key] = val
  }
}

loadEnvLocal()

// core.ts 를 직접 import (Node 24 타입 스트리핑)
const { analyze, FALLBACK_STATUS } = await import('../api/_lib/core.ts')

function firstIp(xff) {
  if (!xff) return '127.0.0.1'
  return String(xff).split(',')[0].trim() || '127.0.0.1'
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = ''
    req.on('data', (c) => (data += c))
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {})
      } catch {
        resolve({})
      }
    })
    req.on('error', () => resolve({}))
  })
}

const server = http.createServer(async (req, res) => {
  const send = (code, obj) => {
    res.writeHead(code, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    })
    res.end(JSON.stringify(obj))
  }

  const url = new URL(req.url, `http://localhost:${PORT}`)
  if (url.pathname !== '/api/analyze') {
    send(404, { error: 'Not Found' })
    return
  }
  if (req.method !== 'POST') {
    send(405, { error: 'Method Not Allowed' })
    return
  }

  const body = await readBody(req)
  const input = {
    url: typeof body.url === 'string' ? body.url : '',
    role: typeof body.role === 'string' ? body.role : undefined,
    purpose: typeof body.purpose === 'string' ? body.purpose : undefined,
    ip: firstIp(req.headers['x-forwarded-for']),
    env: {
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
      ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL,
      GITHUB_TOKEN: process.env.GITHUB_TOKEN,
      KV_REST_API_URL: process.env.KV_REST_API_URL,
      KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
    },
  }

  if (!input.url) {
    send(400, { fallback: true, reason: 'bad_url', message: 'url 이 필요해요.' })
    return
  }

  try {
    const result = await analyze(input)
    if ('fallback' in result) {
      send(FALLBACK_STATUS[result.reason], result)
    } else {
      send(200, result)
    }
  } catch (err) {
    send(502, {
      fallback: true,
      reason: 'network_error',
      message: '분석 중 오류가 발생했어요.',
    })
    console.error('[dev-api] error:', err)
  }
})

server.listen(PORT, () => {
  const hasKey = Boolean(process.env.ANTHROPIC_API_KEY)
  console.log(`[dev-api] http://localhost:${PORT}/api/analyze (POST)`)
  console.log(
    hasKey
      ? `[dev-api] ANTHROPIC_API_KEY 감지됨 — 실시간 분석 활성 (model: ${
          process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001'
        })`
      : '[dev-api] ANTHROPIC_API_KEY 없음 — 방법3은 폴백(no_key)으로 동작합니다.',
  )
})
