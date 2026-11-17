import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import AppFooter from './components/layout/AppFooter'
import Navbar from './components/layout/Navbar'
import CuyiChat from './components/support/CuyiChat'
import { AuthProvider } from './contexts/AuthProvider'
import { ThemeProvider } from './contexts/ThemeProvider'
import { ToastProvider } from './contexts/ToastProvider'
import AppRoutes from './routes'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <ErrorBoundary>
              {/* El pie queda abajo aunque la página sea corta */}
              <div className="flex min-h-dvh flex-col">
                <Navbar />
                <div className="flex-1">
                  <AppRoutes />
                </div>
                <AppFooter />
              </div>
              <CuyiChat />
            </ErrorBoundary>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
