import { Link } from 'react-router-dom'
import { LoginForm } from './components/LoginForm'
import { Bookmark } from 'lucide-react'

export function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[var(--background)]">
      <div className="w-full max-w-md page-fade-in space-y-6">
        {/* Logo and branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-[var(--radius-md)] bg-[var(--surface)] border border-[var(--border-color)] shadow-md mb-2">
            <Bookmark className="w-6 h-6 text-accent-vermillion" />
          </div>
          <h1 className="text-2xl font-bold text-content-primary tracking-tight">
            Lore Archive
          </h1>
          <p className="text-content-muted font-mono text-xs uppercase tracking-wider">
            Sign in to access your personal assistant &amp; archive
          </p>
        </div>

        {/* Login card */}
        <div className="bg-[var(--surface)] rounded-[var(--radius-md)] p-6 sm:p-8 border border-[var(--border-color)] shadow-2xl">
          <LoginForm />
          
          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border-color)]"></div>
            </div>
            <span className="relative px-3 bg-[var(--surface)] text-[10px] font-mono text-content-muted uppercase tracking-widest">
              or
            </span>
          </div>
          
          {/* Sign up link */}
          <div className="text-center">
            <p className="text-xs text-content-secondary">
              Don't have an account?{' '}
              <Link 
                to="/auth/signup" 
                className="font-bold text-accent-vermillion hover:underline"
              >
                Create an archive account
              </Link>
            </p>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center text-[10px] font-mono text-content-muted uppercase tracking-widest">
          Lore &bull; Personal Assistant &amp; Life Archive
        </p>
      </div>
    </div>
  )
}
