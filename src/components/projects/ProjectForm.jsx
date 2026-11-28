import PropTypes from 'prop-types'
import { useId, useState } from 'react'
import Button from '../ui/Button'
import SkillPicker from '../ui/SkillPicker'
import { useSkills } from '../../hooks/useSkills'
import { projectShape } from '../../utils/propShapes'
import { formatBudget } from '../../utils/format'
import { formatRate, splitClientTotal } from '../../utils/commission'

const LIMITS = { title: [5, 80], description: [40, 2000], minBudget: 50, maxSkills: 5 }

// Distritos que se sugieren al escribir la ubicación; se puede escribir cualquier otro
const DISTRICTS = [
  'Barranco', 'Miraflores', 'San Isidro', 'Santiago de Surco', 'San Borja', 'Surquillo', 'Lince', 'Jesús María',
  'Magdalena del Mar', 'Pueblo Libre', 'San Miguel', 'La Molina', 'Chorrillos', 'Cercado de Lima', 'Los Olivos',
  'San Juan de Lurigancho', 'Ate', 'Callao',
]

// "2026-11-14" en la hora del celular o la compu, para el mínimo del calendario
function today() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

// Borrador del asistente IA: llena el formulario con lo que armó (presupuesto total ya con la comisión)
function fromDraft(draft) {
  return {
    title: draft.title?.slice(0, LIMITS.title[1]) ?? '',
    description: draft.description?.slice(0, LIMITS.description[1]) ?? '',
    budget: draft.budgetTotal != null ? String(draft.budgetTotal) : '',
    deadline: draft.deadline ?? '',
    location: '',
    skillIds: (draft.skillIds ?? []).map(String),
    metricsRequested: Boolean(draft.metricsRequested),
  }
}

function toFormValues(project) {
  return {
    title: project?.title ?? '',
    description: project?.description ?? '',
    budget: project?.budget != null ? String(project.budget) : '',
    deadline: project?.deadline ?? '',
    location: project?.location ?? '',
    skillIds: project?.skills?.map((skill) => String(skill.id)) ?? [],
    metricsRequested: Boolean(project?.metricsRequested),
  }
}

// Mismas reglas del mockup. La fecha solo tiene que ser futura si es nueva o si se cambió
// (así se puede editar un proyecto cuya fecha ya pasó sin tener que moverla).
function validate(values, initialDeadline) {
  const errors = {}
  const title = values.title.trim()
  const description = values.description.trim()
  if (title.length < LIMITS.title[0]) errors.title = `Escribe un título de al menos ${LIMITS.title[0]} caracteres.`
  if (description.length < LIMITS.description[0])
    errors.description = `Incluye al menos ${LIMITS.description[0]} caracteres para explicar el proyecto.`
  const budget = Number(values.budget)
  if (!values.budget || Number.isNaN(budget)) errors.budget = 'Escribe el presupuesto.'
  else if (budget < LIMITS.minBudget) errors.budget = `El presupuesto mínimo es S/ ${LIMITS.minBudget}.00.`
  if (!values.deadline) errors.deadline = 'Selecciona una fecha de entrega.'
  else if (values.deadline !== initialDeadline && values.deadline < today()) errors.deadline = 'La fecha tiene que ser de hoy en adelante.'
  if (values.skillIds.length === 0) errors.skillIds = 'Selecciona al menos una habilidad.'
  return errors
}

function Section({ number, title, help, children }) {
  return (
    <div className="border-b border-line p-[22px] md:p-8">
      <div className="mb-6 flex gap-3.5">
        <span className="font-serif text-[22px] italic leading-none text-escrow">{number}</span>
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="mt-1 text-xs text-muted">{help}</p>
        </div>
      </div>
      <div className="grid gap-5">{children}</div>
    </div>
  )
}

Section.propTypes = {
  number: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  help: PropTypes.string.isRequired,
  children: PropTypes.node,
}

const inputClass = (error) =>
  `w-full rounded-[10px] border bg-surface px-3.5 text-sm text-ink outline-none transition placeholder:text-muted focus:border-ink focus:ring-[3px] focus:ring-ink/5 ${
    error ? 'border-error' : 'border-gray-300'
  }`

// Etiqueta, campo, contador (opcional) y error de cada dato
function Field({ id, label, optional, error, count, max, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-xs font-medium">
        {label}
        {optional && <span className="ml-1.5 font-normal text-muted">Opcional</span>}
      </label>
      <div className="relative">
        {children}
        {max != null && (
          <small aria-hidden="true" className={`pointer-events-none absolute bottom-2.5 right-3 text-[10px] tabular-nums ${count > max ? 'text-error' : 'text-muted'}`}>
            {count}/{max}
          </small>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="text-xs text-error">
          {error}
        </p>
      )}
    </div>
  )
}

Field.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  optional: PropTypes.bool,
  error: PropTypes.string,
  count: PropTypes.number,
  max: PropTypes.number,
  children: PropTypes.node,
}

function Check() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-lime">
      <path d="m5 12 4 4L19 6" />
    </svg>
  )
}

// Panel oscuro de la derecha: al publicar recuerda que es gratis; al editar, qué pasa con los cambios
function FormHelp({ editing }) {
  const rows = editing
    ? ['Los cambios se ven al instante', 'Quienes postularon ven la versión nueva', 'Un contrato ya creado no cambia de monto']
    : ['No se cobra al publicar', 'Tú eliges a quién contratar', 'El pago queda protegido']
  return (
    <aside className="rounded-2xl bg-night p-7 text-white lg:sticky lg:top-24">
      <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-lime">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <path d="m9 12 2 2 4-5" />
      </svg>
      <p className="mt-7 text-[11px] font-semibold tracking-[0.13em] text-lime">{editing ? 'AL EDITAR' : 'ANTES DE PUBLICAR'}</p>
      <h3 className="my-2 text-[25px] font-semibold tracking-[-0.02em]">{editing ? 'Ajusta lo que necesites.' : 'Publicar es gratis.'}</h3>
      <p className="mb-6 text-[13px] leading-relaxed text-[#aaa8a0]">
        {editing
          ? 'Puedes cambiar el texto, el presupuesto o la fecha. El monto de un contrato ya creado se mantiene: es el que se acordó al aceptar la propuesta.'
          : 'Solo pagas cuando elijas una propuesta. Ese dinero queda retenido hasta que apruebes la entrega.'}
      </p>
      {rows.map((row) => (
        <div key={row} className="flex items-center justify-between border-t border-[#3c3c38] py-3 text-xs text-[#c9c6be]">
          <span>{row}</span>
          <Check />
        </div>
      ))}
    </aside>
  )
}

FormHelp.propTypes = {
  editing: PropTypes.bool,
}

// Formulario de "Publicar proyecto" y "Editar proyecto" (mockup FormularioProyecto).
// Avisa los errores al intentar enviar y desde ahí los va actualizando mientras se corrigen.
export default function ProjectForm({ initialProject, draft, saving, serverError, onSubmit, onCancel }) {
  const id = useId()
  const editing = Boolean(initialProject)
  const [values, setValues] = useState(() => (draft ? fromDraft(draft) : toFormValues(initialProject)))
  // Con el asistente, las habilidades las eligió la IA y solo las ven los estudiantes: el cliente no las edita
  const skillsFromAssistant = Boolean(draft?.skillIds?.length)
  const split = splitClientTotal(values.budget, Number(draft?.commissionRate ?? 0.1))
  const [submitted, setSubmitted] = useState(false)
  const skills = useSkills()

  const errors = submitted ? validate(values, initialProject?.deadline ?? '') : {}
  const setField = (name, value) => setValues((prev) => ({ ...prev, [name]: value }))
  const describedBy = (name) => (errors[name] ? `${id}-${name}-error` : undefined)

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitted(true)
    const found = validate(values, initialProject?.deadline ?? '')
    if (Object.keys(found).length > 0) {
      // Lleva al primer campo con error
      document.getElementById(`${id}-${Object.keys(found)[0]}`)?.focus()
      return
    }
    onSubmit({
      title: values.title.trim(),
      description: values.description.trim(),
      budget: Number(values.budget),
      deadline: values.deadline,
      location: values.location.trim() || null,
      skillIds: values.skillIds.map(Number),
      metricsRequested: Boolean(values.metricsRequested),
      // Solo con el asistente: tipo de proyecto y funcionalidades, para que el estudiante vea las horas estimadas
      ...(draft ? { category: draft.category, features: draft.features } : {}),
    })
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1.4fr_0.6fr]">
      {/* Sin overflow-hidden: recortaba el desplegable de Habilidades, que sale por debajo de la última sección */}
      <form onSubmit={handleSubmit} noValidate className="rounded-[17px] border border-line bg-surface">
        <Section number="01" title="Información principal" help="Lo primero que verán los freelancers.">
          <Field id={`${id}-title`} label="Título del proyecto" error={errors.title} count={values.title.length} max={LIMITS.title[1]}>
            <input
              id={`${id}-title`}
              value={values.title}
              onChange={(event) => setField('title', event.target.value)}
              placeholder="Ej. Web para pizzería"
              maxLength={LIMITS.title[1]}
              aria-invalid={Boolean(errors.title)}
              aria-describedby={describedBy('title')}
              className={`${inputClass(errors.title)} min-h-12 pr-16`}
            />
          </Field>
          <Field
            id={`${id}-description`}
            label="Descripción"
            error={errors.description}
            count={values.description.length}
            max={LIMITS.description[1]}
          >
            <textarea
              id={`${id}-description`}
              value={values.description}
              onChange={(event) => setField('description', event.target.value)}
              placeholder="Describe el problema, el resultado que esperas y cualquier detalle importante…"
              maxLength={LIMITS.description[1]}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={describedBy('description')}
              className={`${inputClass(errors.description)} h-40 resize-y pb-7 pt-3 leading-relaxed`}
            />
          </Field>
        </Section>

        <Section number="02" title="Presupuesto y fecha" help="Define expectativas claras desde el inicio.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id={`${id}-budget`} label="Presupuesto" error={errors.budget}>
              <div
                className={`flex min-h-12 items-center overflow-hidden rounded-[10px] border bg-surface focus-within:border-ink focus-within:ring-[3px] focus-within:ring-ink/5 ${
                  errors.budget ? 'border-error' : 'border-gray-300'
                }`}
              >
                <span className="flex h-12 items-center border-r border-line bg-paper px-3 text-sm text-muted">S/</span>
                <input
                  id={`${id}-budget`}
                  type="number"
                  inputMode="decimal"
                  min={LIMITS.minBudget}
                  step="0.01"
                  value={values.budget}
                  onChange={(event) => setField('budget', event.target.value)}
                  placeholder="600.00"
                  aria-invalid={Boolean(errors.budget)}
                  aria-describedby={describedBy('budget')}
                  className="h-12 w-full min-w-0 bg-transparent px-3 text-sm tabular-nums outline-none"
                  style={{ outline: 'none' }}
                />
              </div>
              {!editing && split.clientTotal > 0 && (
                <p className="text-xs text-muted">
                  Es el total que pagarás: {formatBudget(split.freelancerAmount)} para el estudiante y {formatBudget(split.commission)} de
                  tarifa DEVUTEC ({formatRate(split.rate)}).
                </p>
              )}
            </Field>
            <Field id={`${id}-deadline`} label="Fecha límite" error={errors.deadline}>
              <input
                id={`${id}-deadline`}
                type="date"
                min={editing ? undefined : today()}
                value={values.deadline}
                onChange={(event) => setField('deadline', event.target.value)}
                aria-invalid={Boolean(errors.deadline)}
                aria-describedby={describedBy('deadline')}
                className={`${inputClass(errors.deadline)} min-h-12`}
              />
            </Field>
          </div>
          <Field id={`${id}-location`} label="Ubicación" optional>
            <input
              id={`${id}-location`}
              list={`${id}-districts`}
              value={values.location}
              onChange={(event) => setField('location', event.target.value)}
              placeholder="Todo Lima / Remoto"
              maxLength={100}
              className={`${inputClass(false)} min-h-12`}
            />
            <datalist id={`${id}-districts`}>
              {DISTRICTS.map((district) => (
                <option key={district} value={district} />
              ))}
            </datalist>
          </Field>
        </Section>

        {skillsFromAssistant ? (
          <Section number="03" title="Habilidades" help="Las eligió el asistente según lo que necesitas.">
            <p className="rounded-xl bg-paper p-4 text-sm leading-relaxed text-muted">
              No tienes que elegir tecnologías: el asistente ya definió qué debe saber el estudiante. Los postulantes verán estas
              habilidades en el detalle del proyecto.
            </p>
          </Section>
        ) : (
        <Section number="03" title="Habilidades" help={`Elige hasta ${LIMITS.maxSkills} habilidades que necesita el proyecto.`}>
          <div id={`${id}-skillIds`} tabIndex={-1} className="outline-none">
            {skills.error ? (
              <p className="text-sm text-error">No pudimos cargar las habilidades. Recarga la página para intentarlo de nuevo.</p>
            ) : (
              <SkillPicker
                skills={skills.data ?? []}
                value={values.skillIds}
                onChange={(ids) => setField('skillIds', ids)}
                label="Habilidades del proyecto"
                hideLabel
                max={LIMITS.maxSkills}
                error={Boolean(errors.skillIds)}
              />
            )}
            {errors.skillIds && <p className="mt-2 text-xs text-error">{errors.skillIds}</p>}
          </div>
        </Section>
        )}

        <Section number="04" title="Métricas de tu web" help="Opcional. Lo ves en tu perfil de DEVUTEC.">
          <label htmlFor={`${id}-metricsRequested`} className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-4 has-[:checked]:border-ink">
            <input
              id={`${id}-metricsRequested`}
              type="checkbox"
              checked={Boolean(values.metricsRequested)}
              onChange={(event) => setField('metricsRequested', event.target.checked)}
              className="mt-1 h-4 w-4 accent-[#0e0e0c]"
            />
            <span className="text-sm leading-relaxed">
              <strong className="font-semibold">Quiero ver cuántas personas visitan mi web y cuántas me contactan.</strong>
              <span className="mt-1 block text-xs text-muted">
                El estudiante deja instaladas las métricas de DEVUTEC sin costo extra. Las ves en tu perfil con 3 meses gratis.
              </span>
            </span>
          </label>
        </Section>

        {serverError && (
          <p role="alert" className="mx-[22px] mt-5 rounded-lg bg-error-light px-3.5 py-2.5 text-sm text-error md:mx-8">
            {serverError}
          </p>
        )}

        <div className="flex flex-col-reverse gap-2 p-[22px] sm:flex-row sm:justify-end md:px-8">
          <Button variant="ghost" onClick={onCancel} disabled={saving} className="w-full sm:w-auto">
            {editing ? 'Cancelar cambios' : 'Cancelar'}
          </Button>
          <Button type="submit" loading={saving} className="w-full sm:w-auto">
            {saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Publicar proyecto'}
            {!saving && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            )}
          </Button>
        </div>
      </form>

      <FormHelp editing={editing} />
    </div>
  )
}

ProjectForm.propTypes = {
  // Con proyecto es "Editar"; sin proyecto, "Publicar"
  initialProject: projectShape,
  // Borrador del asistente IA (solo al publicar): llena los campos y oculta la elección de habilidades
  draft: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    deadline: PropTypes.string,
    budgetTotal: PropTypes.number,
    category: PropTypes.string,
    commissionRate: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    skillIds: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string])),
    features: PropTypes.arrayOf(PropTypes.shape({ code: PropTypes.string.isRequired, quantity: PropTypes.number.isRequired })),
  }),
  saving: PropTypes.bool,
  serverError: PropTypes.node,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
}
