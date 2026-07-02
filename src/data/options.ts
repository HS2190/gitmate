import type { Role, Task, Purpose, Difficulty } from './resources'

export interface Option<T extends string> {
  value: T
  label: string
  emoji: string
}

export const ROLE_OPTIONS: Option<Role>[] = [
  { value: '디자이너', label: '디자이너', emoji: '🎨' },
  { value: '기획자', label: '기획자', emoji: '📋' },
  { value: '개발자', label: '개발자', emoji: '💻' },
  { value: '기타', label: '그 외', emoji: '✏️' },
]

export const TASK_OPTIONS: Option<Task>[] = [
  { value: '리서치·정리', label: '리서치·정리', emoji: '🔎' },
  { value: '이미지·무드보드', label: '이미지·무드보드', emoji: '🖼' },
  { value: '프로토타입', label: '프로토타입', emoji: '📐' },
  { value: '반복작업 자동화', label: '반복작업 자동화', emoji: '⚙️' },
  { value: '자막·문서 변환', label: '자막·문서 변환', emoji: '🎬' },
]

export const PURPOSE_OPTIONS: Option<Purpose>[] = [
  { value: '학습·탐색', label: '학습·탐색', emoji: '📚' },
  { value: '실무 적용', label: '실무 적용', emoji: '🛠' },
  { value: '도입 검토', label: '도입 검토', emoji: '🤔' },
]

export const DIFFICULTY_OPTIONS: Option<Difficulty>[] = [
  { value: '설치 없이 웹에서', label: '설치 없이 웹에서', emoji: '🌐' },
  { value: '앱 설치 OK', label: '앱 설치 OK', emoji: '📥' },
  { value: '코드 조금 OK', label: '코드 조금 OK', emoji: '⌨️' },
]

export function emojiFor(
  value: string | undefined,
): string {
  if (!value) return ''
  const all = [
    ...ROLE_OPTIONS,
    ...TASK_OPTIONS,
    ...PURPOSE_OPTIONS,
    ...DIFFICULTY_OPTIONS,
  ]
  return all.find((o) => o.value === value)?.emoji ?? ''
}
