import { Link } from 'react-router-dom'
import { SignUpForm } from './components/SignUpForm'
import { Sparkles, History } from 'lucide-react'

export function SignUpPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Decorative background elements - Pastel Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] right-[10%] w-[45%] h-[45%] bg-pastel-rose/10 rounded-full blur-[130px] animate-pulse" />
        <div className="absolute -bottom-[5%] -left-[5%] w-[35%] h-[35%] bg-pastel-sage/10 rounded-full blur-[110px]" style={{ animationDelay: '3s' }} />
        <div className="absolute top-[40%] left-[30%] w-[25%] h-[25%] bg-pastel-blue/5 rounded-full blur-[90px]" />
      </div>

      <div className="w-full max-w-lg relative z-10 page-fade-in">
        {/* Logo and branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-surface border border-white/5 shadow-soft mb-6 group">
            <History className="w-10 h-10 text-pastel-rose group-hover:rotate-[-10deg] transition-transform duration-500" />
            <Sparkles className="w-5 h-5 text-pastel-amber absolute -top-1 -right-1 animate-pulse" />
          </div>
          <h1 className="text-4xl font-serif text-content-primary mb-3">
            Start Your Archive
          </h1>
          <p className="text-content-muted font-sans tracking-wide uppercase text-xs">
            Begin your personal journey today
          </p>
        </div>

        {/* Signup card */}
        <div className="soft-glass rounded-4xl p-10 border border-white/5">
          <SignUpForm />
          
          {/* Divider */}
          <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <span className="relative px-4 bg-transparent text-xs text-content-muted uppercase tracking-widest">
              or
            </span>
          </div>
          
          {/* Login link */}
          <div className="text-center">
            <p className="text-sm text-content-secondary">
              Already have an account?{' '}
              <Link 
                to="/auth/login" 
                className="font-semibold text-pastel-rose hover:text-pastel-lavender transition-colors duration-300"
              >
                Sign in to archive
              </Link>
            </p>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center text-[10px] text-content-muted/50 mt-10 uppercase tracking-[0.2em]">
          By joining, you embrace the art of preservation
        </p>
      </div>
    </div>
  )
}
