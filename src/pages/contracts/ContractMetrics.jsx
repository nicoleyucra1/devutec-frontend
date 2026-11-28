import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import ErrorState from '../../components/ui/ErrorState'
import LoadingNotice from '../../components/ui/LoadingNotice'
import ConsentCard from '../../components/metrics/ConsentCard'
import IntegrationGuide from '../../components/metrics/IntegrationGuide'
import MetricsPanel from '../../components/metrics/MetricsPanel'
import PlanCard from '../../components/metrics/PlanCard'
import ProReport from '../../components/metrics/ProReport'
import { useAsync } from '../../hooks/useAsync'
import { useAuth } from '../../hooks/useAuth'
import { useContract } from '../../hooks/useContracts'
import { useToast } from '../../hooks/useToast'
import { metricsService } from '../../services/metricsService'
import { errorMessage } from '../../utils/errorMessage'

const TABS = [
  { key: 'panel', label: 'Panel' },
  { key: 'integrar', label: 'Cómo integrarlo' },
]

// Métricas DEVUTEC de la web del cliente: el cliente activa con su consentimiento, ve su panel y elige su plan;
// el estudiante ve «Cómo integrarlo». El panel básico sale de la base de DEVUTEC y el reporte Pro, de Amplitude.
export default function ContractMetrics() {
  const { id } = useParams()
  const { user } = useAuth()
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const contract = useContract(id)
  const loaded = useAsync((options) => metricsService.get(id, options), [id])
  // Lo último que respondió el backend (al activar, suscribirse o recibir el primer dato se actualiza sin recargar)
  const [fresh, setFresh] = useState(null)
  const [busy, setBusy] = useState(null) // 'enable' | 'disable' | 'BASIC' | 'PRO' | null
  const [confirmDisable, setConfirmDisable] = useState(false)
  const planRef = useRef(null)
  const data = fresh ?? loaded.data

  const isClient = user?.id === contract.data?.clientId
  const tab = params.get('tab') ?? (isClient || data?.integrated ? 'panel' : 'integrar')
  const goTo = (next) => setParams({ tab: next }, { replace: true })
  const freelancerName = contract.data?.freelancerName
  const onIntegrated = useCallback((next) => setFresh(next), [])

  // Al volver de Stripe: se confirma la suscripción una sola vez y se limpia el link
  const sessionId = params.get('session_id')
  const returned = params.get('suscripcion')
  useEffect(() => {
    if (returned === 'cancelada') {
      toast.info('No se hizo ningún cobro.')
      setParams({ tab: 'panel' }, { replace: true })
      return
    }
    if (returned !== 'ok' || !sessionId) return
    metricsService
      .confirmSubscription(id, sessionId)
      .then((next) => {
        setFresh(next)
        toast.success('¡Listo! Tu plan quedó activo.')
      })
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setParams({ tab: 'panel' }, { replace: true }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [returned, sessionId, id])

  const run = async (kind, request, success) => {
    setBusy(kind)
    try {
      const next = await request()
      if (next) setFresh(next)
      if (success) toast.success(success)
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setBusy(null)
    }
  }

  const subscribe = async (plan) => {
    setBusy(plan)
    try {
      const { checkoutUrl } = await metricsService.subscribe(id, plan)
      window.location.assign(checkoutUrl)
    } catch (err) {
      toast.error(errorMessage(err))
      setBusy(null)
    }
  }

  const shell = (children) => <main className="mx-auto w-full max-w-[1200px] px-5 pb-20 pt-8 lg:px-6">{children}</main>
  const crumbs = contract.data && (
    <Breadcrumbs items={[{ label: 'Contratos', to: '/contracts' }, { label: contract.data.projectTitle, to: `/contracts/${id}` }, { label: 'Métricas' }]} />
  )

  if (contract.error || loaded.error) {
    return shell(
      <ErrorState
        title="No pudimos cargar las métricas"
        message={contract.error ?? loaded.error}
        onRetry={() => {
          contract.reload()
          loaded.reload()
        }}
      />,
    )
  }
  if (contract.loading || !data) return shell(<LoadingNotice loading what="las métricas" />)

  if (!data.enabled) {
    return shell(
      <>
        {crumbs}
        <div className="mt-6">
          <ConsentCard
            data={data}
            freelancerName={freelancerName}
            clientName={contract.data.clientName}
            busy={busy === 'enable'}
            onEnable={() => run('enable', () => metricsService.enable(id), 'Métricas activadas')}
          />
        </div>
      </>,
    )
  }

  return shell(
    <>
      {crumbs}
      <header className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.13em] text-muted">MÉTRICAS DE LA WEB</p>
          <h1 className="mt-2 text-[32px] font-semibold leading-tight tracking-[-0.02em]">{contract.data.projectTitle}</h1>
        </div>
        <div role="tablist" aria-label="Secciones de métricas" className="flex rounded-full border border-line bg-surface p-1">
          {TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={tab === item.key}
              onClick={() => goTo(item.key)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${tab === item.key ? 'bg-ink text-surface' : 'text-muted hover:text-ink'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <div className="mt-6 grid gap-4" role="tabpanel">
        {tab === 'integrar' ? (
          <IntegrationGuide contractId={id} data={data} isClient={isClient} freelancerName={freelancerName} onIntegrated={onIntegrated} />
        ) : (
          <>
            {data.access.locked ? (
              <div className="rounded-2xl border border-line bg-surface p-6 text-center sm:p-[30px]">
                <p className="text-[11px] font-semibold tracking-[0.13em] text-muted">PANEL EN PAUSA</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  {isClient ? 'Tu prueba gratis terminó' : 'La prueba gratis del cliente terminó'}
                </h2>
                <p className="mt-2 text-sm text-muted">
                  {isClient ? 'Tu web sigue enviando datos. Elige un plan para volver a ver tus números.' : 'Los datos siguen llegando; el cliente ve sus números cuando elija un plan.'}
                </p>
              </div>
            ) : (
              <MetricsPanel data={data} isClient={isClient} freelancerName={freelancerName} onShowGuide={() => goTo('integrar')} />
            )}

            {data.integrated && (
              <ProReport
                contractId={id}
                isPro={data.access.plan === 'PRO'}
                isClient={isClient}
                onUpgrade={() => planRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              />
            )}

            {isClient && (
              <div ref={planRef}>
                <PlanCard
                  access={data.access}
                  integrated={data.integrated}
                  onlyTestData={data.onlyTestData}
                  busyPlan={busy === 'BASIC' || busy === 'PRO' ? busy : null}
                  onSubscribe={subscribe}
                />
              </div>
            )}

            {isClient && (
              <p className="text-center text-xs text-muted">
                ¿Ya no quieres medir tu web?{' '}
                <button type="button" onClick={() => setConfirmDisable(true)} className="font-semibold text-error underline underline-offset-2">
                  Desactivar y borrar mis datos
                </button>
              </p>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        open={confirmDisable}
        title="¿Desactivar las métricas?"
        message="Se borran la llave de tu web y los números de tu panel. La web dejará de enviar datos. Puedes volver a activarlas cuando quieras."
        confirmLabel="Sí, desactivar y borrar"
        busy={busy === 'disable'}
        onCancel={() => setConfirmDisable(false)}
        onConfirm={async () => {
          await run('disable', () => metricsService.disable(id), 'Métricas desactivadas y datos borrados')
          setConfirmDisable(false)
        }}
      />
    </>,
  )
}
