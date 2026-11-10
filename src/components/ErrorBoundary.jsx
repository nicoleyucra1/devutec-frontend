import { Component } from 'react'
import Logo from './brand/Logo'
import ErrorState from './ui/ErrorState'
import { ERROR_ICONS } from './ui/errorIcons'
import { buttonClass } from './ui/buttonClass'
import SupportButton from './ui/SupportButton'

// Atrapa los errores de render de toda la app para que una falla no deje la pantalla en blanco.
// Tiene que ser un componente de clase: React no tiene un hook equivalente.
// Muestra la pantalla de error del diseño con Cuyi confundido.
export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Error no controlado en la interfaz:', error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    // Se usan <a> y recargas completas porque parte de la app pudo quedar en mal estado
    return (
      <div className="min-h-screen bg-paper">
        <header className="border-b border-line bg-paper/90">
          <div className="mx-auto flex h-[73px] w-full max-w-[1200px] items-center px-6">
            <a href="/" aria-label="DevUTEC, ir al inicio">
              <Logo />
            </a>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1200px] px-5">
          <ErrorState
            status={500}
            anim="confundido"
            title={['Algo falló', 'en esta pantalla.']}
            text="Ocurrió un error inesperado al mostrar esta página. Recárgala o vuelve al inicio."
            actions={
              <>
                <button type="button" onClick={() => window.location.reload()} className={buttonClass('primary')}>
                  {ERROR_ICONS.retry}
                  Recargar
                </button>
                <a href="/" className={buttonClass('secondary')}>
                  {ERROR_ICONS.home}
                  Ir al inicio
                </a>
                <SupportButton />
              </>
            }
          />
        </main>
      </div>
    )
  }
}
