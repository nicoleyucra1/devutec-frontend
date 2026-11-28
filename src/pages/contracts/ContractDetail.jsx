import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import ContractDetailSkeleton from '../../components/contracts/ContractDetailSkeleton'
import ContractReviews from '../../components/contracts/ContractReviews'
import MetricsLinkCard from '../../components/contracts/MetricsLinkCard'
import ContractTimeline from '../../components/contracts/ContractTimeline'
import MoneyAmount from '../../components/contracts/MoneyAmount'
import PersonCard from '../../components/contracts/PersonCard'
import CoordinateCard from '../../components/contracts/CoordinateCard'
import StageGuideCard from '../../components/contracts/StageGuideCard'
import StagesCard from '../../components/contracts/StagesCard'
import TermsDialog from '../../components/contracts/TermsDialog'
import TranslationCard from '../../components/contracts/TranslationCard'
import InstallmentsCard from '../../components/contracts/InstallmentsCard'
import ClosedForNonPaymentCard from '../../components/contracts/ClosedForNonPaymentCard'
import ClientRequestTranslator from '../../components/contracts/ClientRequestTranslator'
import Cuyi from '../../components/brand/Cuyi'
import ErrorBox from '../../components/projects/ErrorBox'
import ErrorState from '../../components/ui/ErrorState'
import { ERROR_ICONS } from '../../components/ui/errorIcons'
import ButtonLink from '../../components/projects/ButtonLink'
import Badge from '../../components/ui/Badge'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import LoadingNotice from '../../components/ui/LoadingNotice'
import Modal from '../../components/ui/Modal'
import { useAuth } from '../../hooks/useAuth'
import { useContract } from '../../hooks/useContracts'
import { useToast } from '../../hooks/useToast'
import { contractService } from '../../services/contractService'
import { CONTRACT_STATUS, contractCode, PAYMENT_STATUS } from '../../utils/contractStatus'
import { closedForNonPayment, hasPlan as contractHasPlan, nothingPaidYet, paidByClient } from '../../utils/installments'
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

// Etapa en la que se está trabajando y si es la última. Los contratos de antes de las etapas tienen una sola.
function stageInfo(c) {
  const stages = c.stages ?? []
  const stage = stages.find((item) => item.position === c.currentStage) ?? null
  const withStages = stages.length > 1
  const last = !stage || stage.position === stages.length
  const roundsLeft = stage ? (stage.maxChangeRounds ?? 2) - (stage.changeRounds ?? 0) : 0
  return { stage, withStages, last, roundsLeft }
}

// Cada acción del contrato: qué endpoint llama, cómo se ve su ventana de confirmación y qué avisa al terminar
const ACTIONS = {
  deliver: {
    run: contractService.deliver,
    icon: icons.send,
    tone: 'green',
    kicker: 'ENTREGAR TRABAJO',
    title: (c) => {
      const { stage, withStages } = stageInfo(c)
      return withStages ? `¿Listo para entregar ${stage.name}?` : '¿Listo para entregar?'
    },
    text: (c) =>
      `Pega el link a tu trabajo (Drive, GitHub, Figma o la web publicada). ${c.clientName ?? 'El cliente'} lo revisará y confirmará; mientras tanto, el pago sigue retenido.`,
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
    kicker: 'APROBAR ETAPA',
    // Con etapas se aprueba solo la etapa entregada; la última termina el contrato y libera todo (con la bolsa)
    title: (c) => {
      const { stage, withStages, last } = stageInfo(c)
      if (!withStages) return `Vas a liberar ${formatBudget(c.amount)}`
      return last ? 'Aprobar la Entrega final y terminar' : `Aprobar ${stage.name}`
    },
    text: (c) => {
      const { stage, withStages, last } = stageInfo(c)
      if (!withStages || last) {
        return `Confirma que revisaste la entrega de ${c.freelancerName}. Se libera todo lo que queda en garantía, incluida la bolsa de emergencia, y el contrato queda finalizado. Esta acción no se puede deshacer.`
      }
      return `Confirma que revisaste ${stage.name}. Se libera la parte de esta etapa a ${c.freelancerName} y empieza la siguiente. Si algo no te convence, mejor pide cambios. Esta acción no se puede deshacer.`
    },
    summary: (c) => {
      const { stage, withStages, last } = stageInfo(c)
      if (!withStages) return [`${c.projectTitle} · ${contractCode(c.id)}`, c.amount]
      if (last) return ['Se libera todo lo que queda', Number(c.amount) - Number(c.releasedAmount ?? 0)]
      return [`Se libera ${stage.name} (${stage.percentage} %)`, stage.amount]
    },
    label: 'Sí, aprobar',
    busyLabel: 'Aprobando...',
    back: 'Volver a revisar',
    variant: 'primary',
    success: 'Etapa aprobada. Se liberó su parte del pago.',
  },
  requestChanges: {
    run: (id, { nota }) => contractService.requestChanges(id, { nota }),
    icon: icons.send,
    tone: 'amber',
    kicker: 'PEDIR CAMBIOS',
    title: (c) => `Pedir cambios en ${stageInfo(c).stage?.name ?? 'la entrega'}`,
    text: (c) => {
      const { roundsLeft } = stageInfo(c)
      return `Cuéntale a ${c.freelancerName} qué quieres cambiar. La etapa vuelve a sus manos y el pago sigue en garantía. Te ${roundsLeft === 1 ? 'queda 1 ronda' : `quedan ${roundsLeft} rondas`} de cambios en esta etapa.`
    },
    summary: (c) => [`El pago sigue en garantía`, Number(c.amount) - Number(c.releasedAmount ?? 0)],
    label: 'Enviar pedido de cambios',
    busyLabel: 'Enviando...',
    back: 'Volver',
    variant: 'primary',
    success: 'Pedido de cambios enviado.',
  },
  cancel: {
    run: contractService.cancel,
    icon: icons.close,
    tone: 'red',
    kicker: 'CANCELAR CONTRATO',
    title: () => '¿Cancelar este contrato?',
    // Con el pago en dos partes solo se devuelve lo que el cliente ya pagó (puede ser nada si no pagó el pago 1)
    text: (c) =>
      contractHasPlan(c)
        ? `${paidByClient(c) > 0 ? `Se te devolverán ${formatBudget(paidByClient(c))} que pagaste` : 'Todavía no pagaste nada, así que no hay nada que devolver'} y el proyecto volverá a recibir postulaciones. Esta acción no se puede deshacer.`
        : `Se te reembolsarán ${formatBudget(c.amount)} y el proyecto volverá a recibir postulaciones. Esta acción no se puede deshacer.`,
    summary: (c) => [`Reembolso a ${c.clientName ?? 'ti'}`, contractHasPlan(c) ? paidByClient(c) : c.amount],
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
  const firstName = contract.freelancerName?.split(' ')[0] ?? 'el freelancer'
  // Pago en dos partes: el monto grande es el total del contrato, pero en garantía solo está lo que ya se pagó
  if (contractHasPlan(contract) && contract.status === 'IN_PROGRESS') {
    return nothingPaidYet(contract)
      ? `Este es el total del contrato. Todavía no hay dinero en garantía: falta el pago 1 de ${client} para que ${firstName} empiece.`
      : `Este es el total del contrato. Hay ${formatBudget(paidByClient(contract))} pagados en garantía, que se liberan a ${firstName} a medida que se aprueba cada etapa.`
  }
  if (stageInfo(contract).withStages && (contract.status === 'IN_PROGRESS' || contract.status === 'DELIVERED')) {
    return `El dinero está en garantía y se libera por etapa: cada vez que ${client} aprueba una, se libera su parte. ${
      Number(contract.releasedAmount) > 0 ? `Ya se liberaron ${formatBudget(contract.releasedAmount)}.` : ''
    }`
  }
  return {
    IN_PROGRESS: 'El dinero está retenido. Nadie puede moverlo hasta que se confirme la entrega o se cancele el contrato.',
    DELIVERED: `La entrega está lista. El pago se libera en cuanto ${client} la confirme.`,
    CONFIRMED: `Pago liberado a ${contract.freelancerName}. El contrato quedó finalizado.`,
    CANCELLED: closedForNonPayment(contract)
      ? `El contrato se cerró porque no se hizo el pago 2. Lo aprobado y la bolsa de emergencia son de ${firstName}; lo que no se usó volvió a ${client}.`
      : `El contrato se canceló antes de la entrega. El monto se reembolsó a ${client}.`,
  }[contract.status]
}

// Recuadro negro de la derecha: qué toca hacer ahora, distinto para cliente y freelancer
function nextStep(contract, isClient) {
  const amount = formatBudget(contract.amount)
  const firstName = contract.freelancerName?.split(' ')[0] ?? 'El freelancer'
  const client = contract.clientName ?? 'El cliente'
  const { stage, withStages, last, roundsLeft } = stageInfo(contract)
  // Pago en dos partes: si la parte que cubre esta etapa no está pagada, eso va primero
  const coveringPayment = (contract.installments ?? []).find(
    (installment) => installment.number === Math.min(stage?.paymentPart ?? 1, contract.installments.length),
  )
  const stageUnpaid = coveringPayment?.status === 'PENDING'
  // El pago 1 del cliente ya tiene su aviso abajo («Haz el pago 1 para empezar»); el estudiante ve el suyo aquí
  if (withStages && stage && contract.status === 'IN_PROGRESS' && stageUnpaid && (coveringPayment.number > 1 || !isClient)) {
    return isClient
      ? {
          kicker: 'TE TOCA',
          title: `Haz el pago ${coveringPayment.number} para seguir con ${stage.name}.`,
          text: `Ya aprobaste el Diseño. Con el pago ${coveringPayment.number} en garantía, ${firstName} empieza ${stage.name}.`,
        }
      : {
          kicker: `ETAPA ${stage.position} DE ${contract.stages.length}`,
          title: `Espera el pago ${coveringPayment.number} para empezar ${stage.name}.`,
          text: `${client} tiene que hacer el pago ${coveringPayment.number}. Te avisaremos cuando quede en garantía. No empieces antes.`,
        }
  }
  if (withStages && stage && contract.status === 'IN_PROGRESS' && !nothingPaidYet(contract)) {
    const changes = stage.status === 'CHANGES_REQUESTED'
    return isClient
      ? {
          kicker: `ETAPA ${stage.position} DE ${contract.stages.length}`,
          title: changes ? `${firstName} está haciendo tus cambios en ${stage.name}.` : `${firstName} está trabajando en ${stage.name}.`,
          text: `${stage.dueDate ? `Esta etapa vence el ${formatDate(stage.dueDate)}. ` : ''}Cuando la entregue, la revisas y decides: aprobar o pedir cambios.`,
        }
      : {
          kicker: `ETAPA ${stage.position} DE ${contract.stages.length}`,
          title: changes ? `${client} pidió cambios en ${stage.name}.` : `¿Terminaste ${stage.name}?`,
          text: changes
            ? 'Revisa el pedido (abajo te lo traducimos) y vuelve a entregar la etapa.'
            : `Entrega esta etapa y ${client} la revisa. Al aprobarla, se libera su parte del pago.`,
        }
  }
  if (withStages && stage && contract.status === 'DELIVERED') {
    return isClient
      ? {
          kicker: 'TU DECISIÓN',
          title: `Revisa ${stage.name}.`,
          text: last
            ? `Si todo está bien, apruébala y se libera todo lo que queda, con la bolsa de emergencia. ${roundsLeft > 0 ? `Si no, pide cambios (te ${roundsLeft === 1 ? 'queda 1 ronda' : `quedan ${roundsLeft} rondas`}).` : ''}`
            : `Si está bien, apruébala y se libera su parte (${formatBudget(stage.amount)}). ${roundsLeft > 0 ? `Si no, pide cambios (te ${roundsLeft === 1 ? 'queda 1 ronda' : `quedan ${roundsLeft} rondas`}).` : 'Ya usaste las 2 rondas de cambios de esta etapa.'}`,
        }
      : { kicker: 'EN REVISIÓN', title: `${stage.name} enviada.`, text: `${client} está revisando esta etapa. Al aprobarla, se libera su parte del pago.` }
  }
  switch (contract.status) {
    case 'IN_PROGRESS':
      return isClient
        ? {
            kicker: nothingPaidYet(contract) ? 'TE TOCA' : 'EN CURSO',
            title: nothingPaidYet(contract) ? 'Haz el pago 1 para empezar.' : `${firstName} está trabajando.`,
            text: `${contract.deadline ? `La entrega vence el ${formatDate(contract.deadline)}. ` : ''}${
              contractHasPlan(contract)
                ? 'Puedes cancelar mientras no hayas aprobado ninguna etapa; te devolvemos lo que pagaste.'
                : 'Puedes cancelar mientras no haya una entrega; el monto se te reembolsa completo.'
            }`,
          }
        : {
            kicker: 'SIGUIENTE PASO',
            title: '¿Terminaste el trabajo?',
            text: nothingPaidYet(contract)
              ? `Espera el pago 1 de ${client} antes de empezar. Te avisaremos cuando quede en garantía.`
              : `Al entregar, ${client} podrá revisarlo y confirmarlo. El pago ya está retenido a tu nombre.`,
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
      if (closedForNonPayment(contract)) {
        return isClient
          ? { kicker: 'CERRADO', title: 'Contrato cerrado.', text: 'No se hizo el pago 2 a tiempo. Abajo ves qué recibió cada uno.' }
          : { kicker: 'CERRADO', title: 'Tu trabajo quedó pagado.', text: `${client} no hizo el pago 2. Recibes lo aprobado y la bolsa de emergencia.` }
      }
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
  // Lo que escribe el freelancer en la ventana de entregar
  const [delivery, setDelivery] = useState({ link: '', nota: '' })
  const [deliveryError, setDeliveryError] = useState(null)
  // Lo que escribe el cliente al pedir cambios
  const [changeNote, setChangeNote] = useState('')
  const [termsOpen, setTermsOpen] = useState(false)
  const [paying, setPaying] = useState(false)

  // Al volver de Stripe la URL trae ?pago=ok&session_id=... o ?pago=cancelado
  const [searchParams, setSearchParams] = useSearchParams()
  const checkoutHandled = useRef(false)

  useEffect(() => {
    const result = searchParams.get('pago')
    if (!result || checkoutHandled.current) return
    checkoutHandled.current = true
    const sessionId = searchParams.get('session_id')
    // Se limpia la URL para que recargar la página no repita el aviso
    const clearParams = () => setSearchParams({}, { replace: true })

    if (result === 'ok' && sessionId) {
      contractService
        .confirmCheckout(id, sessionId)
        .then(() => {
          toast.success('Pago recibido. El dinero queda en garantía hasta que confirmes la entrega.')
          reload()
        })
        .catch((err) => toast.error(errorMessage(err)))
        .finally(clearParams)
    } else {
      if (result === 'cancelado') toast.info('No se hizo ningún cobro. Puedes pagar cuando quieras.')
      clearParams()
    }
  }, [id, searchParams, setSearchParams, toast, reload])

  // Pide al backend la página de pago de Stripe y lleva al cliente ahí
  const payWithCard = async (installment) => {
    setPaying(true)
    try {
      const { checkoutUrl } = await contractService.startCheckout(id, typeof installment === 'number' ? installment : undefined)
      window.location.assign(checkoutUrl)
    } catch (err) {
      toast.error(errorMessage(err))
      setPaying(false)
    }
  }

  // Cierra la sesión y vuelve a este contrato después de ingresar con otra cuenta
  const switchAccount = () => {
    logout()
    navigate('/login', { replace: true, state: { from: { pathname: `/contracts/${id}` } } })
  }

  const runAction = async () => {
    if (pending === 'deliver' && !delivery.link.trim()) {
      setDeliveryError('Pega el link de tu trabajo')
      return
    }
    if (pending === 'requestChanges' && !changeNote.trim()) {
      setDeliveryError('Cuéntale qué quieres cambiar')
      return
    }
    setBusy(true)
    setDeliveryError(null)
    try {
      const body =
        pending === 'requestChanges' ? { nota: changeNote.trim() } : { link: delivery.link.trim(), nota: delivery.nota.trim() || null }
      await ACTIONS[pending].run(id, body)
      toast.success(ACTIONS[pending].success)
      if (pending === 'deliver') setDelivery({ link: '', nota: '' })
      if (pending === 'requestChanges') setChangeNote('')
      setPending(null)
      reload()
    } catch (err) {
      // El error del link se muestra debajo del campo; los demás, como aviso
      if ((pending === 'deliver' || pending === 'requestChanges') && [400, 422].includes(err.response?.status)) {
        setDeliveryError(errorMessage(err))
      }
      else toast.error(errorMessage(err))
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
  // Cerrado por falta del pago 2: no es un "Cancelado" cualquiera
  const status = closedForNonPayment(contract)
    ? { label: 'Cerrado: no se hizo el pago 2', color: 'yellow' }
    : CONTRACT_STATUS[contract.status]
  // Con el pago en dos partes, mientras no se haga el pago 1 no hay nada retenido todavía
  const payment = nothingPaidYet(contract) ? { label: 'Pendiente', color: 'yellow' } : PAYMENT_STATUS[contract.paymentStatus]
  const box = nextStep(contract, isClient)
  const action = pending && ACTIONS[pending]
  const finished = contract.status === 'CONFIRMED' || contract.status === 'CANCELLED'

  // Etapa en la que se está trabajando (la manda el backend con las etapas); la Mini guía es para el estudiante
  const currentStage = contract.stages?.find((stage) => stage.position === contract.currentStage)
  const showGuide = isFreelancer && !finished && currentStage && currentStage.status !== 'CANCELLED'

  // Pago en dos partes: el estudiante no entrega una etapa si el cliente no pagó la parte que la cubre
  const installments = contract.installments ?? []
  const hasPlan = installments.length > 0
  const coveringInstallment = hasPlan && currentStage
    ? installments.find((installment) => installment.number === Math.min(currentStage.paymentPart ?? 1, installments.length))
    : null
  const stagePaid = !coveringInstallment || coveringInstallment.status !== 'PENDING'
  const nextInstallment = installments.find((installment) => installment.status === 'PENDING')

  // Qué botones ve cada participante según el estado del contrato
  const canDeliver = isFreelancer && contract.status === 'IN_PROGRESS' && stagePaid
  // Con etapas aprobadas ya no se puede cancelar (el backend lo bloquea): lo aprobado es del estudiante
  const anyApproved = (contract.stages ?? []).some((stage) => stage.status === 'APPROVED')
  const canCancel = isClient && contract.status === 'IN_PROGRESS' && !anyApproved
  const canConfirm = isClient && contract.status === 'DELIVERED'
  const stageNow = stageInfo(contract)
  const canRequestChanges = canConfirm && stageNow.withStages && stageNow.roundsLeft > 0
  // El cliente puede pagar con tarjeta mientras el contrato siga abierto y no lo haya pagado antes
  const canPay =
    isClient &&
    (contract.status === 'IN_PROGRESS' || contract.status === 'DELIVERED') &&
    contract.paymentStatus === 'HELD' &&
    (hasPlan ? Boolean(nextInstallment?.payableNow) : !contract.paidWithCard)

  // Con etapas: la entrega y el pedido de cambios de la etapa en curso se traducen con su nombre como contexto
  const translatedStage = contract.stages?.find((stage) => stage.position === contract.currentStage)
  const deliveryNote = translatedStage?.deliveryNote || contract.deliveryNote
  const deliveryStageName = translatedStage?.deliveryNote ? translatedStage.name : undefined
  const changeRequest = translatedStage?.status === 'CHANGES_REQUESTED' ? translatedStage.changeRequestNote : null

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
            {/* Con etapas, el avance se ve en «Etapas del trabajo»; la línea de tiempo es para los contratos de una sola entrega */}
            {!stageNow.withStages && (
              <div className="mt-10">
                <ContractTimeline contract={contract} />
              </div>
            )}
          </article>

          <ClosedForNonPaymentCard contract={contract} isClient={isClient} />

          <InstallmentsCard contract={contract} isClient={isClient} onPay={payWithCard} paying={paying} />

          {showGuide && <StageGuideCard key={currentStage.id} contractId={contract.id} stage={currentStage} clientName={contract.clientName} />}

          {(isClient || isFreelancer) && <StagesCard contract={contract} isClient={isClient} />}

          {contract.deliveredAt ? (
            <article className="rounded-2xl border border-line bg-surface p-6 sm:p-[30px]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.13em] text-muted">ENTREGA</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight">
                    {stageNow.withStages && stageNow.stage ? `${stageNow.stage.name} entregada` : 'Trabajo entregado'}
                  </h2>
                </div>
                <span className="text-xs text-muted">{formatDate(contract.deliveredAt)}</span>
              </div>
              <p className="mt-3 text-sm text-muted">
                {contract.freelancerName} marcó el trabajo como entregado.{' '}
                {contract.status === 'DELIVERED' && (isClient ? 'Revísalo y confirma cuando esté todo bien.' : 'Ahora le toca revisar al cliente.')}
              </p>
              {contract.deliveryUrl && (
                <a
                  href={contract.deliveryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-line bg-paper px-4 py-3 text-sm font-semibold transition hover:border-ink"
                >
                  <span className="min-w-0 truncate">{contract.deliveryUrl.replace(/^https?:\/\//, '')}</span>
                  <span className="shrink-0 text-escrow">Abrir ↗</span>
                </a>
              )}
              {/* El cliente ve la nota traducida por Cuyi más abajo; el original queda en «Ver mensaje original» */}
              {contract.deliveryNote && !isClient && (
                <blockquote className="mt-3 whitespace-pre-line rounded-xl bg-paper px-4 py-3 text-sm leading-relaxed">
                  <span className="mb-1 block text-[10px] font-semibold tracking-[0.13em] text-muted">NOTA DE {contract.freelancerName?.split(' ')[0]?.toUpperCase()}</span>
                  {contract.deliveryNote}
                </blockquote>
              )}
            </article>
          ) : (
            <article className="flex items-center gap-[18px] rounded-2xl border border-line bg-surface p-6 sm:p-[30px]">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-paper text-muted">{icons.clock}</span>
              <div>
                <p className="text-[10px] font-semibold tracking-[0.13em] text-muted">ENTREGAS</p>
                <h2 className="mb-1 mt-2 text-xl font-semibold tracking-tight">
                  {stageNow.withStages && stageNow.stage ? `Aún no entregan ${stageNow.stage.name}` : 'Aún no hay entregas'}
                </h2>
                <p className="text-xs text-muted">
                  {closedForNonPayment(contract)
                    ? 'El contrato se cerró porque no se hizo el pago 2.'
                    : contract.status === 'CANCELLED'
                    ? 'El contrato se canceló antes de recibir una entrega.'
                    : isClient
                      ? `Cuando ${contract.freelancerName} entregue, lo verás aquí.`
                      : 'Cuando entregues, el cliente lo verá aquí.'}
                </p>
              </div>
            </article>
          )}

          {/* IA traductora: explica la nota de entrega al cliente (el estudiante ve cómo le llegará) */}
          {deliveryNote && (isClient || isFreelancer) && (
            <TranslationCard
              key={deliveryNote}
              contractId={contract.id}
              note={deliveryNote}
              stageName={deliveryStageName}
              freelancerName={contract.freelancerName}
              clientName={contract.clientName}
              isClient={isClient}
            />
          )}

          {/* IA traductora al revés: el pedido de cambios del cliente se traduce solo para el estudiante;
              si no hay pedido, el estudiante puede pegar cualquier mensaje del cliente */}
          {isFreelancer && !finished && (
            <ClientRequestTranslator
              key={changeRequest ?? 'manual'}
              contractId={contract.id}
              clientName={contract.clientName}
              stageName={translatedStage?.name}
              request={changeRequest ?? undefined}
            />
          )}

          {/* Proyectos web: acceso al panel de visitas y pedidos (y a «Cómo integrarlo» para el estudiante) */}
          {(isClient || isFreelancer) && contract.status !== 'CANCELLED' && (
            <MetricsLinkCard contractId={contract.id} isClient={isClient} />
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
          <div className="relative overflow-hidden rounded-2xl bg-night p-6 text-white sm:p-7">
            {contract.status === 'CONFIRMED' && (
              <span className="absolute right-5 top-5">
                <Cuyi anim="celebra" px={3} />
              </span>
            )}
            <p className="text-[10px] font-semibold tracking-[0.13em] text-lime">{box.kicker}</p>
            <h2 className="mt-3 max-w-[80%] text-2xl font-semibold leading-tight tracking-tight">{box.title}</h2>
            <p className="mt-3 text-[13px] leading-relaxed text-white/70">{box.text}</p>
            {contract.paidWithCard && (
              <p className="mt-4 text-[12px] font-semibold text-lime">Pagado con tarjeta ✓</p>
            )}
            {isFreelancer && contract.status === 'IN_PROGRESS' && !stagePaid && (
              <p className="mt-4 text-[12px] font-semibold text-lime">
                Esperando el pago {coveringInstallment.number} de {contract.clientName ?? 'el cliente'} para seguir con esta etapa.
              </p>
            )}
            {(canPay || canDeliver || canConfirm || canCancel || finished) && (
              <div className="mt-6 grid gap-2">
                {canPay && (
                  <>
                    <Button onClick={() => payWithCard(nextInstallment?.number)} loading={paying} variant="lime" className="w-full">
                      {paying
                        ? 'Abriendo Stripe...'
                        : nextInstallment
                          ? `Pagar ${formatBudget(nextInstallment.clientAmount)} (pago ${nextInstallment.number} de ${installments.length})`
                          : 'Pagar con tarjeta'}
                    </Button>
                    <p className="text-center text-[11px] text-white/60">
                      Modo de prueba: tarjeta 4242 4242 4242 4242, cualquier fecha futura y CVC
                    </p>
                  </>
                )}
                {canDeliver && (
                  <Button onClick={() => setPending('deliver')} variant="lime" className="w-full">
                    {stageNow.withStages && stageNow.stage ? `Entregar ${stageNow.stage.name}` : 'Entregar trabajo'}
                  </Button>
                )}
                {canConfirm && (
                  <Button onClick={() => setPending('confirm')} variant="lime" className="w-full">
                    {stageNow.withStages && stageNow.stage ? `Aprobar ${stageNow.stage.name}` : 'Confirmar entrega'}
                  </Button>
                )}
                {canRequestChanges && (
                  <Button onClick={() => setPending('requestChanges')} variant="inverse" className="w-full">
                    Pedir cambios ({stageNow.roundsLeft === 1 ? 'queda 1 ronda' : `quedan ${stageNow.roundsLeft} rondas`})
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

          {(isClient || isFreelancer) && <CoordinateCard contract={contract} isClient={isClient} />}

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
            {pending === 'deliver' && (
              <div className="mt-5 grid gap-3">
                <Input
                  label="Link de tu trabajo"
                  name="link"
                  type="url"
                  placeholder="drive.google.com/..."
                  value={delivery.link}
                  onChange={(event) => {
                    setDelivery((prev) => ({ ...prev, link: event.target.value }))
                    setDeliveryError(null)
                  }}
                  error={deliveryError}
                  maxLength={255}
                  autoFocus
                />
                <label className="block">
                  <span className="text-xs font-medium text-ink">Nota para el cliente (opcional)</span>
                  <textarea
                    value={delivery.nota}
                    onChange={(event) => setDelivery((prev) => ({ ...prev, nota: event.target.value }))}
                    maxLength={1000}
                    rows={3}
                    placeholder="Qué incluye la entrega y cómo revisarla"
                    className="mt-2 block w-full resize-y rounded-[10px] border border-gray-300 bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-ink focus:ring-[3px] focus:ring-ink/5"
                  />
                </label>
              </div>
            )}
            {pending === 'requestChanges' && (
              <label className="mt-5 block">
                <span className="text-xs font-medium text-ink">Qué quieres cambiar</span>
                <textarea
                  value={changeNote}
                  onChange={(event) => {
                    setChangeNote(event.target.value)
                    setDeliveryError(null)
                  }}
                  maxLength={1000}
                  rows={4}
                  autoFocus
                  placeholder="Por ejemplo: el rojo del encabezado está muy oscuro y falta la pizza americana en la carta"
                  className="mt-2 block w-full resize-y rounded-[10px] border border-gray-300 bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-ink focus:ring-[3px] focus:ring-ink/5"
                />
                {deliveryError && <span className="mt-1.5 block text-xs text-error">{deliveryError}</span>}
                <span className="mt-1.5 block text-[11px] text-muted">{stageNow.stage ? `Se lo traducimos a ${contract.freelancerName?.split(' ')[0]} en lenguaje técnico.` : ''}</span>
              </label>
            )}
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
