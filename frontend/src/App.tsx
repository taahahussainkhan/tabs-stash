import { useTheme } from './app/theme'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense } from 'react'
import { ModalProvider } from './shared/components/common/ModalProvider'
import { ProtectedRoute } from './features/auth/components/ProtectedRoute'
import { ProtectedLayoutRoute } from './shared/components/routing/ProtectedLayoutRoute'
import { routes } from './routes/config'

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <span className="loading loading-spinner loading-lg text-primary"></span>
  </div>
)

function App() {
  const { theme } = useTheme()

  return (
    <div className="min-h-screen bg-background text-content-primary" data-theme={theme}>
      <ModalProvider />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {routes.map(({ path, component: Component, protected: isProtected, layout }) => (
            <Route
              key={path}
              path={path}
              element={
                isProtected && layout ? (
                  <ProtectedLayoutRoute component={Component} />
                ) : isProtected ? (
                  <ProtectedRoute>
                    <Component />
                  </ProtectedRoute>
                ) : (
                  <Component />
                )
              }
            />
          ))}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  )
}

export default App
