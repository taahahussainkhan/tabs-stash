import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useModalStore } from '../../../store/modalStore'
import { X } from 'lucide-react'

type ModalProps = {
  id: string
  title?: string
  content: React.ComponentType<Record<string, unknown>>
  props?: Record<string, unknown>
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full'
  position?: 'center' | 'left' | 'right'
  closable?: boolean
  backdrop?: boolean
  className?: string
  footer?: React.ReactNode
}

const sizeClasses: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  full: 'w-full h-full max-w-full m-0 rounded-none',
}

export function Modal({
  id,
  title,
  content: Content,
  props = {},
  size = '2xl',
  position = 'center', // Centered modal dialog
  closable = true,
  backdrop = true,
  footer,
}: ModalProps) {
  const { closeModal } = useModalStore()
  const [mounted, setMounted] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handleClose = () => {
    if (closable) {
      closeModal(id)
    }
  }

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [closable])

  if (!mounted) return null

  const isDrawer = position === 'left' || position === 'right'

  const positionWrapper = position === 'right'
    ? 'items-stretch justify-end p-0'
    : position === 'left'
    ? 'items-stretch justify-start p-0'
    : 'items-center justify-center p-3 sm:p-6'

  return createPortal(
    <div className={`fixed inset-0 z-[9999] flex ${positionWrapper} overflow-hidden`}>
      {/* Backdrop */}
      {backdrop && (
        <div
          className="absolute inset-0 bg-black/75 backdrop-blur-[2px] animate-in fade-in duration-150"
          onClick={closable ? handleClose : undefined}
        />
      )}

      {/* Modal Dialog Window */}
      <div
        ref={modalRef}
        className={`
          relative bg-[#1e2026] flex flex-col overflow-hidden shadow-2xl z-10 border border-[#2e323c]
          ${isDrawer 
            ? 'h-full rounded-none' 
            : 'rounded-[8px] max-h-[90vh] w-full animate-in fade-in zoom-in-98 duration-150'
          }
          ${sizeClasses[size] || sizeClasses['2xl']}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Optional Title Header */}
        {title ? (
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#2e323c] bg-[#17181d] shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-accent-vermillion shrink-0" />
              <h3 className="text-xs font-bold text-content-primary truncate tracking-tight uppercase font-mono">
                {title}
              </h3>
            </div>
            {closable && (
              <button
                onClick={handleClose}
                className="p-1 hover:bg-[#262830] rounded-[3px] text-content-muted hover:text-white transition-colors border border-transparent hover:border-[#2e323c] cursor-pointer"
                aria-label="Close modal"
                type="button"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : closable ? (
          <button
            onClick={handleClose}
            className="absolute top-3.5 right-3.5 z-30 p-1 bg-[#17181d] hover:bg-[#262830] rounded-[3px] text-content-muted hover:text-white transition-colors border border-[#2e323c] cursor-pointer shadow-sm"
            aria-label="Close modal"
            type="button"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : null}

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          {(() => {
            const { key, ...safeProps } = props as any
            return <Content {...safeProps} onClose={handleClose} />
          })()}
        </div>

        {/* Optional Footer */}
        {footer && (
          <div className="px-5 py-3 border-t border-[#2e323c] bg-[#17181d] shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
