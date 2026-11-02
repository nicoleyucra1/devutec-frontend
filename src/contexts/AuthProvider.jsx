import { useCallback, useEffect, useState } from 'react'
import { AuthContext } from './authContext'
import { authService } from '../services/authService'
import { userService } from '../services/userService'
import { setSessionExpiredHandler } from '../services/api'
import { tokenStorage } from '../utils/tokenStorage'

export function AuthProvider({ children }) {
  // Se recupera la sesión guardada para no perderla al recargar la página
  const [user, setUser] = useState(() => tokenStorage.getUser())

  const logout = useCallback(() => {
    tokenStorage.clear()
    setUser(null)
  }, [])

  useEffect(() => {
    setSessionExpiredHandler(logout)
  }, [logout])

  // Guarda los tokens y pide los datos completos del usuario (id y nombre) a GET /users/me
  const startSession = async (data) => {
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

  const login = async (credentials) => startSession(await authService.login(credentials))

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
