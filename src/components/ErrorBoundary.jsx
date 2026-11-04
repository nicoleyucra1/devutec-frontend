import { Component } from 'react'

// Atrapa los errores de render de toda la app para que una falla no deje la pantalla en blanco.
// Tiene que ser un componente de clase: React no tiene un hook equivalente.
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

    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md text-center">
          <p className="text-sm font-semibold text-indigo-600">DevUTEC</p>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">Algo salió mal</h1>
          <p className="mt-2 text-gray-500">
            Ocurrió un error inesperado en esta pantalla. Puedes recargarla o volver al inicio.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700"
            >
              Recargar
            </button>
            <a href="/" className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-100">
              Ir al inicio
            </a>
          </div>
        </div>
      </main>
    )
  }
}
