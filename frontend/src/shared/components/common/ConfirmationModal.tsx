import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react'

export interface ConfirmationModalProps {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info' | 'success'
  onConfirm: () => void | Promise<void>
  onClose: () => void
}

const variantConfig = {
  danger: {
    icon: XCircle,
    iconClass: 'text-danger',
    buttonClass: 'bg-[#271414] hover:bg-[#3b1818] text-danger border-danger/50',
    containerClass: 'bg-danger/10 border-danger/20',
  },
  warning: {
    icon: AlertTriangle,
    iconClass: 'text-accent-ochre',
    buttonClass: 'bg-[#e05a47] hover:bg-[#cc4a38] text-white border-[#ff7b68]',
    containerClass: 'bg-accent-ochre/10 border-accent-ochre/20',
  },
  info: {
    icon: Info,
    iconClass: 'text-accent-cyan',
    buttonClass: 'bg-[#e05a47] hover:bg-[#cc4a38] text-white border-[#ff7b68]',
    containerClass: 'bg-accent-cyan/10 border-accent-cyan/20',
  },
  success: {
    icon: CheckCircle,
    iconClass: 'text-accent-sage',
    buttonClass: 'bg-[#38a169] hover:bg-[#2e8555] text-white border-[#4ade80]',
    containerClass: 'bg-accent-sage/10 border-accent-sage/20',
  },
}

export function ConfirmationModal({
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
  onConfirm,
  onClose,
}: ConfirmationModalProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  const handleConfirm = async () => {
    await onConfirm()
    onClose()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className={`p-2.5 rounded-[4px] border ${config.containerClass} ${config.iconClass} shrink-0`}>
          <Icon className="w-6 h-6" />
        </div>
        
        <div className="space-y-1.5 flex-1">
          <h4 className="font-bold text-base text-content-primary tracking-tight">{title}</h4>
          <p className="text-xs text-content-secondary leading-relaxed whitespace-pre-wrap">
            {message}
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-[#2e323c]">
        <button 
          type="button" 
          className="px-4 py-1.5 rounded-[4px] font-semibold text-xs transition-colors bg-[#17181d] hover:bg-[#262830] text-content-secondary hover:text-content-primary border border-[#2e323c]" 
          onClick={onClose}
        >
          {cancelText}
        </button>
        <button 
          type="button" 
          className={`px-4 py-1.5 rounded-[4px] font-bold text-xs transition-colors border ${config.buttonClass}`} 
          onClick={handleConfirm}
        >
          {confirmText}
        </button>
      </div>
    </div>
  )
}
