import { useState } from 'react'
import type { InputHTMLAttributes } from 'react'
import { Input } from './Input'
import { Eye, EyeOff, Lock } from 'lucide-react'

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function PasswordInput({ 
  label,
  error,
  helperText,
  leftIcon,
  className = '',
  ...props 
}: Props) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <Input
      type={showPassword ? 'text' : 'password'}
      label={label}
      error={error}
      helperText={helperText}
      className={className}
      leftIcon={leftIcon || <Lock className="w-3.5 h-3.5 text-content-muted" />}
      rightIcon={
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="w-7 h-7 flex items-center justify-center rounded-[3px] hover:bg-[#262830] text-content-muted hover:text-content-primary transition-colors"
          tabIndex={-1}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOff className="w-3.5 h-3.5" />
          ) : (
            <Eye className="w-3.5 h-3.5" />
          )}
        </button>
      }
      {...props}
    />
  )
}
