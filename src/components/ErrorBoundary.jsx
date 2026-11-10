import { Component } from 'react'
import Cuyi from './brand/Cuyi'
import Logo from './brand/Logo'
import ErrorState from './ui/ErrorState'
import { buttonClass } from './ui/buttonClass'
import SupportButton from './ui/SupportButton'

// Atrapa los errores de render de toda la app para que una falla no deje la pantalla en blanco.
// Tiene que ser un componente de clase: React no tiene un hook equivalente.
// Muestra la tarjeta de error del servidor del diseño, con Cuyi confundido.
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
        <main className="mx-auto grid min-h-[calc(100vh_-_73px)] w-full max-w-[1200px] place-items-center px-5 py-14">
          <ErrorState
            status={500}
            className="w-full max-w-[560px]"
            title={['Algo falló', 'en esta pantalla.']}
            text="Ocurrió un error inesperado al mostrar esta página. Tu dinero en garantía no se ve afectado: ningún pago se mueve sin una confirmación."
            actions={
              <>
                <button type="button" onClick={() => window.location.reload()} className={buttonClass('primary')}>
                  Recargar
                </button>
                <a href="/" className={buttonClass('ghost')}>
                  Ir al inicio
                </a>
                <SupportButton />
              </>
            }
          >
            <span className="mt-6 grid h-[76px] w-[76px] place-items-center rounded-[18px] bg-lime">
              <Cuyi anim="confundido" px={4} />
            </span>
          </ErrorState>
        </main>
      </div>
    )
  }
}
