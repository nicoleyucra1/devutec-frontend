// Guarda la sesión del navegador. En mobile se reemplaza por expo-secure-store.
// Con "Recordarme" va a localStorage y sobrevive a cerrar el navegador; sin él va a sessionStorage y se borra al
// cerrar la pestaña.
const ACCESS_KEY = 'devutec.accessToken'
const REFRESH_KEY = 'devutec.refreshToken'
const USER_KEY = 'devutec.user'
const KEYS = [ACCESS_KEY, REFRESH_KEY, USER_KEY]

// Al cargar la página se sigue usando el almacenamiento donde quedó la sesión anterior
let store = sessionStorage.getItem(ACCESS_KEY) ? sessionStorage : localStorage

export const tokenStorage = {
  getAccessToken: () => store.getItem(ACCESS_KEY),
  getRefreshToken: () => store.getItem(REFRESH_KEY),

  // Se llama al iniciar sesión, antes de guardar los tokens
  setRemember(remember) {
    tokenStorage.clear()
    store = remember ? localStorage : sessionStorage
  },

  setTokens(accessToken, refreshToken) {
    store.setItem(ACCESS_KEY, accessToken)
    store.setItem(REFRESH_KEY, refreshToken)
  },

  getUser() {
    const user = store.getItem(USER_KEY)
    return user ? JSON.parse(user) : null
  },

  setUser(user) {
    store.setItem(USER_KEY, JSON.stringify(user))
  },

  clear() {
    KEYS.forEach((key) => {
      localStorage.removeItem(key)
      sessionStorage.removeItem(key)
    })
  },
}
