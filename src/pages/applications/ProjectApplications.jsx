import { useState } from 'react'
import { useParams } from 'react-router-dom'
import AcceptProposalDialog from '../../components/applications/AcceptProposalDialog'
import ProposalCard from '../../components/applications/ProposalCard'
import Cuyi from '../../components/brand/Cuyi'
import ButtonLink from '../../components/projects/ButtonLink'
import ErrorBox from '../../components/projects/ErrorBox'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import LoadingNotice from '../../components/ui/LoadingNotice'
import Skeleton from '../../components/ui/Skeleton'
import { useApplicants } from '../../hooks/useApplicants'
import { useMyContracts } from '../../hooks/useContracts'
import { useProject } from '../../hooks/useProject'
import { useToast } from '../../hooks/useToast'
import { applicationService } from '../../services/applicationService'
import { errorMessage } from '../../utils/errorMessage'
import { formatBudget } from '../../utils/format'

// Primero la aceptada, luego las pendientes (de la más antigua a la más nueva) y al final las rechazadas
const ORDER = { ACCEPTED: 0, PENDING: 1, REJECTED: 2 }
const byStatus = (a, b) => ORDER[a.status] - ORDER[b.status] || String(a.createdAt).localeCompare(String(b.createdAt))

function ShieldIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-5" />
    </svg>
  )
}

function CardsLoading() {
  return (
    <div aria-busy="true" className="grid gap-[22px] md:grid-cols-3 md:gap-3">
      <p role="status" className="sr-only">
        Cargando postulantes…
      </p>
      {[0, 1, 2].map((card) => (
        <div key={card} aria-hidden="true" className="rounded-2xl border border-line bg-surface p-6">
          <div className="flex items-center gap-[11px]">
            <Skeleton className="h-[52px] w-[52px] shrink-0 rounded-full" />
            <div className="grid flex-1 gap-2">
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-2.5 w-1/2" />
            </div>
          </div>
          <Skeleton className="my-6 h-[70px] w-full" />
          <div className="grid gap-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="mt-[25px] h-[46px] w-full rounded-[11px]" />
        </div>
      ))}
    </div>
  )
}

// Postulantes del diseño: las propuestas lado a lado para compararlas, con aceptar (crea el contrato y retiene el
// pago) y rechazar. Solo lo ve el cliente dueño del proyecto; el backend responde 403 a cualquier otra persona.
export default function ProjectApplications() {
  const { id } = useParams()
  const toast = useToast()
  const project = useProject(id)
  const applicants = useApplicants(id)
  const contracts = useMyContracts()

  const [selectedId, setSelectedId] = useState(null)
  const [accepting, setAccepting] = useState(null)
  const [rejecting, setRejecting] = useState(null)
  const [busy, setBusy] = useState(false)

  const list = [...(applicants.data ?? [])].sort(byStatus)
  const pending = list.filter((application) => application.status === 'PENDING')
  const accepted = list.find((application) => application.status === 'ACCEPTED')
  const canDecide = project.data?.status === 'OPEN'
  // Si nadie eligió todavía, se marca la primera pendiente
  const selected = pending.find((application) => application.id === selectedId) ?? pending[0]

  // El contrato vigente del proyecto (uno cancelado no cuenta: el proyecto vuelve a recibir postulaciones)
  const contract = (contracts.data ?? [])
    .filter((item) => item.projectId === Number(id) && item.status !== 'CANCELLED')
    .sort((a, b) => b.id - a.id)[0]
  const showAccepted = accepted && !canDecide

  const refresh = () => {
    applicants.reload()
    project.reload()
    contracts.reload()
  }

  const handleAccept = async () => {
    setBusy(true)
    try {
      await applicationService.accept(accepting.id)
      toast.success(`Contrataste a ${accepting.freelancerName}. El pago quedó en garantía.`)
      setAccepting(null)
      refresh()
    } catch (error) {
      toast.error(errorMessage(error))
      setAccepting(null)
      refresh()
    } finally {
      setBusy(false)
    }
  }

  const handleReject = async () => {
    setBusy(true)
    try {
      await applicationService.reject(rejecting.id)
      toast.success(`Rechazaste la propuesta de ${rejecting.freelancerName}`)
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setBusy(false)
      setRejecting(null)
      applicants.reload()
    }
  }

  const count = applicants.data?.length
  const loading = applicants.loading || project.loading

  return (
    <main className="mx-auto w-full max-w-[1248px] px-4 pb-20 pt-[45px] md:px-6 md:pb-[120px] md:pt-[70px]">
      <LoadingNotice loading={loading} what="los postulantes" />
      <Breadcrumbs
        items={[
          { label: 'Mis proyectos', to: '/my-projects' },
          { label: project.data?.title, to: `/projects/${id}` },
          { label: 'Postulantes' },
        ]}
      />

      {(project.error || applicants.error) && (
        <ErrorBox
          message={project.error ?? applicants.error}
          status={project.status ?? applicants.status}
          onRetry={() => (project.error ? project.reload() : applicants.reload())}
        />
      )}

      {!project.error && !applicants.error && (
        <>
          <header className="mb-[35px] mt-8 flex flex-col items-start gap-[22px] md:mb-[50px] md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-[0.13em]">
                {count === undefined ? 'POSTULACIONES' : `${count} ${count === 1 ? 'POSTULACIÓN' : 'POSTULACIONES'}`}
              </p>
              {project.data ? (
                <h1 className="mb-2 mt-3.5 text-[39px] font-semibold leading-none tracking-[-0.04em] md:text-[47px]">{project.data.title}</h1>
              ) : (
                <Skeleton className="mb-2 mt-3.5 h-11 w-72 max-w-full" />
              )}
              <p className="text-muted">Compara la propuesta y el precio de cada postulante antes de elegir.</p>
            </div>
            <div className="flex flex-col items-start md:items-end">
              <span className="text-[10px] tracking-[0.1em] text-muted">PRESUPUESTO DEL PROYECTO</span>
              {project.data ? (
                <strong className="mt-[5px] text-[30px] font-semibold tabular-nums">{formatBudget(project.data.budget)}</strong>
              ) : (
                <Skeleton className="mt-2 h-8 w-32" />
              )}
            </div>
          </header>

          {showAccepted && (
            <div className="mb-5 flex flex-wrap items-start gap-3.5 rounded-[13px] border border-[#b8d2c1] bg-escrow-light p-[15px] text-escrow md:flex-nowrap md:items-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mt-0.5 shrink-0 md:mt-0">
                <path d="m5 12 4 4L19 6" />
              </svg>
              <div className="min-w-0 flex-1">
                <strong className="text-[13px]">Propuesta de {accepted.freelancerName.split(' ')[0]} aceptada</strong>
                <p className="mt-[3px] text-xs text-[#52705f]">
                  {project.data?.status === 'DONE'
                    ? 'El proyecto ya terminó y el pago se liberó.'
                    : `El contrato se creó y ${formatBudget(contract?.amount ?? accepted.proposedPrice)} quedaron retenidos en garantía.`}
                </p>
              </div>
              {contract && (
                <ButtonLink to={`/contracts/${contract.id}`} variant="secondary" className="w-full md:w-auto">
                  Ver contrato
                </ButtonLink>
              )}
            </div>
          )}

          {loading && <CardsLoading />}

          {!loading && count === 0 && (
            <div className="flex min-h-[380px] flex-col items-center justify-center rounded-2xl border border-line bg-surface p-[30px] text-center">
              <Cuyi anim="saluda" px={4} />
              <p className="mt-6 text-[11px] font-semibold tracking-[0.13em]">SIN POSTULACIONES</p>
              <h2 className="my-2.5 text-[25px] font-semibold tracking-[-0.02em]">Todavía nadie postuló.</h2>
              <p className="mb-[22px] max-w-[440px] text-[13px] leading-relaxed text-muted">
                Cuando un estudiante de UTEC envíe su propuesta, aparecerá aquí para que la compares con las demás.
              </p>
              <ButtonLink to={`/projects/${id}`} variant="secondary">
                Ver mi proyecto
              </ButtonLink>
            </div>
          )}

          {!loading && count > 0 && (
            <>
              <div className="grid items-stretch gap-[22px] md:grid-cols-2 md:gap-3 lg:grid-cols-3">
                {list.map((application) => (
                  <ProposalCard
                    key={application.id}
                    application={application}
                    budget={project.data?.budget}
                    selected={application.id === selected?.id}
                    canDecide={canDecide}
                    busy={busy}
                    onSelect={() => setSelectedId(application.id)}
                    onAccept={() => {
                      setSelectedId(application.id)
                      setAccepting(application)
                    }}
                    onReject={() => setRejecting(application)}
                    contractLink={
                      contract && (
                        <ButtonLink to={`/contracts/${contract.id}`} variant="secondary" className="mt-[25px] w-full">
                          Ver contrato
                        </ButtonLink>
                      )
                    }
                  />
                ))}
              </div>
              {canDecide && pending.length > 0 && (
                <p className="mt-[25px] flex items-start justify-center gap-2.5 text-xs text-muted md:items-center">
                  <span className="text-escrow">
                    <ShieldIcon />
                  </span>
                  <span>
                    <strong className="text-escrow">Elegir no significa pagar a ciegas.</strong> El dinero queda retenido en garantía y
                    solo se libera cuando apruebes la entrega.
                  </span>
                </p>
              )}
            </>
          )}
        </>
      )}

      <AcceptProposalDialog
        application={accepting}
        project={project.data}
        otherPending={pending.length - 1}
        busy={busy}
        onConfirm={handleAccept}
        onClose={() => setAccepting(null)}
      />

      <ConfirmDialog
        open={rejecting !== null}
        title="¿Rechazar esta propuesta?"
        message={rejecting ? `${rejecting.freelancerName} verá su postulación como rechazada. No se puede deshacer.` : ''}
        confirmLabel="Sí, rechazar"
        busy={busy}
        onConfirm={handleReject}
        onCancel={() => setRejecting(null)}
      />
    </main>
  )
}
