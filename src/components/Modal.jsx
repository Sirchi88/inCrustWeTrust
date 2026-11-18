import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from './icons.jsx'

export default function Modal({ open, onClose, children, className = '' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        className={`modal-in fixed left-1/2 top-1/2 grid w-[calc(100%-2rem)] max-w-lg gap-4 border bg-background p-6 shadow-lg ${className}`}
      >
        {children}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100"
          aria-label="Schließen"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>,
    document.body,
  )
}

export function ModalHeader({ title, description, className = '' }) {
  return (
    <div className="flex flex-col space-y-1.5 text-center sm:text-left">
      <h2 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>{title}</h2>
      {description && <div className="text-sm text-muted-foreground">{description}</div>}
    </div>
  )
}

export function ModalFooter({ children, className = '' }) {
  return <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className}`}>{children}</div>
}
