import { useState } from 'react'
import Button from '../ui/Button'
import { useContractReviews } from '../../hooks/useContracts'
import { useToast } from '../../hooks/useToast'
import { contractService } from '../../services/contractService'
import { errorMessage } from '../../utils/errorMessage'

function Stars({ value }) {
  return (
    <span aria-label={`${value} de 5 estrellas`} className="text-yellow-500">
      {'★'.repeat(value)}
      <span className="text-gray-300">{'★'.repeat(5 - value)}</span>
    </span>
  )
}

//Reseñas de un contrato completado: muestra las que existen y, si el usuario aún no reseñó, el formulario
export default function ContractReviews({ contractId, userName, revieweeName }) {
  const toast = useToast()
  const { data: reviews, loading, reload } = useContractReviews(contractId)

  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [error, setError] = useState(null)
  const [sending, setSending] = useState(false)

  //El backend permite una sola reseña por persona en cada contrato
  const alreadyReviewed = reviews?.some((review) => review.authorName === userName)

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

  if (loading) return null

  return (
    <section className="space-y-4 border-t border-gray-100 pt-4">
      <h2 className="font-semibold text-gray-900">Reseñas</h2>

      {reviews?.length === 0 && <p className="text-sm text-gray-500">Todavía no hay reseñas en este contrato.</p>}

      {reviews?.map((review) => (
        <div key={review.id} className="rounded-lg bg-gray-50 px-4 py-3">
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="font-semibold text-gray-900">
              {review.authorName} → {review.revieweeName}
            </span>
            <Stars value={review.rating} />
          </div>
          {review.comment && <p className="mt-1 text-sm text-gray-700">{review.comment}</p>}
        </div>
      ))}

      {!alreadyReviewed && (
        <form onSubmit={handleSubmit} noValidate className="space-y-3 rounded-lg border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-700">¿Cómo fue trabajar con {revieweeName}?</p>

          <div className="flex gap-1" role="radiogroup" aria-label="Calificación">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`${n} estrella${n > 1 ? 's' : ''}`}
                onClick={() => {
                  setRating(n)
                  setError(null)
                }}
                className={`text-3xl ${n <= rating ? 'text-yellow-500' : 'text-gray-300'} hover:text-yellow-400`}
              >
                ★
              </button>
            ))}
          </div>

          <textarea
            rows={3}
            maxLength={1000}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Comentario opcional"
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-100"
          />

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <Button type="submit" loading={sending}>
            {sending ? 'Publicando...' : 'Publicar reseña'}
          </Button>
        </form>
      )}
    </section>
  )
}