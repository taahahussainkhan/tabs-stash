import { Link } from 'react-router-dom'
import { LoginForm } from './components/LoginForm'
import { Sparkles } from 'lucide-react'

export function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Decorative background elements - Pastel Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-pastel-lavender/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-pastel-blue/10 rounded-full blur-[100px]" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-[10%] left-[20%] w-[35%] h-[35%] bg-pastel-rose/10 rounded-full blur-[120px]" style={{ animationDelay: '4s' }} />
      </div>

      <div className="w-full max-w-md relative z-10 page-fade-in">
        {/* Logo and branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-surface border border-white/5 shadow-soft mb-6">
            <Sparkles className="w-10 h-10 text-pastel-lavender" />
          </div>
          <h1 className="text-4xl font-serif text-content-primary mb-3">
            Welcome Back
          </h1>
          <p className="text-content-muted font-sans tracking-wide uppercase text-xs">
            Continue your personal archive
          </p>
        </div>

        {/* Login card */}
        <div className="soft-glass rounded-4xl p-10 border border-white/5">
          <LoginForm />
          
          {/* Divider */}
          <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <span className="relative px-4 bg-transparent text-xs text-content-muted uppercase tracking-widest">
              or
            </span>
          </div>
          
          {/* Sign up link */}
          <div className="text-center">
            <p className="text-sm text-content-secondary">
              Don't have an account?{' '}
              <Link 
                to="/auth/signup" 
                className="font-semibold text-pastel-lavender hover:text-pastel-rose transition-colors duration-300"
              >
                Create one now
              </Link>
            </p>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center text-[10px] text-content-muted/50 mt-10 uppercase tracking-[0.2em]">
          Preserving your journey, one log at a time
        </p>
      </div>
    </div>
  )
}
