import { Suspense } from 'react'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import PrivateRoute from './components/PrivateRoute'
import { useAuth } from './hooks/useAuth'
import PageLoader from './components/ui/PageLoader'
import { lazyPage } from './utils/lazyPage'

// Cada página se carga solo cuando se visita. lazyPage recarga sola la web si mientras estaba abierta
// se publicó una versión nueva y el archivo de la página cambió de nombre.
const Login = lazyPage(() => import('./pages/Login'))
const Register = lazyPage(() => import('./pages/Register'))
const Home = lazyPage(() => import('./pages/Home'))
const Landing = lazyPage(() => import('./pages/Landing'))
const NotFound = lazyPage(() => import('./pages/NotFound'))
const SessionExpired = lazyPage(() => import('./pages/SessionExpired'))
const ProjectsExplore = lazyPage(() => import('./pages/projects/ProjectsExplore'))
const ProjectDetail = lazyPage(() => import('./pages/projects/ProjectDetail'))
const ProjectCreate = lazyPage(() => import('./pages/projects/ProjectCreate'))
const ProjectEdit = lazyPage(() => import('./pages/projects/ProjectEdit'))
const MyProjects = lazyPage(() => import('./pages/projects/MyProjects'))
const MyApplications = lazyPage(() => import('./pages/applications/MyApplications'))
const ProjectApplications = lazyPage(() => import('./pages/applications/ProjectApplications'))
const MyContracts = lazyPage(() => import('./pages/contracts/MyContracts'))
const ContractDetail = lazyPage(() => import('./pages/contracts/ContractDetail'))
const ContractMetrics = lazyPage(() => import('./pages/contracts/ContractMetrics'))
const EditMyProfile = lazyPage(() => import('./pages/freelancers/EditMyProfile'))
const FreelancerProfile = lazyPage(() => import('./pages/freelancers/FreelancerProfile'))
const AdminPayments = lazyPage(() => import('./pages/admin/AdminPayments'))
const AdminReports = lazyPage(() => import('./pages/admin/AdminReports'))
const AdminCarnets = lazyPage(() => import('./pages/admin/AdminCarnets'))
const LegalPage = lazyPage(() => import('./pages/legal/LegalPage'))
const PaymentReturn = lazyPage(() => import('./pages/PaymentReturn'))

// En "/" quien no inició sesión ve la landing; con sesión, su resumen
// Antes se postulaba en /projects/:id/apply; ahora el formulario está en el detalle del proyecto
function ApplyRedirect() {
  const { id } = useParams()
  return <Navigate to={`/projects/${id}`} replace />
}

function Start() {
  const { user } = useAuth()
  return user ? <Home /> : <Landing />
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Start />} />
        <Route path="/session-expired" element={<SessionExpired />} />
        <Route path="/terminos" element={<LegalPage doc="terms" />} />
        <Route path="/privacidad" element={<LegalPage doc="privacy" />} />
        {/* Página puente del pago desde la app (pública: en el navegador del celular no hay sesión) */}
        <Route path="/pago-listo" element={<PaymentReturn />} />

        {/* Requieren sesión */}
        <Route element={<PrivateRoute />}>
          <Route path="/projects" element={<ProjectsExplore />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/contracts" element={<MyContracts />} />
          <Route path="/contracts/:id" element={<ContractDetail />} />
          <Route path="/contracts/:id/metricas" element={<ContractMetrics />} />
          <Route path="/freelancers/:userId" element={<FreelancerProfile />} />
        </Route>

        {/* Solo clientes */}
        <Route element={<PrivateRoute roles={['CLIENT']} />}>
          <Route path="/projects/new" element={<ProjectCreate />} />
          <Route path="/my-projects" element={<MyProjects />} />
          <Route path="/projects/:id/applications" element={<ProjectApplications />} />
        </Route>

        {/* Dueño del proyecto o admin (el backend valida que sea el dueño) */}
        <Route element={<PrivateRoute roles={['CLIENT', 'ADMIN']} />}>
          <Route path="/projects/:id/edit" element={<ProjectEdit />} />
        </Route>

        {/* Solo freelancers */}
        <Route element={<PrivateRoute roles={['FREELANCER']} />}>
          <Route path="/projects/:id/apply" element={<ApplyRedirect />} />
          <Route path="/my-applications" element={<MyApplications />} />
          <Route path="/profile/edit" element={<EditMyProfile />} />
        </Route>

        {/* Solo administradores */}
        <Route element={<PrivateRoute roles={['ADMIN']} />}>
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/carnets" element={<AdminCarnets />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}