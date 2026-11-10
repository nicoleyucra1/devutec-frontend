import { useCallback, useEffect, useState } from 'react'
import { AuthContext } from './authContext'
import { authService } from '../services/authService'
import { userService } from '../services/userService'
import { useToast } from '../hooks/useToast'
import { setSessionExpiredHandler } from '../services/api'
import { tokenStorage } from '../utils/tokenStorage'

export function AuthProvider({ children }) {
  // Se recupera la sesión guardada para no perderla al recargar la página
  const [user, setUser] = useState(() => tokenStorage.getUser())

  const logout = useCallback(() => {
    tokenStorage.clear()
    setUser(null)
  }, [])

  const toast = useToast()

  // Si el refresh falla, se cierra la sesión y se avisa por qué se volvió al login
  useEffect(() => {
    setSessionExpiredHandler(() => {
      logout()
      toast.info('Tu sesión expiró. Vuelve a iniciar sesión.')
    })
  }, [logout, toast])

  // Guarda los tokens y pide los datos completos del usuario (id y nombre) a GET /users/me.
  // remember decide si la sesión sobrevive a cerrar el navegador (ver tokenStorage).
  const startSession = async (data, remember = true) => {
    tokenStorage.setRemember(remember)
    tokenStorage.setTokens(data.accessToken, data.refreshToken)
    try {
      const me = await userService.getMe()
      tokenStorage.setUser(me)
      setUser(me)
      return me
    } catch (error) {
      tokenStorage.clear()
      throw error
    }
  }

  // remember viene del check "Recordarme" del login; no se manda al backend
  const login = async ({ remember = true, ...credentials }) =>
    startSession(await authService.login(credentials), remember)

  // El registro también devuelve tokens, así que el usuario queda logueado
  const register = async (data) => startSession(await authService.register(data))

  const value = {
    user,
    isAuthenticated: user !== null,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
