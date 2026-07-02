// ============================================================
// 깃메이트 데이터 (하이브리드 · 사전 생성 캐시)
// 실제 GitHub 공개 API로 각 repo의 설명·stars·topics·README를 수집하고,
// 그 실제 내용을 근거로 한국어 요약·역할별 적용을 사전 생성해 캐시했다.
// → 배포 후 실시간 API 호출 0 (비용·키 노출 없음), 내용은 실제 자료 기반.
// 수집 기준: 2026-07 (stars는 근사치).
// ============================================================

export type Role = '디자이너' | '기획자' | '개발자' | '기타'
export type Task =
  | '리서치·정리'
  | '이미지·무드보드'
  | '프로토타입'
  | '반복작업 자동화'
  | '자막·문서 변환'
export type Purpose = '학습·탐색' | '실무 적용' | '도입 검토'
export type Difficulty = '설치 없이 웹에서' | '앱 설치 OK' | '코드 조금 OK'

export interface Resource {
  id: string
  name: string // 표시명 (예: "openai / whisper")
  repo: string // 실제 github url
  lang: '영어'
  /** 실제 GitHub 별(stars) 수 (근사) */
  stars: number
  /** 실제 GitHub description (영어 원문) */
  descEn: string
  tags: string[]
  tasks: Task[]
  roles: Role[]
  difficulty: Difficulty
  /** 한눈에 · 한국어 핵심 요약 3줄 (실제 README 기반 사전 생성) */
  summaryKo: string[]
  /** 역할별 "나에게 적용하면" 단계 (2개) */
  applyByRole: Record<Role, string[]>
  /** 여기서 막힐 수 있어요 (한 줄) */
  pitfall: string
  /** 유사 자료 id */
  relatedIds: string[]
}

export const RESOURCES: Resource[] = [
  {
    id: 'whisper',
    name: 'openai / whisper',
    repo: 'https://github.com/openai/whisper',
    lang: '영어',
    stars: 104000,
    descEn: 'Robust Speech Recognition via Large-Scale Weak Supervision',
    tags: ['음성인식', '자막', '받아쓰기', 'AI 모델'],
    tasks: ['자막·문서 변환'],
    roles: ['디자이너', '기획자', '개발자', '기타'],
    difficulty: '코드 조금 OK',
    summaryKo: [
      '말소리(음성·영상)를 글자로 바꿔주는 OpenAI의 범용 음성 인식 모델이에요.',
      '여러 언어를 알아듣고, 다른 언어로 번역하거나 언어를 자동 판별하는 것도 돼요.',
      '무료로 내 컴퓨터에서 돌릴 수 있어 회의·인터뷰 녹음 정리에 좋아요.',
    ],
    applyByRole: {
      디자이너: [
        '사용자 인터뷰 녹음을 텍스트로 받아 인사이트 정리 시간을 줄이세요.',
        '영상 시안의 내레이션을 자막으로 뽑아 리뷰 문서에 붙이면 공유가 쉬워요.',
      ],
      기획자: [
        '회의·유저 인터뷰 녹음을 자동 전사해 회의록 초안으로 씁니다.',
        '해외 유튜브 리뷰 영상을 텍스트로 바꿔 키워드를 빠르게 훑으세요.',
      ],
      개발자: [
        'pip 설치 후 `whisper audio.mp3 --language Korean` 한 줄로 전사합니다.',
        'SRT·JSON 출력을 파이프라인에 넣어 자막 자동화로 확장하세요.',
      ],
      기타: [
        '강의·회의 녹음을 검색 가능한 글 기록으로 남기세요.',
        '설치가 부담되면 더 가벼운 faster-whisper부터 보세요.',
      ],
    },
    pitfall:
      '내 컴퓨터에서 직접 돌리려면 파이썬 설치가 필요해요. 긴 영상은 오래 걸리니 짧게 잘라 시작해 보세요.',
    relatedIds: ['faster-whisper', 'whisperx'],
  },
  {
    id: 'faster-whisper',
    name: 'SYSTRAN / faster-whisper',
    repo: 'https://github.com/SYSTRAN/faster-whisper',
    lang: '영어',
    stars: 24000,
    descEn: 'Faster Whisper transcription with CTranslate2',
    tags: ['음성인식', '자막', '빠름', '가벼움'],
    tasks: ['자막·문서 변환', '반복작업 자동화'],
    roles: ['디자이너', '기획자', '개발자', '기타'],
    difficulty: '코드 조금 OK',
    summaryKo: [
      'Whisper를 다시 구현해 같은 정확도로 최대 4배 빠르게 돌리는 버전이에요.',
      '메모리도 덜 쓰고, 8비트 최적화로 CPU에서도 더 가볍게 동작해요.',
      '긴 녹음·많은 파일을 자막으로 바꿀 때 시간을 크게 아껴줍니다.',
    ],
    applyByRole: {
      디자이너: [
        '인터뷰 녹음이 많을 때 원본 Whisper보다 빠르게 한 번에 전사하세요.',
        '전사 결과를 문서에 붙여 사용자 발화 인용을 빠르게 찾으세요.',
      ],
      기획자: [
        '회의 녹음 여러 개를 빠르게 전사해 회의록을 일괄 정리합니다.',
        '가벼워서 노트북에서도 돌릴 만해, 자리에서 바로 처리할 수 있어요.',
      ],
      개발자: [
        '`pip install faster-whisper` 후 몇 줄로 배치 전사 스크립트를 만드세요.',
        'GPU 8비트 양자화로 대량 처리 속도·비용을 낮추세요.',
      ],
      기타: [
        '원본 Whisper가 느리게 느껴지면 이걸로 갈아타 보세요.',
        '음성 받아쓰기를 처음 시작한다면 가볍고 빠른 이쪽이 무난해요.',
      ],
    },
    pitfall:
      '여전히 파이썬 설치가 필요해요. 처음이면 openai/whisper보다 빠르고 가벼워 시작점으로 좋아요.',
    relatedIds: ['whisper', 'whisperx'],
  },
  {
    id: 'whisperx',
    name: 'm-bain / whisperX',
    repo: 'https://github.com/m-bain/whisperX',
    lang: '영어',
    stars: 23000,
    descEn:
      'Automatic Speech Recognition with Word-level Timestamps (& Diarization)',
    tags: ['음성인식', '화자분리', '자막', '타임스탬프'],
    tasks: ['자막·문서 변환'],
    roles: ['디자이너', '기획자', '개발자', '기타'],
    difficulty: '코드 조금 OK',
    summaryKo: [
      'Whisper에 단어 단위 타임스탬프와 화자 분리(누가 말했는지)를 더한 버전이에요.',
      'large-v2 기준 실시간의 70배 속도로 빠르게 전사해요.',
      '여러 명이 대화하는 회의·인터뷰를 “누가 언제 말했는지”까지 정리할 수 있어요.',
    ],
    applyByRole: {
      디자이너: [
        'FGI·다자 인터뷰 녹음에서 참가자별 발언을 나눠 인용문을 찾으세요.',
        '발언자·시간이 붙은 자막으로 사용성 테스트 영상을 정리하세요.',
      ],
      기획자: [
        '회의록을 발언자별로 정리해 “누가 무엇을 요청했는지” 추적하세요.',
        '인터뷰를 화자별로 나눠 요약하면 정리 품질이 올라가요.',
      ],
      개발자: [
        '단어 타임스탬프로 정밀 자막을 만들거나 자막 편집 툴에 연동하세요.',
        '화자 분리 결과를 회의 요약 파이프라인에 붙이세요.',
      ],
      기타: [
        '여러 명 대화 녹음을 화자별로 나눠 기록하고 싶을 때 쓰세요.',
        '단순 받아쓰기면 whisper/faster-whisper가 더 간단해요.',
      ],
    },
    pitfall:
      '설치·설정이 Whisper보다 조금 더 복잡해요. 화자 분리는 별도 모델 동의(토큰)가 필요할 수 있어요.',
    relatedIds: ['whisper', 'faster-whisper'],
  },
  {
    id: 'excalidraw',
    name: 'excalidraw / excalidraw',
    repo: 'https://github.com/excalidraw/excalidraw',
    lang: '영어',
    stars: 127000,
    descEn: 'Virtual whiteboard for sketching hand-drawn like diagrams',
    tags: ['화이트보드', '다이어그램', '와이어프레임', '협업'],
    tasks: ['프로토타입', '리서치·정리'],
    roles: ['디자이너', '기획자', '개발자', '기타'],
    difficulty: '설치 없이 웹에서',
    summaryKo: [
      '손으로 그린 듯한 다이어그램·와이어프레임을 그리는 무료 온라인 화이트보드예요.',
      '설치 없이 브라우저에서 바로 쓰고, 실시간 협업 + 종단간 암호화를 지원해요.',
      'PNG·SVG로 내보내고 .excalidraw 파일로 저장돼 공유가 편해요.',
    ],
    applyByRole: {
      디자이너: [
        '아이디어 스케치·플로우·와이어프레임을 빠르게 그려 팀과 공유하세요.',
        '손그림 스타일이라 “아직 확정 아님” 뉘앙스를 주기 좋아요.',
      ],
      기획자: [
        '서비스 플로우·정보구조(IA)를 그려 회의에서 함께 편집하세요.',
        '설치가 필요 없어 누구나 링크로 바로 참여할 수 있어요.',
      ],
      개발자: [
        '아키텍처·시퀀스 다이어그램을 빠르게 그려 문서에 붙이세요.',
        'npm 패키지로 내 앱에 화이트보드를 임베드할 수도 있어요.',
      ],
      기타: [
        '브레인스토밍·마인드맵을 설치 없이 바로 그려보세요.',
        '결과를 이미지로 내보내 문서·발표에 붙이기 쉬워요.',
      ],
    },
    pitfall:
      '거의 없어요 — 브라우저에서 바로 됩니다. 팀 클라우드 저장·고급 협업은 Excalidraw+ 유료 기능이에요.',
    relatedIds: ['shadcn-ui', 'comfyui'],
  },
  {
    id: 'sd-webui',
    name: 'AUTOMATIC1111 / stable-diffusion-webui',
    repo: 'https://github.com/AUTOMATIC1111/stable-diffusion-webui',
    lang: '영어',
    stars: 164000,
    descEn: 'Stable Diffusion web UI',
    tags: ['이미지생성', 'AI 아트', 'txt2img', 'img2img'],
    tasks: ['이미지·무드보드'],
    roles: ['디자이너', '기획자', '개발자', '기타'],
    difficulty: '코드 조금 OK',
    summaryKo: [
      '글(프롬프트)로 이미지를 만들어주는 Stable Diffusion을 웹 화면으로 쓰는 도구예요.',
      'txt2img·img2img·인페인팅·업스케일 등 이미지 생성 기능이 폭넓게 들어 있어요.',
      '내 컴퓨터(GPU)에서 무료로 돌려 레퍼런스·무드보드 이미지를 뽑을 수 있어요.',
    ],
    applyByRole: {
      디자이너: [
        '무드보드·레퍼런스 이미지를 프롬프트로 대량 생성하세요.',
        '기존 시안을 img2img로 변형해 스타일 탐색을 빠르게 하세요.',
      ],
      기획자: [
        '기획서에 넣을 컨셉 이미지를 빠르게 만들어 설득력을 높이세요.',
        '아이디어를 시각화해 초기 논의를 구체화하세요.',
      ],
      개발자: [
        'API·확장으로 이미지 생성 파이프라인을 자동화하세요.',
        '모델·설정을 바꿔가며 결과를 배치로 비교하세요.',
      ],
      기타: [
        '아이디어 이미지를 무료로 만들어보고 싶을 때 쓰세요.',
        '설치가 부담되면 데스크톱 앱형 ComfyUI를 먼저 보세요.',
      ],
    },
    pitfall:
      '파이썬·git 설치가 필요하고, 원활하려면 그래픽카드(GPU)가 있어야 해요. 설치가 부담되면 ComfyUI 앱이나 웹 서비스를 보세요.',
    relatedIds: ['comfyui', 'excalidraw'],
  },
  {
    id: 'comfyui',
    name: 'ComfyUI',
    repo: 'https://github.com/comfyanonymous/ComfyUI',
    lang: '영어',
    stars: 119000,
    descEn:
      'The most powerful and modular diffusion model GUI with a graph/nodes interface',
    tags: ['이미지생성', '노드', '워크플로', '모듈러'],
    tasks: ['이미지·무드보드', '반복작업 자동화'],
    roles: ['디자이너', '기획자', '개발자', '기타'],
    difficulty: '앱 설치 OK',
    summaryKo: [
      '이미지 생성 AI를 블록(노드)을 연결하듯 조립해 쓰는 강력한 GUI예요.',
      '생성 과정을 시각적으로 구성해, 원하는 워크플로를 세밀하게 제어할 수 있어요.',
      '복잡하지만 자유도가 높아 반복 가능한 이미지 파이프라인을 만들기 좋아요.',
    ],
    applyByRole: {
      디자이너: [
        '반복되는 이미지 생성 과정을 노드로 저장해 매번 재사용하세요.',
        '정해진 스타일을 워크플로로 굳혀 결과의 일관성을 높이세요.',
      ],
      기획자: [
        '팀의 이미지 생성 방식을 워크플로로 표준화해 공유하세요.',
        '누가 해도 같은 결과가 나오게 과정을 문서처럼 남기세요.',
      ],
      개발자: [
        '노드·API로 이미지 생성 자동화 파이프라인을 구축하세요.',
        '커스텀 노드로 나만의 생성 단계를 확장하세요.',
      ],
      기타: [
        '정해진 스타일로 이미지를 반복 생산해야 할 때 유리해요.',
        '한 장만 뽑을 거면 더 단순한 도구가 편할 수 있어요.',
      ],
    },
    pitfall:
      '노드 개념이 처음엔 낯설어요. 데스크톱 앱 설치본이 있어 예전보다 시작이 쉬워졌어요.',
    relatedIds: ['sd-webui', 'excalidraw'],
  },
  {
    id: 'shadcn-ui',
    name: 'shadcn / ui',
    repo: 'https://github.com/shadcn-ui/ui',
    lang: '영어',
    stars: 118000,
    descEn:
      'A set of beautifully-designed, accessible components you can copy into your app',
    tags: ['UI 컴포넌트', 'React', 'Tailwind', '디자인시스템'],
    tasks: ['프로토타입'],
    roles: ['디자이너', '기획자', '개발자', '기타'],
    difficulty: '코드 조금 OK',
    summaryKo: [
      '복사해서 내 프로젝트에 붙여 쓰는, 잘 디자인된 접근성 좋은 UI 컴포넌트 모음이에요.',
      '라이브러리로 “설치”하는 게 아니라 코드를 내 것으로 가져와 자유롭게 고쳐 써요.',
      'React·Tailwind 기반이라 프로토타입·실서비스 화면을 빠르게 만들 수 있어요.',
    ],
    applyByRole: {
      디자이너: [
        '컴포넌트의 실제 동작·상태를 참고해 디자인 스펙을 잡으세요.',
        '개발자와 같은 컴포넌트를 보며 핸드오프 간극을 줄이세요.',
      ],
      기획자: [
        '실제 동작하는 컴포넌트로 빠르게 프로토타입 화면을 확인하세요.',
        '어떤 UI 요소가 표준적인지 감을 잡는 레퍼런스로 쓰세요.',
      ],
      개발자: [
        '필요한 컴포넌트 코드를 복사해 프로젝트에 맞게 커스텀하세요.',
        '접근성이 이미 반영돼 있어 기본기를 빠르게 갖출 수 있어요.',
      ],
      기타: [
        '웹 화면 구성요소가 어떻게 생겼는지 둘러보기 좋아요.',
        '구경만 하려면 공식 문서 사이트에서 바로 볼 수 있어요.',
      ],
    },
    pitfall:
      '실제로 쓰려면 React/Tailwind 프로젝트가 있어야 해요. 구경만 하려면 공식 문서 사이트에서 바로 볼 수 있어요.',
    relatedIds: ['excalidraw', 'n8n'],
  },
  {
    id: 'n8n',
    name: 'n8n-io / n8n',
    repo: 'https://github.com/n8n-io/n8n',
    lang: '영어',
    stars: 195000,
    descEn: 'Fair-code workflow automation platform with native AI capabilities',
    tags: ['자동화', '워크플로', '노코드', 'AI 연동'],
    tasks: ['반복작업 자동화'],
    roles: ['디자이너', '기획자', '개발자', '기타'],
    difficulty: '앱 설치 OK',
    summaryKo: [
      '여러 앱·서비스를 연결해 반복 작업을 자동화하는 워크플로 플랫폼이에요.',
      '400개 이상 연동과 AI 기능을 지원하고, 노코드 화면 + 필요시 코드도 섞어 써요.',
      '직접 설치(셀프호스팅)하거나 클라우드로 쓸 수 있어 데이터 통제가 쉬워요.',
    ],
    applyByRole: {
      디자이너: [
        '“새 피드백 → 슬랙 알림”처럼 반복 잡무를 자동화해 시간을 아끼세요.',
        '에셋 정리·알림 같은 루틴을 흐름으로 만들어 두세요.',
      ],
      기획자: [
        '설문 응답·시트·알림을 자동으로 이어 붙여 운영 업무를 자동화하세요.',
        'AI 노드로 자료 요약·분류 워크플로를 만들어 보세요.',
      ],
      개발자: [
        '코드 노드로 복잡한 로직을 넣어 커스텀 자동화를 구축하세요.',
        '셀프호스팅으로 데이터 통제권을 유지하며 운영하세요.',
      ],
      기타: [
        '매번 손으로 하던 반복 작업을 흐름으로 만들어 두세요.',
        '처음엔 준비된 템플릿을 복제해 조금씩 바꿔 쓰면 쉬워요.',
      ],
    },
    pitfall:
      '제대로 쓰려면 설치(또는 클라우드 가입)가 필요해요. 처음엔 준비된 템플릿부터 복제해 시작하면 쉬워요.',
    relatedIds: ['markitdown', 'shadcn-ui'],
  },
  {
    id: 'lm-studio',
    name: 'LM Studio · lms',
    repo: 'https://github.com/lmstudio-ai/lms',
    lang: '영어',
    stars: 5000,
    descEn: 'LM Studio CLI — command line tool for running local LLMs',
    tags: ['로컬 LLM', '오프라인 AI', '개인정보', '명령줄'],
    tasks: ['리서치·정리'],
    roles: ['디자이너', '기획자', '개발자', '기타'],
    difficulty: '앱 설치 OK',
    summaryKo: [
      '내 컴퓨터에서 AI 언어모델(LLM)을 돌리는 LM Studio 앱의 명령줄 도구예요.',
      '다운로드한 모델을 켜고, 로컬 API 서버를 띄워 다른 앱과 연결할 수 있어요.',
      '인터넷 없이·내 데이터가 밖으로 안 나가게 AI를 써보고 싶을 때 좋아요.',
    ],
    applyByRole: {
      디자이너: [
        '민감한 자료를 외부에 안 보내고 로컬 AI로 요약·정리하세요.',
        '아이디어 브레인스토밍을 오프라인에서도 돌려보세요.',
      ],
      기획자: [
        '사내 문서를 클라우드로 안 올리고 로컬 모델로 검토해 보세요.',
        '외부 API 비용 없이 AI 활용을 먼저 실험해 볼 수 있어요.',
      ],
      개발자: [
        '`lms server start`로 로컬 API를 띄워 앱에서 로컬 LLM을 호출하세요.',
        '여러 모델을 받아 성능·용량을 비교해 보세요.',
      ],
      기타: [
        'AI를 인터넷 없이 내 컴퓨터에서만 써보고 싶을 때 시작점이에요.',
        '명령줄이 낯설면 LM Studio 앱 화면(GUI)부터 써도 돼요.',
      ],
    },
    pitfall:
      'lms는 LM Studio 앱과 함께 설치돼요. 명령줄이 낯설면 LM Studio 앱 화면(GUI)부터 써도 됩니다.',
    relatedIds: ['whisper', 'comfyui'],
  },
  {
    id: 'markitdown',
    name: 'microsoft / markitdown',
    repo: 'https://github.com/microsoft/markitdown',
    lang: '영어',
    stars: 162000,
    descEn: 'Python tool for converting files and office documents to Markdown',
    tags: ['문서변환', '마크다운', 'PDF', '전처리'],
    tasks: ['리서치·정리', '자막·문서 변환'],
    roles: ['디자이너', '기획자', '개발자', '기타'],
    difficulty: '코드 조금 OK',
    summaryKo: [
      'PDF·워드·PPT 등 문서를 AI가 읽기 좋은 마크다운 텍스트로 바꿔주는 도구예요.',
      '제목·목록·표 같은 문서 구조를 최대한 살려서 변환해줘요.',
      '자료를 정리하거나 AI에 넣기 전 전처리로 쓰기 좋아요.',
    ],
    applyByRole: {
      디자이너: [
        '리서치 PDF·리포트를 텍스트로 바꿔 인용·정리를 빠르게 하세요.',
        '자료의 표·목록 구조를 살려 옮겨 정리 시간을 줄이세요.',
      ],
      기획자: [
        '경쟁사 자료·보고서(PDF/PPT)를 마크다운으로 바꿔 핵심을 훑으세요.',
        'AI에 넣어 요약하기 전 문서를 깔끔한 텍스트로 정리하세요.',
      ],
      개발자: [
        '문서 파일을 마크다운으로 일괄 변환해 데이터 파이프라인에 넣으세요.',
        'LLM 입력 전처리 단계로 붙여 자동화하세요.',
      ],
      기타: [
        '여러 형식의 문서를 하나의 읽기 쉬운 텍스트로 모으세요.',
        '명령줄이 부담되면 결과를 복사해 쓰는 정도로 가볍게 시작하세요.',
      ],
    },
    pitfall:
      '파이썬으로 실행해요. 명령줄이 부담되면 결과를 복사해 쓰는 정도로 가볍게 시작하세요.',
    relatedIds: ['n8n', 'whisper'],
  },
]

/** id로 자료 하나 찾기 */
export function getResource(id: string): Resource | undefined {
  return RESOURCES.find((r) => r.id === id)
}

/** 해당 자료의 유사 자료 목록 (relatedIds 기준, 없으면 태그·작업 겹침으로 폴백) */
export function getRelated(id: string): Resource[] {
  const base = getResource(id)
  if (!base) return []
  const byIds = base.relatedIds
    .map((rid) => getResource(rid))
    .filter((r): r is Resource => Boolean(r))
  if (byIds.length) return byIds
  // 폴백: 같은 작업(task)을 공유하는 다른 자료
  return RESOURCES.filter(
    (r) => r.id !== id && r.tasks.some((t) => base.tasks.includes(t)),
  ).slice(0, 4)
}
