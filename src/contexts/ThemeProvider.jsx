import { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { ThemeContext } from './themeContext'

// Igual que la app: se guarda en 'devutec.theme' y puede ser 'system', 'light' o 'dark'.
const STORAGE_KEY = 'devutec.theme'
const PREFERENCES = ['system', 'light', 'dark']
// Si la persona no eligió nada, sigue al sistema (claro u oscuro según su dispositivo).
const DEFAULT_PREFERENCE = 'system'

function readPreference() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return PREFERENCES.includes(saved) ? saved : DEFAULT_PREFERENCE
  } catch {
    return DEFAULT_PREFERENCE
  }
}

const systemQuery = () => window.matchMedia('(prefers-color-scheme: dark)')

// Modo claro u oscuro de la web. Pone data-theme en <html>, que es lo que mira el CSS (index.css).
// El script de index.html hace lo mismo antes de que cargue React, para que no se vea un destello blanco.
export function ThemeProvider({ children }) {
  const [preference, setPreferenceState] = useState(readPreference)
  const [systemDark, setSystemDark] = useState(() => systemQuery().matches)

  // Si la preferencia es "Sistema", se sigue al sistema también cuando cambia con la página abierta
  useEffect(() => {
    const query = systemQuery()
    const onChange = (event) => setSystemDark(event.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const scheme = preference === 'system' ? (systemDark ? 'dark' : 'light') : preference

  useEffect(() => {
    document.documentElement.dataset.theme = scheme
  }, [scheme])

  const value = useMemo(
    () => ({
      preference,
      scheme,
      setPreference: (next) => {
        if (!PREFERENCES.includes(next)) return
        setPreferenceState(next)
        try {
          localStorage.setItem(STORAGE_KEY, next)
        } catch {
          // Sin almacenamiento (modo privado): el cambio vale solo mientras la pestaña esté abierta
        }
      },
    }),
    [preference, scheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

ThemeProvider.propTypes = {
  children: PropTypes.node,
}
