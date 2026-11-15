import { useCallback, useEffect, useRef, useState } from 'react'
import { AuthContext } from './authContext'
import { authService } from '../services/authService'
import { userService } from '../services/userService'
import { useToast } from '../hooks/useToast'
import { setSessionExpiredHandler } from '../services/api'
import { tokenStorage } from '../utils/tokenStorage'
import PropTypes from 'prop-types'

export function AuthProvider({ children }) {
  // Se recupera la sesión guardada para no perderla al recargar la página
  const [user, setUser] = useState(() => tokenStorage.getUser())

  const logout = useCallback(() => {
    tokenStorage.clear()
    setUser(null)
  }, [])

  const toast = useToast()

  // Cambia los datos del usuario con sesión (por ejemplo, su foto nueva) en pantalla y en el almacenamiento
  const updateUser = useCallback((next) => {
    tokenStorage.setUser(next)
    setUser(next)
  }, [])

  // Al abrir la web con una sesión guardada, se piden de nuevo los datos del usuario: así aparece su foto
  // aunque la sesión se haya iniciado antes de subirla. Si falla, se sigue con lo guardado.
  const hadSession = useRef(user !== null)
  useEffect(() => {
    if (!hadSession.current) return
    const controller = new AbortController()
    userService
      .getMe({ signal: controller.signal })
      .then((me) => tokenStorage.getUser() && updateUser(me))
      .catch(() => {})
    return () => controller.abort()
  }, [updateUser])

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

  // Continuar con Google: idToken viene del botón de Google y rol solo se manda al crear la cuenta
  const loginWithGoogle = async (data) => startSession(await authService.google(data))

  const value = {
    user,
    isAuthenticated: user !== null,
    login,
    register,
    loginWithGoogle,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

AuthProvider.propTypes = {
  children: PropTypes.node,
}
