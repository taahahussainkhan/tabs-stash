import { useMemo, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useAuth } from '../../../app/auth'
import { Button } from '../../../shared/components/common/Button'
import { Input } from '../../../shared/components/common/form/Input'
import { PasswordInput } from '../../../shared/components/common/form/PasswordInput'
import { Mail, User, ArrowRight, CheckCircle2, Lock } from 'lucide-react'
import { signUpSchema, type SignUpSchemaData } from '../schemas/signUpSchema'

interface Props {
  onSignedUp?: () => void
}

export function SignUpForm({ onSignedUp }: Props) {
  const [success, setSuccess] = useState<string | null>(null)
  const { signup } = useAuth()

  const form = useForm<SignUpSchemaData>({
    defaultValues: {
      first_name: '',
      last_name: '',
      username: '',
      email: '',
      password: '',
    } satisfies SignUpSchemaData,
    validators: {
      onChange: signUpSchema,
    },
    onSubmit: async ({ value }) => {
      setSuccess(null)
      await signup({
        email: value.email,
        password: value.password,
        first_name: value.first_name || undefined,
        last_name: value.last_name || undefined,
        username: value.username || undefined,
      })
      const message = 'Account created successfully! Redirecting...'
      setSuccess(message)
      if (onSignedUp) onSignedUp()
    },
  })

  const passwordStrength = useMemo(() => {
    const password = form.state.values.password
    if (!password) return { score: 0, label: '', colorClass: 'bg-[#2e323c]' }
    
    let score = 0
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[^a-zA-Z0-9]/.test(password)) score++
    
    if (score <= 2) return { score, label: 'Weak', colorClass: 'bg-[#e53e3e]' }
    if (score <= 3) return { score, label: 'Fair', colorClass: 'bg-[#e5a83b]' }
    if (score <= 4) return { score, label: 'Good', colorClass: 'bg-[#0d9488]' }
    return { score, label: 'Strong', colorClass: 'bg-[#38a169]' }
  }, [form.state.values.password])

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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <form.Field
            name="first_name"
            children={(field) => (
              <Input
                id="signup-first-name"
                label="First Name"
                placeholder="John"
                value={field.state.value || ''}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                autoComplete="given-name"
              />
            )}
          />
          
          <form.Field
            name="last_name"
            children={(field) => (
              <Input
                id="signup-last-name"
                label="Last Name"
                placeholder="Doe"
                value={field.state.value || ''}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                autoComplete="family-name"
              />
            )}
          />
        </div>
        
        <form.Field
          name="username"
          children={(field) => (
            <Input
              id="signup-username"
              label="Username (optional)"
              placeholder="johndoe"
              value={field.state.value || ''}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              autoComplete="username"
              leftIcon={<User className="w-3.5 h-3.5 text-content-muted" />}
            />
          )}
        />
        
        <form.Field
          name="email"
          children={(field) => {
            const error = field.state.meta.isTouched && !field.state.meta.isValid
              ? field.state.meta.errors.map(String).join(', ')
              : undefined

            return (
              <Input
                id="signup-email"
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
        
        <div className="space-y-2">
          <form.Field
            name="password"
            children={(field) => {
              const error = field.state.meta.isTouched && !field.state.meta.isValid
                ? field.state.meta.errors.map(String).join(', ')
                : undefined

              return (
                <PasswordInput
                  id="signup-password"
                  label="Password"
                  placeholder="••••••••"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  error={error}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  leftIcon={<Lock className="w-3.5 h-3.5 text-content-muted" />}
                />
              )
            }}
          />
          
          {form.state.values.password && (
            <div className="px-0.5 space-y-1.5 font-mono">
              <div className="flex items-center justify-between text-[10px] uppercase text-content-muted">
                <span>Strength: {passwordStrength.label}</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      level <= passwordStrength.score
                        ? passwordStrength.colorClass
                        : 'bg-[#15161a] border border-[#2e323c]'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-2 p-3 bg-[#143324] border border-[#1e593a] rounded-[4px] font-mono text-xs text-[#4ade80]">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <p>{success}</p>
        </div>
      )}
      
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
                <span>Create Archive Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </Button>
        )}
      />
    </form>
  )
}
