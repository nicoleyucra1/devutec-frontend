import { useState } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import SocialIcon from './SocialIcon'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { userService } from '../../services/userService'
import { errorMessage } from '../../utils/errorMessage'
import { filledLinks, shortLink, SOCIAL_NETWORKS } from '../../utils/socialLinks'

// Valores del formulario a partir de lo guardado: "@pizzeria" en vez del link completo, que también se acepta
const formFrom = (redes) => Object.fromEntries(SOCIAL_NETWORKS.map(({ key }) => [key, shortLink(key, redes?.[key])]))

// Redes del negocio del cliente (en "Mi cuenta"). Las ve el freelancer en el detalle de sus proyectos para
// conocer el estilo de la marca. Si no hay ninguna guardada, el formulario aparece directo.
export default function SocialLinksEditor() {
  const { user, updateUser } = useAuth()
  const toast = useToast()
  const saved = filledLinks(user.redes)
  const [editing, setEditing] = useState(false)
  const [values, setValues] = useState(() => formFrom(user.redes))
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const showForm = editing || saved.length === 0

  const startEditing = () => {
    setValues(formFrom(user.redes))
    setError(null)
    setEditing(true)
  }

  const save = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const links = Object.fromEntries(SOCIAL_NETWORKS.map(({ key }) => [key, values[key].trim()]))
      updateUser(await userService.updateLinks(links))
      setEditing(false)
      toast.success('Guardamos tus redes')
    } catch (err) {
      // El backend dice cuál está mal, por ejemplo "El link de Instagram no es válido"
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <p className="text-sm font-semibold">Redes de tu negocio</p>
      <p className="mt-1 text-sm text-muted">El freelancer las ve en tus proyectos para conocer el estilo de tu marca.</p>

      {showForm ? (
        <form onSubmit={save} noValidate className="mt-3 grid gap-3">
          {SOCIAL_NETWORKS.map((network) => (
            <Input
              key={network.key}
              label={network.label}
              name={network.key}
              value={values[network.key]}
              onChange={(event) => {
                const { value } = event.target
                setValues((prev) => ({ ...prev, [network.key]: value }))
                setError(null)
              }}
              placeholder={network.placeholder}
              type={network.key === 'sitioWeb' ? 'url' : 'text'}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              maxLength={255}
            />
          ))}
          {error && (
            <p role="alert" className="text-sm text-error">
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" loading={saving} className="min-h-11">
              {saving ? 'Guardando…' : 'Guardar redes'}
            </Button>
            {saved.length > 0 && (
              <Button variant="ghost" onClick={() => setEditing(false)} disabled={saving} className="min-h-11">
                Cancelar
              </Button>
            )}
          </div>
        </form>
      ) : (
        <div className="mt-3">
          <ul className="grid gap-2">
            {saved.map((link) => (
              <li key={link.key}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex max-w-full items-center gap-2 text-[15px] font-semibold hover:underline"
                >
                  <SocialIcon network={link.key} />
                  <span className="truncate">{shortLink(link.key, link.url)}</span>
                  <span className="sr-only">({link.label}, se abre en otra pestaña)</span>
                </a>
              </li>
            ))}
          </ul>
          <Button variant="secondary" onClick={startEditing} className="mt-3 min-h-10 px-4">
            Editar redes
          </Button>
        </div>
      )}
    </div>
  )
}
