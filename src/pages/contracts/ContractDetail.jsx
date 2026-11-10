import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ContractDetailSkeleton from '../../components/contracts/ContractDetailSkeleton'
import ContractReviews from '../../components/contracts/ContractReviews'
import ContractTimeline from '../../components/contracts/ContractTimeline'
import MoneyAmount from '../../components/contracts/MoneyAmount'
import PersonCard from '../../components/contracts/PersonCard'
import TermsDialog from '../../components/contracts/TermsDialog'
import Cuyi from '../../components/brand/Cuyi'
import ErrorBox from '../../components/projects/ErrorBox'
import ErrorState from '../../components/ui/ErrorState'
import { ERROR_ICONS } from '../../components/ui/errorIcons'
import ButtonLink from '../../components/projects/ButtonLink'
import Badge from '../../components/ui/Badge'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Button from '../../components/ui/Button'
import LoadingNotice from '../../components/ui/LoadingNotice'
import Modal from '../../components/ui/Modal'
import { useAuth } from '../../hooks/useAuth'
import { useContract } from '../../hooks/useContracts'
import { useToast } from '../../hooks/useToast'
import { contractService } from '../../services/contractService'
import { CONTRACT_STATUS, contractCode, PAYMENT_STATUS } from '../../utils/contractStatus'
import { errorMessage } from '../../utils/errorMessage'
import { formatBudget, formatDate } from '../../utils/format'

const icons = {
  send: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  ),
  shield: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-5" />
    </svg>
  ),
  close: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  ),
  lock: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  ),
  clock: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
}

// Cada acción del contrato: qué endpoint llama, cómo se ve su ventana de confirmación y qué avisa al terminar
const ACTIONS = {
  deliver: {
    run: contractService.deliver,
    icon: icons.send,
    tone: 'green',
    kicker: 'ENTREGAR TRABAJO',
    title: () => '¿Listo para entregar?',
    text: (c) => `${c.clientName ?? 'El cliente'} podrá revisar tu trabajo y confirmarlo. Mientras tanto, el pago sigue retenido.`,
    summary: (c) => ['Pago retenido a tu nombre', c.amount],
    label: 'Entregar trabajo',
    busyLabel: 'Entregando...',
    back: 'Seguir trabajando',
    variant: 'primary',
    success: 'Trabajo entregado. El cliente ya puede revisarlo.',
  },
  confirm: {
    run: contractService.confirm,
    icon: icons.shield,
    tone: 'green',
    kicker: 'CONFIRMAR ENTREGA',
    title: (c) => `Vas a liberar ${formatBudget(c.amount)}`,
    text: (c) =>
      `Confirma que revisaste la entrega de ${c.freelancerName}. El pago le llegará y el contrato quedará finalizado. Esta acción no se puede deshacer.`,
    summary: (c) => [`${c.projectTitle} · ${contractCode(c.id)}`, c.amount],
    label: 'Sí, confirmar y liberar',
    busyLabel: 'Liberando pago...',
    back: 'Volver a revisar',
    variant: 'primary',
    success: 'Entrega confirmada. El pago fue liberado al freelancer.',
  },
  cancel: {
    run: contractService.cancel,
    icon: icons.close,
    tone: 'red',
    kicker: 'CANCELAR CONTRATO',
    title: () => '¿Cancelar este contrato?',
    text: (c) =>
      `Se te reembolsarán ${formatBudget(c.amount)} y el proyecto volverá a recibir postulaciones. Esta acción no se puede deshacer.`,
    summary: (c) => [`Reembolso a ${c.clientName ?? 'ti'}`, c.amount],
    label: 'Sí, cancelar contrato',
    busyLabel: 'Cancelando...',
    back: 'Mantener contrato',
    variant: 'danger',
    success: 'Contrato cancelado. El pago fue reembolsado.',
  },
}

// Texto de la tarjeta de pago según el estado
function moneyText(contract) {
  const client = contract.clientName ?? 'el cliente'
  return {
    IN_PROGRESS: 'El dinero está retenido. Nadie puede moverlo hasta que se confirme la entrega o se cancele el contrato.',
    DELIVERED: `La entrega está lista. El pago se libera en cuanto ${client} la confirme.`,
    CONFIRMED: `Pago liberado a ${contract.freelancerName}. El contrato quedó finalizado.`,
    CANCELLED: `El contrato se canceló antes de la entrega. El monto se reembolsó a ${client}.`,
  }[contract.status]
}

// Recuadro negro de la derecha: qué toca hacer ahora, distinto para cliente y freelancer
function nextStep(contract, isClient) {
  const amount = formatBudget(contract.amount)
  const firstName = contract.freelancerName?.split(' ')[0] ?? 'El freelancer'
  const client = contract.clientName ?? 'El cliente'
  switch (contract.status) {
    case 'IN_PROGRESS':
      return isClient
        ? {
            kicker: 'EN CURSO',
            title: `${firstName} está trabajando.`,
            text: `${contract.deadline ? `La entrega vence el ${formatDate(contract.deadline)}. ` : ''}Puedes cancelar mientras no haya una entrega; el monto se te reembolsa completo.`,
          }
        : {
            kicker: 'SIGUIENTE PASO',
            title: '¿Terminaste el trabajo?',
            text: `Al entregar, ${client} podrá revisarlo y confirmarlo. El pago ya está retenido a tu nombre.`,
          }
    case 'DELIVERED':
      return isClient
        ? { kicker: 'TU DECISIÓN', title: '¿Todo está como acordaron?', text: `Al confirmar, los ${amount} se liberarán a ${firstName}. Esta acción no se puede deshacer.` }
        : { kicker: 'EN REVISIÓN', title: 'Entrega enviada.', text: `${client} está revisando tu trabajo. El pago se libera en cuanto lo confirme.` }
    case 'CONFIRMED':
      return {
        kicker: 'FINALIZADO',
        title: 'Contrato finalizado.',
        text: isClient ? `Pagaste ${amount} por un trabajo que aprobaste.` : `Recibiste ${amount} por este trabajo.`,
      }
    default:
      return { kicker: 'CANCELADO', title: 'Contrato cancelado.', text: `Los ${amount} se reembolsaron a ${client}.` }
  }
}

// Página Detalle de contrato del diseño: el monto en garantía con su línea de tiempo, la entrega, las reseñas
// y a la derecha el siguiente paso, las dos partes y los términos.
export default function ContractDetail() {
  const { id } = useParams()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const { data: contract, loading, error, status: errorStatus, reload } = useContract(id)

  const [busy, setBusy] = useState(false)
  // Acción que espera confirmación en la ventana: 'deliver', 'confirm' o 'cancel'
  const [pending, setPending] = useState(null)
  const [termsOpen, setTermsOpen] = useState(false)

  // Cierra la sesión y vuelve a este contrato después de ingresar con otra cuenta
  const switchAccount = () => {
    logout()
    navigate('/login', { replace: true, state: { from: { pathname: `/contracts/${id}` } } })
  }

  const runAction = async () => {
    setBusy(true)
    try {
      await ACTIONS[pending].run(id)
      toast.success(ACTIONS[pending].success)
      setPending(null)
      reload()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const shell = (children) => <main className="mx-auto w-full max-w-[1200px] px-5 pb-20 pt-8 lg:px-6">{children}</main>

  if (loading) {
    return shell(
      <>
        <LoadingNotice loading={loading} what="el contrato" />
        <Breadcrumbs items={[{ label: 'Contratos', to: '/contracts' }, { label: '' }]} />
        <ContractDetailSkeleton />
      </>,
    )
  }

  if (error) {
    const crumbs = <Breadcrumbs items={[{ label: 'Contratos', to: '/contracts' }, { label: contractCode(id) }]} />
    // 403: el contrato existe pero la persona no es parte de él (el backend solo lo muestra a sus participantes)
    if (errorStatus === 403) {
      return shell(
        <>
          {crumbs}
          <ErrorState
            status={403}
            className="min-h-[65vh]"
            title={['Este contrato', 'no es tuyo.']}
            text="Solo el cliente y la persona contratada pueden verlo. Revisa con qué cuenta ingresaste."
            actions={
              <>
                <ButtonLink to="/contracts">
                  {ERROR_ICONS.document}
                  Ver mis contratos
                </ButtonLink>
                <Button variant="secondary" onClick={switchAccount}>
                  {ERROR_ICONS.switch}
                  Cambiar de cuenta
                </Button>
              </>
            }
          />
        </>,
      )
    }
    return shell(
      <>
        {crumbs}
        <ErrorBox message={error} status={errorStatus} onRetry={reload} className="min-h-[65vh]">
          <ButtonLink to="/contracts" variant={errorStatus === 404 ? 'primary' : 'secondary'}>
            {ERROR_ICONS.back}
            Volver a contratos
          </ButtonLink>
        </ErrorBox>
      </>,
    )
  }

  // El rol en este contrato se decide comparando el id de la sesión con los ids que manda el backend
  const isClient = user?.id === contract.clientId
  const isFreelancer = user?.id === contract.freelancerUserId
  const status = CONTRACT_STATUS[contract.status]
  const payment = PAYMENT_STATUS[contract.paymentStatus]
  const box = nextStep(contract, isClient)
  const action = pending && ACTIONS[pending]
  const finished = contract.status === 'CONFIRMED' || contract.status === 'CANCELLED'

  // Qué botones ve cada participante según el estado del contrato
  const canDeliver = isFreelancer && contract.status === 'IN_PROGRESS'
  const canCancel = isClient && contract.status === 'IN_PROGRESS'
  const canConfirm = isClient && contract.status === 'DELIVERED'

  const moneyKicker = { HELD: 'PAGO EN GARANTÍA', RELEASED: 'PAGO LIBERADO', REFUNDED: 'PAGO REEMBOLSADO' }[contract.paymentStatus]
  const parties = [contract.clientName, contract.freelancerName].filter(Boolean).join(' · ')

  return shell(
    <>
      <Breadcrumbs items={[{ label: 'Contratos', to: '/contracts' }, { label: contract.projectTitle }]} />

      <header className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.13em]">
            CONTRATO <span className="font-mono text-muted">{contractCode(contract.id)}</span>
          </p>
          <h1 className="mt-3 text-[38px] leading-none tracking-[-0.045em] lg:text-[52px]">{contract.projectTitle}</h1>
          <p className="mt-3 text-sm text-muted">
            {parties && `${parties} · `}Inicio {formatDate(contract.startedAt)} ·{' '}
            <Link to={`/projects/${contract.projectId}`} className="font-semibold text-ink underline underline-offset-2">
              Ver proyecto
            </Link>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge color={status?.color}>{status?.label ?? contract.status}</Badge>
          <Badge color={payment?.color}>Pago {(payment?.label ?? contract.paymentStatus).toLowerCase()}</Badge>
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
        <section className="grid min-w-0 gap-6">
          <article className="rounded-2xl border border-line bg-surface p-6 sm:p-[34px]">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.13em]">
                {icons.lock} {moneyKicker}
              </span>
              <Badge color={payment?.color}>{payment?.label}</Badge>
            </div>
            <MoneyAmount value={contract.amount} className="mb-3 mt-7 text-[clamp(52px,7vw,96px)] leading-[0.95]" />
            <p className="max-w-[520px] text-sm leading-relaxed text-muted">{moneyText(contract)}</p>
            <div className="mt-10">
              <ContractTimeline contract={contract} />
            </div>
          </article>

          {contract.deliveredAt ? (
            <article className="rounded-2xl border border-line bg-surface p-6 sm:p-[30px]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.13em] text-muted">ENTREGA</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight">Trabajo entregado</h2>
                </div>
                <span className="text-xs text-muted">{formatDate(contract.deliveredAt)}</span>
              </div>
              <p className="mt-3 text-sm text-muted">
                {contract.freelancerName} marcó el trabajo como entregado.{' '}
                {contract.status === 'DELIVERED' && (isClient ? 'Revísalo y confirma cuando esté todo bien.' : 'Ahora le toca revisar al cliente.')}
              </p>
            </article>
          ) : (
            <article className="flex items-center gap-[18px] rounded-2xl border border-line bg-surface p-6 sm:p-[30px]">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-paper text-muted">{icons.clock}</span>
              <div>
                <p className="text-[10px] font-semibold tracking-[0.13em] text-muted">ENTREGAS</p>
                <h2 className="mb-1 mt-2 text-xl font-semibold tracking-tight">Aún no hay entregas</h2>
                <p className="text-xs text-muted">
                  {contract.status === 'CANCELLED'
                    ? 'El contrato se canceló antes de recibir una entrega.'
                    : isClient
                      ? `Cuando ${contract.freelancerName} entregue, lo verás aquí.`
                      : 'Cuando entregues, el cliente lo verá aquí.'}
                </p>
              </div>
            </article>
          )}

          {contract.status === 'CONFIRMED' && (isClient || isFreelancer) && (
            <ContractReviews
              contractId={contract.id}
              userName={user.nombre}
              revieweeName={isClient ? contract.freelancerName : (contract.clientName ?? 'el cliente')}
            />
          )}
        </section>

        <aside className="grid gap-3 lg:sticky lg:top-24">
          <div className="relative overflow-hidden rounded-2xl bg-ink p-6 text-white sm:p-7">
            {contract.status === 'CONFIRMED' && (
              <span className="absolute right-5 top-5">
                <Cuyi anim="celebra" px={3} />
              </span>
            )}
            <p className="text-[10px] font-semibold tracking-[0.13em] text-lime">{box.kicker}</p>
            <h2 className="mt-3 max-w-[80%] text-2xl font-semibold leading-tight tracking-tight">{box.title}</h2>
            <p className="mt-3 text-[13px] leading-relaxed text-white/70">{box.text}</p>
            {(canDeliver || canConfirm || canCancel || finished) && (
              <div className="mt-6 grid gap-2">
                {canDeliver && (
                  <Button onClick={() => setPending('deliver')} variant="lime" className="w-full">
                    Entregar trabajo
                  </Button>
                )}
                {canConfirm && (
                  <Button onClick={() => setPending('confirm')} variant="lime" className="w-full">
                    Confirmar entrega
                  </Button>
                )}
                {canCancel && (
                  <Button
                    variant="inverse"
                    onClick={() => setPending('cancel')}
                    className="w-full"
                  >
                    Cancelar contrato
                  </Button>
                )}
                {finished && (
                  <ButtonLink
                    to="/contracts"
                    variant="inverse"
                    className="w-full"
                  >
                    Volver a contratos
                  </ButtonLink>
                )}
              </div>
            )}
          </div>

          <PersonCard role="CLIENTE" name={contract.clientName ?? 'Cliente'} isYou={isClient} />
          <PersonCard
            role="FREELANCER"
            name={contract.freelancerName}
            isYou={isFreelancer}
            to={`/freelancers/${contract.freelancerUserId}`}
          />

          <dl className="rounded-2xl border border-line bg-surface p-5 text-[13px]">
            {[
              ['Fecha límite', contract.deadline ? formatDate(contract.deadline) : 'Sin fecha'],
              ['Inicio', formatDate(contract.startedAt)],
              ['Entrega', contract.deliveredAt ? formatDate(contract.deliveredAt) : 'Pendiente'],
              ['Monto', formatBudget(contract.amount)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-3 border-b border-line py-2.5 first:pt-0">
                <dt className="text-muted">{label}</dt>
                <dd className="font-semibold tabular-nums">{value}</dd>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setTermsOpen(true)}
              className="group mt-3 flex w-full items-center justify-between text-left text-xs font-semibold"
            >
              Ver términos del contrato
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </dl>
        </aside>
      </div>

      <Modal
        open={pending !== null}
        title={action?.title(contract)}
        kicker={action?.kicker}
        icon={action?.icon}
        iconTone={action?.tone}
        onClose={() => !busy && setPending(null)}
      >
        {action && (
          <>
            <p className="text-sm leading-relaxed text-muted">{action.text(contract)}</p>
            <div className="my-6 flex items-center justify-between gap-3 rounded-xl bg-paper px-4 py-3 text-xs">
              <span className="min-w-0 truncate text-muted">{action.summary(contract)[0]}</span>
              <strong className="text-sm tabular-nums">{formatBudget(action.summary(contract)[1])}</strong>
            </div>
            <div className="grid gap-2">
              <Button variant={action.variant} loading={busy} onClick={runAction} className="w-full">
                {busy ? action.busyLabel : action.label}
              </Button>
              <Button variant="ghost" disabled={busy} onClick={() => setPending(null)} className="w-full">
                {action.back}
              </Button>
            </div>
          </>
        )}
      </Modal>

      <TermsDialog open={termsOpen} contract={contract} onClose={() => setTermsOpen(false)} />
    </>,
  )
}
