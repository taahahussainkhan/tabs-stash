import { Link } from 'react-router-dom'
import { LoginForm } from './components/LoginForm'
import { Bookmark } from 'lucide-react'

export function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#121316]">
      <div className="w-full max-w-md page-fade-in space-y-6">
        {/* Logo and branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-[6px] bg-[#1e2026] border border-[#2e323c] shadow-md mb-2">
            <Bookmark className="w-6 h-6 text-accent-vermillion" />
          </div>
          <h1 className="text-2xl font-bold text-content-primary tracking-tight">
            Chronicle Vault
          </h1>
          <p className="text-content-muted font-mono text-xs uppercase tracking-wider">
            Sign in to access your personal archive
          </p>
        </div>

        {/* Login card */}
        <div className="bg-[#1e2026] rounded-[6px] p-6 sm:p-8 border border-[#2e323c] shadow-2xl">
          <LoginForm />
          
          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#2e323c]"></div>
            </div>
            <span className="relative px-3 bg-[#1e2026] text-[10px] font-mono text-content-muted uppercase tracking-widest">
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
          Personal Media &amp; Literature Chronicle
        </p>
      </div>
    </div>
  )
}
