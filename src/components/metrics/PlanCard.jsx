import PropTypes from 'prop-types'
import Button from '../ui/Button'
import { formatDate } from '../../utils/format'

const PLANS = [
  { key: 'BASIC', name: 'Básico', priceKey: 'basicPrice', features: ['Visitas, contactos, pedidos y reservas', 'Velocidad de tu web', 'Últimos 30 días, en palabras simples'] },
  {
    key: 'PRO',
    name: 'Pro',
    priceKey: 'proPrice',
    features: ['Todo lo del Básico', 'Páginas más vistas y de dónde llegan', 'Celular o computadora', 'Contactos mes a mes (12 meses)'],
  },
]

// Membresía del panel: 3 meses gratis desde la primera visita real y después Básico o Pro al mes (Stripe, modo prueba)
export default function PlanCard({ access, integrated, onlyTestData, busyPlan, onSubscribe }) {
  const trialText = access.trialEndsAt
    ? access.trialActive
      ? `Tu prueba gratis dura hasta el ${formatDate(access.trialEndsAt)}. Si eliges un plan ahora, el primer cobro es recién ese día.`
      : 'Tu prueba gratis terminó. Elige un plan para volver a ver tus números.'
    : integrated && onlyTestData
      ? 'Tus 3 meses gratis empiezan cuando llegue la primera visita de tu web publicada (lo de prueba no cuenta).'
      : 'Tus 3 meses gratis empiezan cuando llegue la primera visita de tu web.'

  return (
    <div className="rounded-2xl border border-line bg-surface p-6 sm:p-[30px]">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[10px] font-semibold tracking-[0.13em] text-muted">TU PLAN</p>
        <span className="rounded-full bg-paper px-2.5 py-1 text-xs font-semibold">
          {access.plan === 'PRO' ? 'Pro' : access.plan === 'BASIC' ? 'Básico' : access.trialActive ? 'Prueba gratis' : 'Sin plan'}
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted">{trialText}</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {PLANS.map((plan) => {
          const current = access.plan === plan.key
          return (
            <div key={plan.key} className={`flex flex-col rounded-xl border p-4 ${current ? 'border-escrow bg-escrow-light' : 'border-line'}`}>
              <p className="text-sm font-semibold">{plan.name}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                S/ {Number(access[plan.priceKey]).toFixed(0)}
                <span className="text-xs font-normal text-muted"> al mes</span>
              </p>
              <ul className="mt-3 grid flex-1 gap-1.5 text-xs text-muted">
                {plan.features.map((feature) => (
                  <li key={feature}>· {feature}</li>
                ))}
              </ul>
              {current ? (
                <p className="mt-4 text-xs font-semibold text-escrow">Es tu plan actual ✓</p>
              ) : (
                <Button
                  variant={plan.key === 'PRO' ? 'lime' : 'secondary'}
                  className="mt-4 w-full"
                  loading={busyPlan === plan.key}
                  disabled={busyPlan !== null}
                  onClick={() => onSubscribe(plan.key)}
                >
                  {busyPlan === plan.key ? 'Abriendo Stripe…' : `Elegir ${plan.name}`}
                </Button>
              )}
            </div>
          )
        })}
      </div>
      <p className="mt-3 text-center text-[11px] text-muted">Modo de prueba: tarjeta 4242 4242 4242 4242, cualquier fecha futura y CVC</p>
    </div>
  )
}

PlanCard.propTypes = {
  access: PropTypes.shape({
    plan: PropTypes.string,
    trialEndsAt: PropTypes.string,
    trialActive: PropTypes.bool,
    locked: PropTypes.bool,
    basicPrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    proPrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }).isRequired,
  integrated: PropTypes.bool,
  onlyTestData: PropTypes.bool,
  busyPlan: PropTypes.string,
  onSubscribe: PropTypes.func.isRequired,
}
