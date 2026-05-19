'use client'

import { useState } from 'react'
import { Star, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { createReview } from '@/lib/actions'

interface ReviewFormProps {
    appointmentId: string
    establishmentId: string
    establishmentName: string
    alreadyReviewed: boolean
    existingRating?: number
}

const LABELS = ['', '😞 Malo', '😕 Regular', '😐 Aceptable', '😊 Bueno', '🤩 Excelente']

export function ReviewForm({
    appointmentId,
    establishmentId,
    establishmentName,
    alreadyReviewed,
    existingRating,
}: ReviewFormProps) {
    const [rating, setRating] = useState(0)
    const [hovered, setHovered] = useState(0)
    const [comment, setComment] = useState('')
    const [submitted, setSubmitted] = useState(alreadyReviewed)
    const [loading, setLoading] = useState(false)
    const [showComment, setShowComment] = useState(false)

    // Already rated — show static badge
    if (submitted) {
        return (
            <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-emerald-50 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-xs text-emerald-700 font-medium">
                    Valoraste esta atención con {existingRating || rating} ★
                </span>
            </div>
        )
    }

    const handleStarClick = (n: number) => {
        setRating(n)
        setShowComment(true)
    }

    const handleSubmit = async () => {
        if (!rating) return
        setLoading(true)
        const res = await createReview({ appointmentId, establishmentId, rating, comment: comment || undefined })
        setLoading(false)
        if (res.success) {
            toast.success('¡Gracias por valorar!')
            setSubmitted(true)
        } else {
            toast.error(res.error || 'Error al enviar')
        }
    }

    return (
        <div className="mt-3 border-t border-slate-100 pt-3 space-y-3">
            {/* Prompt */}
            <p className="text-xs font-semibold text-slate-600">
                ¿Cómo fue tu atención en <span className="text-slate-900">{establishmentName}</span>?
            </p>

            {/* Stars — InDrive style: always visible, tap once to rate */}
            <div className="flex items-center gap-2">
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(n => (
                        <button
                            key={n}
                            onMouseEnter={() => setHovered(n)}
                            onMouseLeave={() => setHovered(0)}
                            onClick={() => handleStarClick(n)}
                            className="transition-transform hover:scale-110 active:scale-95"
                        >
                            <Star
                                className={`w-8 h-8 transition-all duration-150 ${
                                    n <= (hovered || rating)
                                        ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                                        : 'text-slate-200 fill-slate-100'
                                }`}
                            />
                        </button>
                    ))}
                </div>
                {(hovered || rating) > 0 && (
                    <span className="text-xs font-bold text-amber-700 animate-in fade-in duration-150">
                        {LABELS[hovered || rating]}
                    </span>
                )}
            </div>

            {/* Comment box — appears after star selection */}
            {showComment && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <textarea
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        placeholder="Agrega un comentario (opcional)..."
                        rows={2}
                        maxLength={300}
                        className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl resize-none bg-white focus:outline-none focus:ring-2 focus:ring-primary-300"
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-60"
                    >
                        {loading ? 'Enviando...' : 'Enviar valoración'}
                    </button>
                    <p className="text-[10px] text-center text-slate-400">
                        La valoración es definitiva y pública. No podrá modificarse.
                    </p>
                </div>
            )}
        </div>
    )
}
