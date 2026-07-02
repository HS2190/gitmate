# 깃메이트 (GitMate)

GitHub 자료를 **한국어 핵심 + 내 상황 기준 적용**까지 정리해, 다시 AI에 안 묻게 하는
포트폴리오용 인터랙티브 프로토타입.

**방법3(GitHub 주소 입력)만 실시간**이다. 아무 공개 GitHub repo 주소를 넣으면 실제
README를 GitHub API로 가져와 Claude(Haiku)로 한국어 요약·역할별 적용·막힘을 생성한다.
나머지(추천·키워드·유사 자료)는 사전 생성 캐시(`src/data/resources.ts`, 10개)를 그대로 쓴다.
**키가 없거나 실패하면 기존 캐시 매칭으로 우아하게 폴백**하므로, 키 없이도 앱 전체가 정상 동작한다.

## 기술 스택

- Vite + React 18 + TypeScript
- react-router-dom **HashRouter** (정적 배포 딥링크 대응)
- 외부 UI 라이브러리 없음 (자체 컴포넌트) · 아이콘은 이모지/인라인 SVG
- Pretendard(CDN) + 시스템 폰트 폴백
- 디자인 토큰: CSS 변수(`src/styles/tokens.css`)

## 실행

프론트만 (방법1·2·캐시 유사, 방법3은 폴백):

```bash
cd workspace/gitmate/engineer
npm install
npm run dev        # 프론트 개발 서버 (기본 http://localhost:5173)
```

방법3 실시간 분석까지 로컬 테스트하려면 **두 개를 동시에** 띄운다:

```bash
npm run dev        # 터미널 1 — 프론트 (vite dev 프록시가 /api → :8787 로 전달)
npm run dev:api    # 터미널 2 — 로컬 함수 서버 (Node http, :8787, .env.local 읽음)
```

- `.env.local` 에 `ANTHROPIC_API_KEY` 가 있으면 → 방법3에서 실제 요약이 나온다.
- 키가 없으면 → 방법3은 `no_key` 폴백으로 캐시 매칭 화면을 보여준다(앱은 정상).

```bash
cp .env.local.example .env.local   # 값 채우기 (키는 커밋되지 않음)
```

프로덕션 빌드/미리보기:

```bash
npm run build      # tsc + vite build (에러 0으로 통과)
npm run api:check  # 서버리스 함수(api/) 타입 체크 (tsconfig.api.json)
npm run preview    # 빌드 결과 미리보기
```

## 방법3 실시간 플로우

```
온보딩 방법3 입력 → /analyze?url=..&role=..&purpose=..
   → 로딩 스켈레톤 (스피너 + "AI가 실제 README를 읽고 정리 중")
   → POST /api/analyze
        1) url → owner/repo 파싱
        2) GitHub 공개 API: repo 메타(description·stars·topics) + README(base64 디코드)
        3) README 정제(배지·HTML·이미지 제거) + 8,000자 컷
        4) Claude Messages API(fetch 직접 호출) → JSON(요약·적용·막힘·태그)
   → 성공: ResourceDetail 레이아웃 재사용 + "⚡ 실시간 분석" 뱃지
   → 실패/폴백: 안내 배너 + "비슷한 캐시 자료로 보기"(→ /similar/lookup)
```

클라이언트는 같은 세션의 동일 `(url, role, purpose)` 재조회를 `sessionStorage` 캐시로
처리해 서버(그리고 Claude)를 다시 부르지 않는다.

## 비용 방어 (다층)

1. **IP당 하루 5회** 제한 (`x-real-ip` 기준 — `x-forwarded-for` 첫 값은 위조 가능해 미사용).
2. **전체 하루 총량 200회** 상한.
3. **결과 캐싱** — 키 `owner/repo@role@purpose`. 같은 요청은 저장 결과 재사용(Claude 재호출 0).
4. 저장소: `KV_REST_API_URL`/`KV_REST_API_TOKEN`(Upstash 등)이 있으면 그걸,
   없으면 **모듈 레벨 Map**(웜 인스턴스 내 best-effort — 콜드스타트 시 초기화됨).
5. 제한 초과·키 없음·파싱 실패·네트워크 오류 → 명확한 상태코드 + `{fallback:true, reason}` →
   프론트가 캐시 매칭으로 전환.

> ⚠️ 모듈 레벨 Map 은 서버리스 인스턴스가 바뀌면 초기화될 수 있어 하드 캡이 아니다.
> **진짜 지출 상한은 [Anthropic 콘솔의 월 지출 상한](https://console.anthropic.com/)에서 설정**하는 것을 권장한다.

## 환경변수

`.env.local.example` 참고. 키는 코드에 하드코딩 금지, `.gitignore` 로 `.env*` 제외.

| 변수 | 필수 | 설명 |
|------|------|------|
| `ANTHROPIC_API_KEY` | ✅(실시간용) | 없으면 방법3은 폴백으로 동작 |
| `ANTHROPIC_MODEL` | | 기본 `claude-haiku-4-5`(빠름·저렴). 깊이 필요 시 `claude-sonnet-4-6` |
| `GITHUB_TOKEN` | | 넣으면 GitHub API rate limit ↑ (없어도 동작) |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | | 넣으면 캐시·rate-limit 이 인스턴스 넘어 공유 |

## Vercel 배포

1. Vercel 에 이 폴더(repo)를 연결한다. `api/` 폴더가 서버리스 함수로 자동 인식되고,
   정적 프론트(`dist`)와 함께 배포된다(`vercel.json` 참고).
2. Vercel 대시보드 → Settings → Environment Variables 에 `ANTHROPIC_API_KEY`
   (필요시 `ANTHROPIC_MODEL`, `GITHUB_TOKEN`)를 넣는다.
3. 배포한다. 방법3이 실시간으로 동작한다(키 없이 배포해도 앱은 폴백으로 정상 동작).
4. **Anthropic 콘솔에서 월 지출 상한을 설정**해 비용을 하드 캡으로 방어할 것을 권장한다.

> 정적 배포(GitHub Pages 등)만 할 경우 서버리스 함수가 없으므로 방법3은 항상 폴백이다.

## 라우트 (HashRouter)

| 경로 | 화면 |
|------|------|
| `/` | 온보딩 — 세 가지 진입(역할·상황 추천 / 키워드 / GitHub 주소) |
| `/recommend?role=..&tasks=..` | 방법1 추천 리스트 (새로고침으로 재추천) |
| `/search?q=..` | 방법2 키워드 검색 결과 (빈 상태 포함) |
| `/resource/:id` | 자료 정리 — 한국어 요약 + 역할별 적용 + 막힘 + GitHub 링크 |
| `/analyze?url=..&role=..&purpose=..` | **방법3 실시간 분석** — 실제 README를 읽어 AI가 정리(폴백 시 캐시 매칭 유도) |
| `/similar/:id` | 유사 큐레이션 |
| `/similar/lookup?url=..` | 방법3 폴백 목적지 — GitHub 주소 캐시 매칭(정확/유사) → 정리 + 유사 자료 |

## 정적 배포 (GitHub Pages 등)

`vite.config.ts`의 `base: './'` + HashRouter 조합으로 하위 경로 호스팅에서도
에셋·딥링크가 깨지지 않는다. `npm run build` 후 `dist/`를 그대로 정적 호스팅에 올리면 된다.
(GitHub Pages: `dist`를 gh-pages 브랜치로 배포하거나 Actions로 업로드.)

## 구조

```
src/
  data/        resources.ts (캐시 자료 10개), options.ts (온보딩 선택지)
  lib/         recommend.ts (추천·검색·URL매칭), criteria.ts (세션/URL 유지),
               analyzeClient.ts (방법3 실시간 호출 + sessionStorage 캐시)
  components/   TopBar, Chip, Button, MatchBadge, ResourceCard, ScrollToTop
  pages/        Onboarding, Recommend, Search, ResourceDetail, Similar, Analyze
  styles/       tokens.css, global.css
api/
  analyze.ts       Vercel 서버리스 핸들러 (POST /api/analyze)
  _lib/core.ts     순수 분석 로직 (핸들러·로컬 서버가 공유)
scripts/
  dev-api.mjs      로컬 함수 서버 (:8787, .env.local 읽음, 동일 core 사용)
vercel.json        Vercel 배포 설정
.env.local.example 환경변수 예시
```

## 검증 범위 (정직 고지)

- ✅ **라이브 배포·실호출 검증**: Vercel 배포 후 실제 `ANTHROPIC_API_KEY`로 방법3을
  end-to-end 확인 — 아무 공개 repo 주소(whisper·excalidraw·tldraw·lucide 등)를 넣으면
  실제 README 기반 한국어 요약·역할별 적용·막힘이 생성됨(라이선스 등 실무 함정 포착 포함).
- ✅ **폴백 경로 전부 검증**: 키 없음(`no_key`), 잘못된 주소(`bad_url`), 존재하지 않는
  repo(`repo_not_found`), IP 하루 5회 초과(`rate_limited_ip`), 파싱 실패(`parse_failed`).
- ✅ **GitHub 수집 실검증**: repo 메타·README fetch 는 실제 GitHub API 로 동작 확인.
- ✅ **프론트 렌더 확인**: 온보딩·로딩·폴백·실시간 결과 화면을 헤드리스 브라우저로 캡처, 콘솔 앱 에러 0.
- ⚠️ **효과 지표는 가설**: "되묻기 0·이탈 감소"는 실사용 데이터로 검증되지 않은 추정이다
  (관찰·해석·추정을 분리해 과장 없이 설계).
