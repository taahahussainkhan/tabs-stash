import { useLocation } from 'react-router-dom'
import { Navbar } from './Navbar'

export function MainLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  const isAuthPage = location.pathname === '/auth' || location.pathname.startsWith('/auth/')

  if (isAuthPage) {
    return <div className="page-fade-in">{children}</div>
  }

  return (
    <div className="min-h-screen bg-background text-content-primary flex flex-col antialiased">
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 page-fade-in">
        {children}
      </main>

      {/* Minimalist Editorial Footer */}
      <footer className="mt-auto border-t border-[#2e323c] bg-[#17181d] py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-content-muted">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#38a169]"></span>
            <span>CHRONICLE PERSONAL LOGGER</span>
            <span className="text-[#2e323c]">/</span>
            <span>LOCAL ARCHIVE ACTIVE</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-accent-ochre font-semibold">EDITION v2.0</span>
            <span className="text-[#2e323c]">/</span>
            <span>NO GRADIENTS &bull; EDITORIAL MINIMAL</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
