import SkillPicker from '../ui/SkillPicker'
import { STATUS_LABELS } from '../../utils/format'
import PropTypes from 'prop-types'
import { skillShape } from '../../utils/propShapes'

const FIELD =
  'h-10 w-full rounded-lg border border-line bg-surface px-2.5 text-xs transition-colors focus:border-ink'

function Group({ title, children, htmlFor }) {
  return (
    <div className="mb-[25px] border-b border-line pb-[25px] last:mb-0 last:border-b-0">
      {htmlFor ? (
        <label htmlFor={htmlFor} className="text-[11px] font-semibold tracking-[0.13em] text-muted">
          {title}
        </label>
      ) : (
        <p className="text-[11px] font-semibold tracking-[0.13em] text-muted">{title}</p>
      )}
      <div className="mt-[13px]">{children}</div>
    </div>
  )
}

// Columna de filtros de Explorar: estado, habilidades, presupuesto y fecha de entrega.
// El estado "ALL" significa "todos"; si no viene en la URL se muestran los abiertos.
export default function ProjectFilters({ filters, onFilterChange, skills }) {
  return (
    <div>
      <Group title="ESTADO" htmlFor="filtro-estado">
        <select id="filtro-estado" className={FIELD} value={filters.status} onChange={(event) => onFilterChange('status', event.target.value)}>
          <option value="ALL">Todos</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </Group>

      <Group title="HABILIDADES">
        {/* El título del grupo ya dice "HABILIDADES": la etiqueta del buscador queda solo para lectores de pantalla */}
        <div className="[&>div>div:nth-child(2)]:mt-0 [&>div>label:first-child]:sr-only">
          <SkillPicker
          skills={skills ?? []}
          value={filters.skillIds}
          onChange={(ids) => onFilterChange('skillIds', ids.join(','))}
          label="Filtrar por habilidades"
          placeholder="React, Figma…"
          />
        </div>
      </Group>

      <Group title="PRESUPUESTO">
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1.5 text-[9px] text-muted">
            Mínimo (S/)
            <input
              type="number"
              min="0"
              inputMode="numeric"
              placeholder="300"
              className={`${FIELD} text-ink`}
              value={filters.minBudget}
              onChange={(event) => onFilterChange('minBudget', event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-[9px] text-muted">
            Máximo (S/)
            <input
              type="number"
              min="0"
              inputMode="numeric"
              placeholder="1500"
              className={`${FIELD} text-ink`}
              value={filters.maxBudget}
              onChange={(event) => onFilterChange('maxBudget', event.target.value)}
            />
          </label>
        </div>
      </Group>

      <Group title="ENTREGA ANTES DE" htmlFor="filtro-fecha">
        <input
          id="filtro-fecha"
          type="date"
          className={FIELD}
          value={filters.deadlineBefore}
          onChange={(event) => onFilterChange('deadlineBefore', event.target.value)}
        />
      </Group>
    </div>
  )
}

Group.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
  htmlFor: PropTypes.string,
}

ProjectFilters.propTypes = {
  filters: PropTypes.shape({
    status: PropTypes.string,
    skillIds: PropTypes.arrayOf(PropTypes.string),
    minBudget: PropTypes.string,
    maxBudget: PropTypes.string,
    deadlineBefore: PropTypes.string,
  }).isRequired,
  onFilterChange: PropTypes.func.isRequired,
  skills: PropTypes.arrayOf(skillShape),
}
