# DevUTEC — Web

Frontend web de DevUTEC, hecho con React y Vite.

**En vivo:** https://devutec.vercel.app · **API:** https://devutec.duckdns.org/api/v1 ([repositorio del backend](https://github.com/alissonbrena-dotcom/devutec-backend))

## Participación

Todas las integrantes cumplieron sus responsabilidades y aportaron activamente en el backend, la web y la app móvil.

| Integrante | Principales aportes | Participación |
|---|---|---|
| **Alisson Luciana Breña Dávila** | **Backend:** módulo de Proyectos y Skills (CRUD, filtros, paginación), contraseñas fuertes, pagos con Stripe en modo prueba. **Web y mobile:** módulo de Proyectos (explorar, detalle, publicar, editar, mis proyectos; distrito por GPS en la app), pago con tarjeta y regreso a la app, PropTypes. **Deploy e infraestructura:** AWS EC2 + RDS, HTTPS con Caddy y DuckDNS, despliegue continuo, Vercel, builds de EAS (APK) y variables de entorno del servidor. | 100 % |
| **Camila Gomez Arias** | **Backend:** módulos de Postulaciones y Contratos (pago en garantía al aceptar), eventos y correos asíncronos, manejo de errores, GitHub Actions, colección de Postman, fecha de aceptación de términos. **Web:** kit de componentes con Tailwind (Button, Input, Card, Modal, Pagination…), postulaciones, contratos y reseñas, términos y privacidad. **Mobile:** postulaciones y contratos con confirmación biométrica. | 100 % |
| **Ariana Alejandra Isla Urbina** | **Backend:** perfil del freelancer, usuario actual, foto de perfil, celular, CORS por variable de entorno, cascadas, plantillas de correo y documentación del README. **Web:** rediseño según el mockup (explorar, detalle, formulario, postulantes, mis postulaciones, mis proyectos, contratos, resumen del cliente, pagos del admin), pantallas de error y de carga, foto de perfil y WhatsApp. **Mobile:** escáner QR con cámara, perfil público del freelancer, repos de GitHub, foto de perfil, biometría y WhatsApp. | 100 % |
| **Nicole Valeria Yucra Castro** | **Backend:** autenticación con JWT y Spring Security, inicio de sesión con Google, asistente de ayuda con IA (Gemini). **Web:** base del proyecto (Vite, cliente axios, renovación del token, rutas protegidas y carga diferida), login y registro, toasts, error boundary, reintentos, Google y chat de Cuyi. **Mobile:** sistema de diseño con modo claro y oscuro, animaciones, bienvenida, login y registro, aviso sin conexión, Google y ayuda con Cuyi. | 100 % |

## Cómo correrlo

```bash
cp .env.example .env
npm install
npm run dev
```

La app abre en http://localhost:5173.

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base de la API, con `/api/v1` al final |
| `VITE_GOOGLE_CLIENT_ID` | ID de cliente OAuth de Google (tipo Web). Opcional: si está vacío, no aparece el botón "Continuar con Google" |

## Estructura

```
src/
├── components/   componentes reutilizables (PrivateRoute, kit de componentes)
├── contexts/     AuthContext y AuthProvider
├── hooks/        hooks propios (useAuth, useProjects...)
├── pages/        una página por ruta
├── services/     llamadas a la API, una por módulo (authService, projectService...)
├── utils/        utilidades (tokenStorage)
└── routes.jsx    todas las rutas de la app
```

## Cómo llamar a la API

Cada módulo tiene su service en `src/services` y usa el cliente `api`, que ya tiene la URL base, agrega el token y lo renueva solo cuando vence. No hay que poner headers a mano.

```js
// src/services/projectService.js
import api from './api'

export const projectService = {
  getAll: (params) => api.get('/projects', { params }).then((res) => res.data),
  getById: (id) => api.get(`/projects/${id}`).then((res) => res.data),
}
```

## Usuario actual

```js
import { useAuth } from '../hooks/useAuth'

const { user, isAuthenticated, login, register, logout } = useAuth()
// user = { id, nombre, email, rol } con rol CLIENT, FREELANCER o ADMIN (viene de GET /users/me)
```

## Cómo proteger una ruta

Las rutas se agregan en `src/routes.jsx`, con la página cargada con `lazy`:

```jsx
const MyProjects = lazy(() => import('./pages/MyProjects'))

// Cualquier usuario con sesión
<Route element={<PrivateRoute />}>
  <Route path="/contracts" element={<Contracts />} />
</Route>

// Solo un rol
<Route element={<PrivateRoute roles={['CLIENT']} />}>
  <Route path="/projects/me" element={<MyProjects />} />
</Route>
```

Sin sesión, `PrivateRoute` manda a `/login` y después del login se vuelve a la ruta pedida. Con un rol que no corresponde, manda a `/`.

## Renovación del token

El access token dura 15 minutos. Cuando una petición recibe 401, el interceptor de `services/api.js` pide un token nuevo a `/auth/refresh` y reintenta la petición una sola vez. Si varias peticiones reciben 401 al mismo tiempo, todas esperan la misma renovación. Si el refresh también falla, se cierra la sesión.

## Mensajes de error

`utils/errorMessage.js` convierte cualquier error de axios en un texto para la pantalla:

| Caso | Mensaje |
|---|---|
| 400 | El mensaje de validación del backend |
| 401 | Tu sesión expiró |
| 403 | No tienes permiso |
| 404 | No encontramos lo que buscas |
| 409 | El mensaje del backend (por ejemplo, ya postulaste) |
| 500 o más | El servidor tuvo un problema |
| Timeout o sin conexión | Aviso de conexión |

```js
try {
  await projectService.create(data)
} catch (error) {
  setError(errorMessage(error))
}
```

Las peticiones GET que fallan por conexión, timeout o 502/503/504 se reintentan solas hasta dos veces antes de llegar al `catch`.

## Toasts

Para avisos cortos que se cierran solos:

```js
import { useToast } from '../hooks/useToast'

const toast = useToast()
toast.success('Proyecto creado')
toast.error(errorMessage(error))
```

## Error boundary

Si un componente lanza un error al renderizar, `components/ErrorBoundary.jsx` muestra una pantalla de "Algo salió mal" con botones para recargar o volver al inicio, en lugar de dejar la página en blanco.

## Deploy

La web está publicada en **Vercel**, conectada a este repositorio:

- **Producción:** cada merge a `main` se compila y se publica solo en https://devutec.vercel.app.
- **Vista previa por PR:** cada pull request recibe un link propio para ver los cambios antes de unirlos. Esas vistas previas tienen otra dirección y el backend no las acepta por CORS, así que sirven para revisar la interfaz; para probar con datos se usa producción o `localhost`.
- **Configuración en Vercel:** preset Vite (`npm run build`, carpeta `dist`) y la variable `VITE_API_URL=https://devutec.duckdns.org/api/v1` para Production y Preview.
- **Rutas:** `vercel.json` redirige todas las rutas a `index.html`, para que al recargar o abrir un link directo (por ejemplo `/projects/5`) cargue la app en vez de dar 404.

### Inicio de sesión con Google

El botón "Continuar con Google" de Ingresar y Crear cuenta solo aparece si `VITE_GOOGLE_CLIENT_ID` está configurado. Para activarlo:

1. En **Google Cloud Console → APIs y servicios → Credenciales**, crear un ID de cliente OAuth de tipo **Aplicación web** con estos **orígenes de JavaScript autorizados**: `https://devutec.vercel.app` y `http://localhost:5173`.
2. En **Vercel**, agregar `VITE_GOOGLE_CLIENT_ID` con ese ID (Production y Preview) y volver a desplegar.
3. En el **servidor**, poner el mismo ID en `GOOGLE_CLIENT_IDS` (ver `deploy/README.md` del backend), porque el backend valida que el token de Google sea para esta app.

Mientras la pantalla de consentimiento de Google esté en modo prueba, solo pueden entrar los correos agregados como usuarios de prueba.

### Conexión con el backend

La API corre en **AWS EC2** con base de datos en **RDS**, detrás de **Caddy** con HTTPS (certificado de Let's Encrypt y dominio de DuckDNS), y se despliega sola cuando cambia el backend. Por seguridad solo acepta peticiones de los orígenes listados en `CORS_ALLOWED_ORIGINS` del servidor:

```
https://devutec.vercel.app, https://devutec-frontend.vercel.app, http://localhost:5173
```

Si la web cambia de dominio, hay que agregarlo a esa variable y reiniciar la API (detalle en [`deploy/README.md`](https://github.com/alissonbrena-dotcom/devutec-backend/blob/main/deploy/README.md) del backend).
