import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import { Key, ShieldCheck, X } from 'lucide-react'
import { PasswordInput } from '../../shared/components/common/form/PasswordInput'
import { passwordChangeSchema, type PasswordChangeSchemaData } from './schemas/passwordChangeSchema'
import { api } from '../../app/api'

interface Props {
  onClose: () => void
}

export function PasswordChangeModal({ onClose }: Props) {
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
    <div className="p-6 md:p-8">
      <header className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pastel-lavender/10 rounded-xl">
            <ShieldCheck className="w-5 h-5 text-pastel-lavender" />
          </div>
          <div>
            <h3 className="text-xl font-serif text-content-primary">Update Password</h3>
            <p className="text-[10px] text-content-muted uppercase tracking-widest font-bold">Security Shield</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-white/5 rounded-full transition-colors text-content-muted hover:text-content-primary"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          void form.handleSubmit()
        }}
        className="space-y-6"
      >
        <form.Field
          name="current_password"
          children={(field) => {
            const error = field.state.meta.isTouched && !field.state.meta.isValid
              ? field.state.meta.errors.map(String).join(', ')
              : undefined

            return (
              <PasswordInput
                label="Current Password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                disabled={form.state.isSubmitting}
                placeholder="••••••••"
                required
                error={error}
                className="bg-white/[0.02]"
              />
            )
          }}
        />
        
        <form.Field
          name="new_password"
          children={(field) => {
            const error = field.state.meta.isTouched && !field.state.meta.isValid
              ? field.state.meta.errors.map(String).join(', ')
              : undefined

            return (
              <PasswordInput
                label="New Password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                disabled={form.state.isSubmitting}
                placeholder="••••••••"
                helperText="Minimum 8 characters"
                required
                error={error}
                className="bg-white/[0.02]"
              />
            )
          }}
        />
        
        <form.Field
          name="confirm_password"
          children={(field) => {
            const error = field.state.meta.isTouched && !field.state.meta.isValid
              ? field.state.meta.errors.map(String).join(', ')
              : undefined

            return (
              <PasswordInput
                label="Confirm New Password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                disabled={form.state.isSubmitting}
                placeholder="••••••••"
                required
                error={error}
                className="bg-white/[0.02]"
              />
            )
          }}
        />

        <div className="flex gap-4 pt-6">
          <button
            type="button"
            className="flex-1 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest text-content-muted hover:text-content-primary hover:bg-white/5 transition-all"
            onClick={onClose}
            disabled={form.state.isSubmitting}
          >
            Cancel
          </button>
          
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting] as const}
            children={([canSubmit, isSubmitting]) => (
              <button
                type="submit"
                className="flex-[2] btn-pastel-lavender justify-center py-3 text-xs uppercase tracking-widest font-bold"
                disabled={isSubmitting || !canSubmit}
              >
                {isSubmitting ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <>
                    <Key className="w-3.5 h-3.5" />
                    Update Key
                  </>
                )}
              </button>
            )}
          />
        </div>
      </form>
    </div>
  )
}
