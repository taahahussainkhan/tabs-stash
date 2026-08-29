import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import { Key, ShieldCheck, Save, X } from 'lucide-react'
import { PropertyRow, GhostInput } from '../../../../shared/components/common/property-sheet'
import { passwordChangeSchema, type PasswordChangeSchemaData } from '../../schemas/passwordChangeSchema'
import { api } from '../../../../app/api'

interface PasswordChangeModalContentProps {
  onClose: () => void
}

export function PasswordChangeModalContent({ onClose }: PasswordChangeModalContentProps) {
  const form = useForm<PasswordChangeSchemaData>({
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    } satisfies PasswordChangeSchemaData,
    validators: {
      onChange: passwordChangeSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await api.post('/users/change-password', {
          current_password: value.current_password,
          new_password: value.new_password,
        })

        toast.success('Password changed successfully!')
        onClose()
      } catch (error: any) {
        console.error('Change password error:', error)
        const errorMessage = error.response?.data?.detail || error.message || 'Unknown error'
        throw new Error(errorMessage)
      }
    },
  })

  return (
    <div className="flex flex-col h-full bg-[#1e2026]">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          void form.handleSubmit()
        }}
        className="flex flex-col h-full"
      >
        <div className="p-6 sm:p-10 flex-1 overflow-y-auto custom-scrollbar space-y-6">
          {/* Title */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2 font-mono">
              <span className="mono-badge mono-badge-cyan text-[9px]">CREDENTIALS</span>
              <span className="text-[10px] text-content-muted uppercase tracking-wider">Account Security</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-content-primary tracking-tight">
              Update Access Key
            </h2>
            <p className="text-xs text-content-secondary">
              Ensure your master key is at least 8 characters long.
            </p>
          </div>

          {/* Properties Sheet */}
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-content-muted/40 mb-2 px-1">
              Security Tokens
            </div>

            <PropertyRow icon={<Key className="w-4 h-4" />} label="Current Password" required>
              <form.Field
                name="current_password"
                children={(field) => (
                  <GhostInput
                    type="password"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Enter current password"
                    autoFocus
                  />
                )}
              />
            </PropertyRow>

            <PropertyRow icon={<Key className="w-4 h-4" />} label="New Password" required>
              <form.Field
                name="new_password"
                children={(field) => (
                  <GhostInput
                    type="password"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="At least 8 characters"
                  />
                )}
              />
            </PropertyRow>

            <PropertyRow icon={<Key className="w-4 h-4" />} label="Confirm Password" required>
              <form.Field
                name="confirm_password"
                children={(field) => (
                  <GhostInput
                    type="password"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Confirm new password"
                  />
                )}
              />
            </PropertyRow>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-10 py-4 border-t border-[#2e323c] flex items-center justify-between gap-4 bg-[#17181d] shrink-0">
          <button 
            type="button" 
            className="text-xs font-medium text-content-muted hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            onClick={onClose}
          >
            <X className="w-3.5 h-3.5" />
            <span>Discard</span>
          </button>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting] as const}
            children={([canSubmit, isSubmitting]) => (
              <button 
                type="submit" 
                className="btn-primary px-5 py-2 text-xs flex items-center gap-1.5"
                disabled={!canSubmit || isSubmitting}
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Updating...' : 'Update Password'}</span>
              </button>
            )}
          />
        </div>
      </form>
    </div>
  )
}
