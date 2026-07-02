import { useEffect, useRef } from 'react'
import { Button } from './Button'
import './IntroModal.css'

interface IntroModalProps {
  open: boolean
  onClose: () => void
}

/**
 * 첫 방문 안내 모달 — "어디까지 실제로 작동하나요?"
 * 방법3(GitHub 주소)만 라이브, 방법1·2(추천·키워드)는 캐시 데모임을 투명하게 안내.
 * 접근성: role=dialog / aria-modal / ESC·배경 클릭 닫기 / 포커스 트랩 / 스크롤 잠금.
 */
export function IntroModal({ open, onClose }: IntroModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const prevActive = document.activeElement as HTMLElement | null
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden' // 배경 스크롤 잠금
    closeRef.current?.focus() // 초기 포커스

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key === 'Tab') {
        // 간단 포커스 트랩 — 모달 밖으로 탭 이동 방지
        const nodes = cardRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, [tabindex]:not([tabindex="-1"])',
        )
        if (!nodes || nodes.length === 0) return
        const first = nodes[0]
        const last = nodes[nodes.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      prevActive?.focus?.() // 닫을 때 포커스 복원
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="modal__overlay" onClick={onClose}>
      <div
        className="modal__card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="intro-title"
        aria-describedby="intro-desc"
        ref={cardRef}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal__x"
          onClick={onClose}
          aria-label="닫기"
          ref={closeRef}
        >
          <span aria-hidden="true">×</span>
        </button>

        <h2 id="intro-title" className="modal__title">
          어떤 기능이 진짜로 작동하나요?
        </h2>
        <p id="intro-desc" className="modal__desc">
          포트폴리오용 데모예요. 세 가지 방법의 작동 방식이 달라서 먼저
          알려드릴게요.
        </p>

        <ul className="modal__rows">
          <li className="modal__row modal__row--live">
            <span className="modal__tag modal__tag--live">⚡ 지금 작동</span>
            <strong className="modal__rowtitle">
              방법 3 · GitHub 주소 붙여넣기
            </strong>
            <p className="modal__rowdesc">
              실제로 작동하는 기능이에요. 아무 공개 GitHub 주소나 넣으면, AI가
              그 자리에서 내용을 읽고 한국어로 정리해 줍니다.{' '}
              <b>직접 넣어보세요.</b>
            </p>
          </li>
          <li className="modal__row">
            <span className="modal__tag modal__tag--demo">🗂 미리 만든 예시</span>
            <strong className="modal__rowtitle">
              방법 1·2 · 추천 / 키워드 검색
            </strong>
            <p className="modal__rowdesc">
              결과 화면을 미리 만들어 둔 예시예요. 새로 분석하지는 않고, 어떤
              식으로 보여주는지 흐름만 확인할 수 있어요.
            </p>
          </li>
        </ul>

        <p className="modal__note">
          세 방법 다 <b>실제 GitHub 자료</b>를 씁니다. 방법 3만 지금 이 순간
          새로 분석하고, 방법 1·2는 미리 만들어 둔 결과를 보여줘요.
        </p>

        <Button size="lg" onClick={onClose} className="modal__cta">
          확인, 시작할게요
        </Button>
      </div>
    </div>
  )
}
