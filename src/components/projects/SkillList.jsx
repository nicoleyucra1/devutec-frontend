import PropTypes from 'prop-types'
import { skillShape } from '../../utils/propShapes'

// Habilidades del proyecto como etiquetas
export default function SkillList({ skills }) {
  if (!skills?.length) return null
  return (
    <ul className="flex flex-wrap gap-1.5">
      {skills.map((skill) => (
        <li key={skill.id} className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">
          {skill.name}
        </li>
      ))}
    </ul>
  )
}

SkillList.propTypes = {
  skills: PropTypes.arrayOf(skillShape),
}
