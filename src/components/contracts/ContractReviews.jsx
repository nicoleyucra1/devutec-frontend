import { useState } from 'react'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import Skeleton from '../ui/Skeleton'
import { useContractReviews } from '../../hooks/useContracts'
import { useToast } from '../../hooks/useToast'
import { contractService } from '../../services/contractService'
import { errorMessage } from '../../utils/errorMessage'

const MAX_COMMENT = 1000

function StarIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true">
      <path d="m12 2 3 6 6.5 1-4.7 4.6 1.1 6.4-5.9-3-5.9 3 1.1-6.4L2.5 9 9 8Z" />
    </svg>
  )
}

function Stars({ value, size = 16 }) {
  return (
    <span role="img" aria-label={`${value} de 5 estrellas`} className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= value ? 'text-pending' : 'text-line'}>
          <StarIcon size={size} />
        </span>
      ))}
    </span>
  )
}

const card = 'rounded-2xl border border-line bg-surface p-6 sm:p-[30px]'

// Reseñas de un contrato confirmado: muestra las que existen y, si el usuario aún no reseñó, el formulario
export default function ContractReviews({ contractId, userName, revieweeName }) {
  const toast = useToast()
  const { data: reviews, loading, reload } = useContractReviews(contractId)

  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [error, setError] = useState(null)
  const [sending, setSending] = useState(false)

  // El backend permite una sola reseña por persona en cada contrato
  const alreadyReviewed = reviews?.some((review) => review.authorName === userName)
  const shown = hover || rating

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (rating === 0) {
      setError('Elige una calificación de 1 a 5 estrellas')
      return
    }
    setError(null)
    setSending(true)
    try {
      await contractService.createReview(contractId, { rating, comment: comment.trim() || null })
      toast.success('¡Gracias! Tu reseña se publicó.')
      reload()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSending(false)
    }
  }

  if (loading) return <Skeleton className="h-48 w-full rounded-2xl" />

  return (
    <>
      {!alreadyReviewed && (
        <form onSubmit={handleSubmit} noValidate className={card}>
          <p className="text-[10px] font-semibold tracking-[0.13em] text-muted">TU RESEÑA</p>
          <h2 className="mb-1.5 mt-2.5 text-[26px] font-semibold tracking-[-0.02em]">¿Cómo fue trabajar con {revieweeName}?</h2>
          <p className="mb-6 text-xs text-muted">Tu reseña será pública en su perfil. Sé específico: ayuda a otros a decidir.</p>

          <fieldset className="mb-5">
            <legend className="mb-2 text-xs">Calificación</legend>
            <div className="flex items-center gap-3" onMouseLeave={() => setHover(0)}>
              <div role="radiogroup" aria-label="Calificación de 1 a 5 estrellas" className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={rating === n}
                    aria-label={`${n} estrella${n > 1 ? 's' : ''}`}
                    disabled={sending}
                    onMouseEnter={() => setHover(n)}
                    onClick={() => {
                      setRating(n)
                      setError(null)
                    }}
                    className={`rounded-md transition duration-150 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-progress ${
                      n <= shown ? 'text-pending' : 'text-line'
                    }`}
                  >
                    <StarIcon size={28} />
                  </button>
                ))}
              </div>
              <span className="text-xs tabular-nums text-muted">{shown ? `${shown}.0 de 5` : 'Sin calificar'}</span>
            </div>
          </fieldset>

          <label className="block">
            <span className="mb-2 block text-xs">Comentario</span>
            <textarea
              rows={4}
              maxLength={MAX_COMMENT}
              value={comment}
              disabled={sending}
              onChange={(event) => setComment(event.target.value)}
              placeholder="¿Qué hizo bien? ¿Qué mejorarías?"
              className="block w-full resize-y rounded-xl border border-line bg-surface px-3.5 py-3 text-sm outline-none transition-colors placeholder:text-muted focus:border-ink"
            />
            <small className="mt-1.5 block text-right text-[11px] tabular-nums text-muted">
              {comment.length}/{MAX_COMMENT}
            </small>
          </label>

          {error && (
            <p role="alert" className="mt-3 rounded-[10px] bg-error-light px-3.5 py-3 text-sm text-error">
              {error}
            </p>
          )}

          <Button type="submit" loading={sending} className="mt-4">
            {sending ? 'Publicando...' : 'Publicar reseña'}
          </Button>
        </form>
      )}

      {reviews?.map((review) => (
        <article key={review.id} className={card}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.13em] text-muted">
                {review.authorName === userName ? 'TU RESEÑA' : `RESEÑA DE ${review.authorName.toUpperCase()}`}
              </p>
              <h2 className="mt-2 text-lg font-semibold">Para {review.revieweeName}</h2>
            </div>
            <Badge color="green">Pública</Badge>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Stars value={review.rating} />
            <span className="text-xs tabular-nums text-muted">{review.rating}.0 de 5</span>
          </div>
          <p className="mt-4 font-serif text-[22px] leading-snug">“{review.comment || 'Sin comentario.'}”</p>
        </article>
      ))}
    </>
  )
}
