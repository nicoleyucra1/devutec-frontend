import { useContext } from 'react'
import { ThemeContext } from '../contexts/themeContext'

// Uso: const { preference, scheme, setPreference } = useTheme()
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme se usa dentro de ThemeProvider')
  return context
}
