import { useForm } from '@tanstack/react-form'
import { useAuth } from '../../../app/auth'
import { Button } from '../../../shared/components/common/Button'
import { Input } from '../../../shared/components/common/form/Input'
import { PasswordInput } from '../../../shared/components/common/form/PasswordInput'
import { Mail, ArrowRight, Lock } from 'lucide-react'
import { loginSchema, type LoginSchemaData } from '../schemas/loginSchema'

export function LoginForm() {
  const { login } = useAuth()

  const form = useForm<LoginSchemaData>({
    defaultValues: {
      email: '',
      password: '',
    } satisfies LoginSchemaData,
    validators: {
      onChange: loginSchema,
    },
    onSubmit: async ({ value }) => {
      await login(value.email, value.password)
    },
  })

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <div className="space-y-3">
        <form.Field
          name="email"
          children={(field) => {
            const error = field.state.meta.isTouched && !field.state.meta.isValid
              ? field.state.meta.errors.map(String).join(', ')
              : undefined

            return (
              <Input
                id="login-email"
                type="email"
                label="Email Address"
                placeholder="you@example.com"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={error}
                required
                autoComplete="email"
                leftIcon={<Mail className="w-3.5 h-3.5 text-content-muted" />}
              />
            )
          }}
        />
        
        <form.Field
          name="password"
          children={(field) => {
            const error = field.state.meta.isTouched && !field.state.meta.isValid
              ? field.state.meta.errors.map(String).join(', ')
              : undefined

            return (
              <PasswordInput
                id="login-password"
                label="Password"
                placeholder="••••••••"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={error}
                required
                minLength={8}
                autoComplete="current-password"
                leftIcon={<Lock className="w-3.5 h-3.5 text-content-muted" />}
              />
            )
          }}
        />
      </div>

      <div className="flex items-center justify-between text-xs px-0.5 pt-1">
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            className="w-3.5 h-3.5 rounded-[2px] border-[#2e323c] bg-[#15161a] accent-accent-vermillion" 
          />
          <span className="text-content-muted text-[11px] font-mono">Remember session</span>
        </label>
        <button 
          type="button" 
          className="text-accent-vermillion text-[11px] font-mono hover:underline"
        >
          Forgot password?
        </button>
      </div>
      
      <form.Subscribe
        selector={(state) => state.isSubmitting}
        children={(isSubmitting) => (
          <Button
            type="submit"
            loading={isSubmitting}
            className="btn-primary w-full py-2.5 text-xs font-bold tracking-wide mt-2"
          >
            {!isSubmitting && (
              <>
                <span>Sign In to Archive</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </Button>
        )}
      />
    </form>
  )
}
