import { useLocation } from 'react-router-dom'
import { Navbar } from './Navbar'

export function MainLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  const isAuthPage = location.pathname === '/auth' || location.pathname.startsWith('/auth/')

  if (isAuthPage) {
    return <div className="page-fade-in">{children}</div>
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-content-primary antialiased">
      <Navbar />

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 page-fade-in sm:px-6 lg:px-8">
        {children}
      </main>

      <footer className="mt-auto border-t border-border-main bg-[var(--surface-sidebar)] px-4 py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-[11px] text-content-muted sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-success" />
            <span className="font-semibold tracking-wide">LORE PERSONAL ASSISTANT &amp; ARCHIVE</span>
            <span className="text-border-main">/</span>
            <span>LOCAL ARCHIVE ACTIVE</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-semibold text-primary">EDITION v3.1</span>
            <span className="text-border-main">/</span>
            <span>MEDIALOG DESIGN LANGUAGE</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
