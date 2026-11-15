import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ButtonLink from '../../components/projects/ButtonLink'
import ErrorBox from '../../components/projects/ErrorBox'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import ErrorState from '../../components/ui/ErrorState'
import { ERROR_ICONS } from '../../components/ui/errorIcons'
import FilterChips from '../../components/ui/FilterChips'
import Modal from '../../components/ui/Modal'
import TableSkeleton from '../../components/ui/TableSkeleton'
import { useListParams } from '../../hooks/useListParams'
import { useMyApplicationsWithProjects } from '../../hooks/useMyApplications'
import { applicationService } from '../../services/applicationService'
import { APPLICATION_STATUS } from '../../utils/applicationStatus'
import { errorMessage } from '../../utils/errorMessage'
import { formatBudget, formatDate } from '../../utils/format'
import PropTypes from 'prop-types'
import { idType } from '../../utils/propShapes'

// Al retirar una postulación el backend la borra, así que no hay filtro "Retiradas"
const FILTERS = ['ALL', 'PENDING', 'ACCEPTED', 'REJECTED']
const FILTER_LABELS = { ALL: 'Todas', PENDING: 'Pendientes', ACCEPTED: 'Aceptadas', REJECTED: 'Rechazadas' }
const COLUMNS =
  'lg:grid-cols-[minmax(0,2fr)_minmax(0,0.75fr)_minmax(0,0.85fr)_minmax(0,0.85fr)_minmax(0,0.8fr)_minmax(0,0.6fr)]'

function Icon({ children, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  )
}

const BriefcaseIcon = () => (
  <Icon size={17}>
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" />
  </Icon>
)

const SendIcon = ({ size }) => (
  <Icon size={size}>
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </Icon>
)

// "01", "12": el resumen del diseño muestra dos dígitos
const twoDigits = (value) => String(value).padStart(2, '0')

// Pantalla 409 del diseño: la postulación ya no se puede retirar porque el cliente la respondió
function WithdrawConflict({ conflict, current, onBack }) {
  const project = `«${conflict.projectTitle}»`
  const back = (
    <Button variant="secondary" onClick={onBack}>
      {ERROR_ICONS.back}
      Volver a postulaciones
    </Button>
  )

  if (current?.status === 'ACCEPTED') {
    return (
      <ErrorState
        status={409}
        anim="celebra"
        title={['Tu propuesta ya', 'fue aceptada.']}
        text={`El cliente aceptó tu postulación a ${project}, así que ya no se puede retirar.`}
        seal={{ strong: 'El pago ya está en garantía.', text: 'Puedes empezar cuando quieras.' }}
        actions={
          <>
            <ButtonLink to={current.contract ? `/contracts/${current.contract.id}` : '/contracts'}>
              {ERROR_ICONS.document}
              Ver contrato
            </ButtonLink>
            {back}
          </>
        }
      />
    )
  }

  if (current?.status === 'REJECTED') {
    return (
      <ErrorState
        status={409}
        title={['Tu propuesta ya', 'fue revisada.']}
        text={`El cliente ya respondió tu postulación a ${project}, así que ya no se puede retirar.`}
        actions={
          <>
            <ButtonLink to="/projects">
              {ERROR_ICONS.search}
              Explorar proyectos
            </ButtonLink>
            {back}
          </>
        }
      />
    )
  }

  return <ErrorState status={409} message={conflict.message} actions={back} />
}

// Franja oscura con los números de arriba: pendientes, aceptadas y cuántas ya tuvieron respuesta del cliente
function Summary({ applications }) {
  const count = (status) => applications.filter((application) => application.status === status).length
  const answered = count('ACCEPTED') + count('REJECTED')
  const rate = applications.length ? `${Math.round((answered / applications.length) * 100)}%` : '—'
  const stats = [
    { label: 'PENDIENTES', value: twoDigits(count('PENDING')) },
    { label: 'ACEPTADAS', value: twoDigits(count('ACCEPTED')) },
    { label: 'TASA DE RESPUESTA', value: rate },
  ]

  return (
    <section
      aria-label="Resumen de tus postulaciones"
      className="mb-[35px] grid grid-cols-3 overflow-hidden rounded-[15px] bg-ink text-white lg:grid-cols-[0.7fr_0.7fr_0.7fr_1.9fr]"
    >
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col gap-[7px] border-r border-[#393934] px-3 py-4 lg:p-[22px]">
          <span className="text-[9px] tracking-[0.1em] text-[#8f8d86]">{stat.label}</span>
          <strong className="text-[26px] font-semibold tabular-nums">{stat.value}</strong>
        </div>
      ))}
      <p className="col-span-3 flex items-center gap-2.5 border-t border-[#393934] p-4 text-[11px] leading-normal text-[#aaa8a0] lg:col-span-1 lg:border-t-0 lg:p-[22px]">
        <span className="shrink-0 text-lime">
          <Icon>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </Icon>
        </span>
        Las propuestas pendientes pueden retirarse hasta que el cliente las acepte o las rechace.
      </p>
    </section>
  )
}

// Fila de la tabla. En pantallas chicas se ve como tarjeta y en grandes como fila con 6 columnas.
function ApplicationRow({ application, onWithdraw }) {
  const status = APPLICATION_STATUS[application.status]
  const subtitle = [application.contract?.clientName, application.project?.location].filter(Boolean).join(' · ')

  return (
    <li
      className={`grid grid-cols-2 items-center gap-x-4 gap-y-3 border-t border-line px-5 py-4 text-[13px] lg:min-h-20 lg:gap-y-0 ${COLUMNS}`}
    >
      <Link
        to={`/projects/${application.projectId}`}
        className="group col-span-2 flex min-w-0 items-center gap-2.5 rounded-md lg:col-span-1"
      >
        <i className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-lg bg-paper text-escrow not-italic">
          <BriefcaseIcon />
        </i>
        <span className="flex min-w-0 flex-col gap-1">
          <strong className="truncate font-semibold group-hover:underline">{application.projectTitle}</strong>
          {subtitle && <small className="truncate text-[11px] text-muted">{subtitle}</small>}
        </span>
      </Link>
      <span>
        <Badge color={status?.color}>{status?.label ?? application.status}</Badge>
      </span>
      <span className="flex flex-col">
        <span className="text-[10px] text-muted lg:hidden">Tu propuesta</span>
        <strong className="tabular-nums">{formatBudget(application.proposedPrice)}</strong>
      </span>
      <span className="flex flex-col">
        <span className="text-[10px] text-muted lg:hidden">Presupuesto</span>
        <span className="tabular-nums">{application.project ? formatBudget(application.project.budget) : '—'}</span>
      </span>
      <span className="text-muted lg:text-ink">
        <span className="lg:hidden">Enviada el </span>
        {formatDate(application.createdAt)}
      </span>
      <span className="text-right lg:text-left">
        {application.status === 'PENDING' && (
          <button
            type="button"
            onClick={() => onWithdraw(application)}
            className="cursor-pointer text-[11px] font-semibold text-error underline hover:no-underline"
          >
            Retirar<span className="sr-only"> postulación a {application.projectTitle}</span>
          </button>
        )}
        {application.status === 'ACCEPTED' && (
          <Link
            to={application.contract ? `/contracts/${application.contract.id}` : '/contracts'}
            className="text-[11px] font-semibold text-escrow underline hover:no-underline"
          >
            Ver contrato<span className="sr-only"> de {application.projectTitle}</span>
          </Link>
        )}
        {application.status !== 'PENDING' && application.status !== 'ACCEPTED' && (
          <span className="text-muted" aria-label="Sin acciones">
            —
          </span>
        )}
      </span>
    </li>
  )
}

// Mis postulaciones del diseño: resumen, filtros por estado y la tabla para retirar o ir al contrato.
// El filtro queda en la URL (?estado=PENDING), así se puede volver atrás sin perderlo.
export default function MyApplications() {
  const location = useLocation()
  const list = useListParams()
  const { data: applications, loading, error, status, reload } = useMyApplicationsWithProjects()

  // Postulación que se quiere retirar; mientras sea null, la ventana de confirmación está cerrada
  const [toWithdraw, setToWithdraw] = useState(null)
  const [withdrawing, setWithdrawing] = useState(false)
  const [actionError, setActionError] = useState(null)
  // Postulación que no se pudo retirar porque cambió de estado mientras tanto
  const [conflict, setConflict] = useState(null)

  const filter = FILTERS.includes(list.status) ? list.status : 'ALL'
  const all = applications ?? []
  const visible = filter === 'ALL' ? all : all.filter((application) => application.status === filter)
  const filterOptions = FILTERS.map((value) => ({
    value,
    label: FILTER_LABELS[value],
    count: value === 'ALL' ? all.length : all.filter((application) => application.status === value).length,
  }))

  const closeWithdraw = () => {
    if (!withdrawing) setToWithdraw(null)
  }

  const handleWithdraw = async () => {
    setWithdrawing(true)
    setActionError(null)
    try {
      await applicationService.withdraw(toWithdraw.id)
      reload()
    } catch (err) {
      // 409: el cliente ya respondió la postulación. Se recarga la lista para saber si la aceptó o la rechazó.
      if (err.response?.status === 409) {
        setConflict({ id: toWithdraw.id, projectTitle: toWithdraw.projectTitle, message: errorMessage(err) })
        reload()
      } else {
        setActionError(errorMessage(err))
      }
    } finally {
      setWithdrawing(false)
      setToWithdraw(null)
    }
  }

  if (conflict && !loading) {
    return (
      <main className="mx-auto w-full max-w-[1200px] px-5">
        <WithdrawConflict
          conflict={conflict}
          current={applications?.find((application) => application.id === conflict.id)}
          onBack={() => setConflict(null)}
        />
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-[1248px] px-4 pb-20 pt-[45px] md:px-6 md:pb-[120px] md:pt-[70px]">
      <header className="mb-[35px] flex flex-col items-start gap-[22px] md:mb-[50px] md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.13em]">ESPACIO FREELANCER</p>
          <h1 className="mb-2 mt-3.5 text-[39px] font-semibold leading-none tracking-[-0.04em] md:text-[47px]">Mis postulaciones</h1>
          <p className="text-muted">Sigue tus propuestas y retira las que ya no puedas atender.</p>
        </div>
        <ButtonLink to="/projects" className="w-full md:w-auto">
          <Icon>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </Icon>
          Explorar proyectos
        </ButtonLink>
      </header>

      {location.state?.message && (
        <p role="status" className="mb-5 rounded-[10px] bg-escrow-light px-3.5 py-3 text-sm text-escrow">
          {location.state.message}
        </p>
      )}
      {actionError && (
        <p role="alert" className="mb-5 rounded-[10px] bg-error-light px-3.5 py-3 text-sm text-error">
          {actionError}
        </p>
      )}

      {error && <ErrorBox message={error} status={status} onRetry={reload} />}

      {loading && (
        <TableSkeleton
          columns={COLUMNS}
          cells={['project', 'pill', 'line', 'line', 'line', 'line']}
          label="Cargando postulaciones…"
        />
      )}

      {applications && (
        <>
          <Summary applications={all} />

          <div className="mb-[15px] overflow-x-auto pb-1">
            <FilterChips label="Filtrar por estado" options={filterOptions} value={filter} onChange={list.setStatus} />
          </div>

          <div className="overflow-hidden rounded-[15px] border border-line bg-surface">
            <div
              aria-hidden="true"
              className={`hidden min-h-[43px] items-center gap-x-4 bg-[#efede7] px-5 text-[10px] font-semibold tracking-[0.09em] text-muted lg:grid ${COLUMNS}`}
            >
              <span>PROYECTO</span>
              <span>ESTADO</span>
              <span>TU PROPUESTA</span>
              <span>PRESUPUESTO</span>
              <span>ENVIADA</span>
              <span />
            </div>

            {visible.length > 0 ? (
              <ul aria-label="Postulaciones">
                {visible.map((application) => (
                  <ApplicationRow key={application.id} application={application} onWithdraw={setToWithdraw} />
                ))}
              </ul>
            ) : (
              <div className="flex min-h-[260px] flex-col items-center justify-center border-t border-line px-6 text-center text-muted lg:border-t-0">
                <SendIcon size={25} />
                <h2 className="mb-1.5 mt-4 font-semibold text-ink">
                  {all.length === 0 ? 'Todavía no tienes postulaciones' : 'No hay postulaciones con este estado'}
                </h2>
                <p className="text-xs">
                  {all.length === 0
                    ? 'Explora los proyectos abiertos y postula al que te interese.'
                    : 'Prueba con otro filtro o explora nuevos proyectos.'}
                </p>
              </div>
            )}
          </div>
        </>
      )}

      <Modal
        open={toWithdraw !== null}
        onClose={closeWithdraw}
        icon={<SendIcon size={24} />}
        iconTone="amber"
        kicker="RETIRAR POSTULACIÓN"
        title="¿Ya no puedes tomar este proyecto?"
      >
        <p className="text-[13px] leading-relaxed text-muted">
          Retirarás tu propuesta para «{toWithdraw?.projectTitle}» y el cliente dejará de verla. Podrás volver a postular
          mientras el proyecto siga abierto.
        </p>
        {/* "Mantener" va primero en el código para que el foco caiga ahí al abrir (un Enter no retira por error);
            flex-col-reverse lo deja debajo, como en el diseño */}
        <div className="mt-6 flex flex-col-reverse gap-2">
          <Button variant="ghost" onClick={closeWithdraw} disabled={withdrawing} className="w-full">
            Mantener propuesta
          </Button>
          <Button variant="danger" onClick={handleWithdraw} loading={withdrawing} className="w-full">
            {withdrawing ? 'Retirando…' : 'Sí, retirar postulación'}
          </Button>
        </div>
      </Modal>
    </main>
  )
}

Icon.propTypes = {
  children: PropTypes.node,
  size: PropTypes.number,
}

SendIcon.propTypes = {
  size: PropTypes.number,
}

WithdrawConflict.propTypes = {
  conflict: PropTypes.shape({ id: idType, projectTitle: PropTypes.string, message: PropTypes.string }).isRequired,
  current: PropTypes.shape({ status: PropTypes.string, contract: PropTypes.shape({ id: idType }) }),
  onBack: PropTypes.func.isRequired,
}

Summary.propTypes = {
  applications: PropTypes.arrayOf(PropTypes.shape({ status: PropTypes.string })).isRequired,
}

ApplicationRow.propTypes = {
  application: PropTypes.shape({
    id: idType.isRequired,
    projectId: idType,
    projectTitle: PropTypes.string,
    proposedPrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    status: PropTypes.string,
    createdAt: PropTypes.string,
    project: PropTypes.shape({ budget: PropTypes.oneOfType([PropTypes.number, PropTypes.string]), location: PropTypes.string }),
    contract: PropTypes.shape({ id: idType, clientName: PropTypes.string }),
  }).isRequired,
  onWithdraw: PropTypes.func.isRequired,
}
