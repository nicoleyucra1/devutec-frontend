import Button from '../ui/Button'
import Card from '../ui/Card'
import Input from '../ui/Input'
import SkillPicker from '../ui/SkillPicker'
import { fieldClass, labelClass } from './fieldStyles'
import { STATUS_LABELS } from '../../utils/format'

// Controles de filtro. El texto de búsqueda se maneja aparte para aplicarle debounce.
export default function ProjectFilters({ search, onSearchChange, filters, onFilterChange, skills, onClear }) {
  return (
    <Card className="mb-6">
      <form role="search" onSubmit={(event) => event.preventDefault()} className="grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2 lg:col-span-3">
          <Input
            label="Buscar"
            type="search"
            placeholder="Título o descripción"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>

        <label className="block">
          <span className={labelClass}>Estado</span>
          <select className={fieldClass} value={filters.status} onChange={(event) => onFilterChange('status', event.target.value)}>
            <option value="">Cualquier estado</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <div className="sm:col-span-2 lg:col-span-2">
          <SkillPicker skills={skills ?? []} value={filters.skillIds} onChange={(ids) => onFilterChange('skillIds', ids.join(','))} />
        </div>

        <Input
          label="Entrega antes de"
          type="date"
          value={filters.deadlineBefore}
          onChange={(event) => onFilterChange('deadlineBefore', event.target.value)}
        />

        <Input
          label="Presupuesto mín. (S/)"
          type="number"
          min="0"
          value={filters.minBudget}
          onChange={(event) => onFilterChange('minBudget', event.target.value)}
        />

        <Input
          label="Presupuesto máx. (S/)"
          type="number"
          min="0"
          value={filters.maxBudget}
          onChange={(event) => onFilterChange('maxBudget', event.target.value)}
        />

        <Button variant="secondary" onClick={onClear}>
          Limpiar filtros
        </Button>
      </form>
    </Card>
  )
}
