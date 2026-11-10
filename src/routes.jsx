import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import PrivateRoute from './components/PrivateRoute'

// Cada página se carga solo cuando se visita
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Home = lazy(() => import('./pages/Home'))
const NotFound = lazy(() => import('./pages/NotFound'))
const ProjectsExplore = lazy(() => import('./pages/projects/ProjectsExplore'))
const ProjectDetail = lazy(() => import('./pages/projects/ProjectDetail'))
const ProjectCreate = lazy(() => import('./pages/projects/ProjectCreate'))
const ProjectEdit = lazy(() => import('./pages/projects/ProjectEdit'))
const MyProjects = lazy(() => import('./pages/projects/MyProjects'))
const ApplyToProject = lazy(() => import('./pages/applications/ApplyToProject'))
const MyApplications = lazy(() => import('./pages/applications/MyApplications'))
const ProjectApplications = lazy(() => import('./pages/applications/ProjectApplications'))
const MyContracts = lazy(() => import('./pages/contracts/MyContracts'))
const ContractDetail = lazy(() => import('./pages/contracts/ContractDetail'))
const EditMyProfile = lazy(() => import('./pages/freelancers/EditMyProfile'))
const FreelancerProfile = lazy(() => import('./pages/freelancers/FreelancerProfile'))
const AdminPayments = lazy(() => import('./pages/admin/AdminPayments'))

export default function AppRoutes() {
  return (
    <Suspense fallback={<p>Cargando...</p>}>
      <Routes>
        {/* Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Requieren sesión */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<ProjectsExplore />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/contracts" element={<MyContracts />} />
          <Route path="/contracts/:id" element={<ContractDetail />} />
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
          <Route path="/projects/:id/apply" element={<ApplyToProject />} />
          <Route path="/my-applications" element={<MyApplications />} />
          <Route path="/profile/edit" element={<EditMyProfile />} />
        </Route>

        {/* Solo administradores */}
        <Route element={<PrivateRoute roles={['ADMIN']} />}>
          <Route path="/admin/payments" element={<AdminPayments />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}