'use client'

import { useState } from 'react'
import { ESTABLISHMENT_TYPE_LABELS, SERVICE_CATEGORIES } from '@/lib/types'
import { formatPEN } from '@/lib/utils'
import Link from 'next/link'
import {
    MapPin, Phone, Star, Clock, ArrowLeft, Stethoscope, Navigation,
    DollarSign, Shield, CalendarPlus, MessageSquare, User
} from 'lucide-react'
import type { EstablishmentType } from '@/lib/types'
import { BookingModal } from '@/components/dashboard/booking-modal'

const typeEmoji: Record<string, string> = {
    clinic: '🏥', groomer: '✂️', walker: '🐕‍🦺', hospital: '🏨', pet_shop: '🛍️'
}

function StarRow({ rating, filled }: { rating: number; filled: boolean }) {
    return <Star className={`w-4 h-4 ${filled ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
}

export default function EstablishmentClient({ est, reviews }: { est: any; reviews: any[] }) {
    const [showBooking, setShowBooking] = useState(false)

    const estForModal = {
        id: est.id,
        name: est.name,
        ownerId: est.owner?.id || '',
        type: est.type,
        address: est.address,
        city: est.city,
    }

    return (
        <div className="min-h-screen bg-surface-50">
            {/* Hero Header */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white px-4 pt-6 pb-10">
                <div className="max-w-2xl mx-auto">
                    <Link href="/dashboard/discover" className="inline-flex items-center gap-1 text-sm text-white/70 hover:text-white mb-4">
                        <ArrowLeft className="w-4 h-4" /> Volver al buscador
                    </Link>
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl flex-shrink-0">
                            {typeEmoji[est.type] || '🏠'}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold">{est.name}</h1>
                            <p className="text-sm text-white/80 mt-1">
                                {ESTABLISHMENT_TYPE_LABELS[est.type as EstablishmentType] || est.type}
                                {est.district && ` · ${est.district}`}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                                {est.rating > 0 && (
                                    <span className="flex items-center gap-1 text-sm">
                                        <Star className="w-4 h-4 fill-amber-300 text-amber-300" /> {est.rating.toFixed(1)}
                                    </span>
                                )}
                                {est.owner && (
                                    <span className="flex items-center gap-1 text-sm text-white/70">
                                        <Stethoscope className="w-3.5 h-3.5" /> Dr. {est.owner.fullName}
                                        {est.owner.cmvpId && (
                                            <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">{est.owner.cmvpId}</span>
                                        )}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 -mt-6 space-y-4 pb-8">
                {/* Primary CTA — Reservar */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-card space-y-3">
                    <button
                        onClick={() => setShowBooking(true)}
                        className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-primary-600 text-white rounded-xl font-semibold text-base hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all hover:shadow-xl active:scale-[0.98]"
                    >
                        <CalendarPlus className="w-5 h-5" />
                        Solicitar Turno Digital
                    </button>
                    <p className="text-xs text-center text-slate-400">
                        Elige servicio y horario · Pago de acceso a plataforma: <strong className="text-slate-600">S/ 5.00</strong>
                    </p>
                    <div className="flex gap-2">
                        {est.phone && (
                            <a href={`tel:${est.phone}`} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">
                                <Phone className="w-4 h-4" /> Llamar
                            </a>
                        )}
                        <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${est.latitude},${est.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
                        >
                            <Navigation className="w-4 h-4" /> Cómo llegar
                        </a>
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
                    <h2 className="font-semibold text-slate-900">Información</h2>
                    <div className="flex items-start gap-2 text-sm text-slate-600">
                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <span>{est.address}{est.district ? `, ${est.district}` : ''}, {est.city}</span>
                    </div>
                    {est.description && (
                        <p className="text-sm text-slate-600">{est.description}</p>
                    )}
                    <div className="flex items-start gap-2 text-sm text-slate-600 mt-2">
                        <Clock className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <span>
                            {(() => {
                                try {
                                    const h = JSON.parse(est.operatingHours)
                                    if (h.is24h) return 'Atención 24 Horas'
                                    if (h.openTime && h.closeTime) return `Horario: ${h.openTime} - ${h.closeTime}`
                                    return 'Horario no especificado'
                                } catch { return 'Horario no especificado' }
                            })()}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-50 mt-3">
                        <Shield className="w-3.5 h-3.5 text-primary-500" />
                        Transacciones protegidas por Brofy
                    </div>
                </div>

                {/* Services */}
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <div className="p-4 border-b border-slate-100">
                        <h2 className="font-semibold text-slate-900">Servicios y Tarifas</h2>
                    </div>
                    {est.services.length === 0 ? (
                        <div className="p-6 text-center">
                            <DollarSign className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                            <p className="text-sm text-slate-500">Este establecimiento aún no ha publicado su tarifario</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {est.services.map((svc: any) => (
                                <div key={svc.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors">
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">{svc.name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs text-slate-400">
                                                {SERVICE_CATEGORIES.find(c => c.value === svc.category)?.label || svc.category}
                                            </span>
                                            <span className="flex items-center gap-0.5 text-xs text-slate-400">
                                                <Clock className="w-3 h-3" /> {svc.duration} min
                                            </span>
                                        </div>
                                        {svc.description && <p className="text-xs text-slate-400 mt-1">{svc.description}</p>}
                                    </div>
                                    <button
                                        onClick={() => setShowBooking(true)}
                                        className="text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg whitespace-nowrap hover:bg-emerald-100 transition-colors"
                                    >
                                        {formatPEN(svc.price)}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Reviews Section */}
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-primary-500" />
                            Valoraciones
                        </h2>
                        <span className="text-xs text-slate-500">{reviews.length} reseña{reviews.length !== 1 ? 's' : ''}</span>
                    </div>

                    {reviews.length === 0 ? (
                        <div className="p-8 text-center">
                            <Star className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                            <p className="text-sm text-slate-500">Aún no hay valoraciones. ¡Sé el primero!</p>
                        </div>
                    ) : (
                        <div className="p-4 space-y-4">
                            {/* Summary */}
                            <div className="flex items-center gap-6 pb-4 border-b border-slate-100">
                                <div className="text-center">
                                    <p className="text-5xl font-black text-slate-900">{est.rating.toFixed(1)}</p>
                                    <div className="flex gap-0.5 justify-center mt-1">
                                        {[1,2,3,4,5].map(n => (
                                            <Star key={n} className={`w-4 h-4 ${n <= Math.round(est.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">{reviews.length} reseña{reviews.length !== 1 ? 's' : ''}</p>
                                </div>
                                <div className="flex-1 space-y-1.5">
                                    {[5,4,3,2,1].map(star => {
                                        const count = reviews.filter(r => r.rating === star).length
                                        const pct = reviews.length ? (count / reviews.length) * 100 : 0
                                        return (
                                            <div key={star} className="flex items-center gap-2">
                                                <span className="text-xs text-slate-500 w-3">{star}</span>
                                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                                </div>
                                                <span className="text-xs text-slate-400 w-4">{count}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Individual reviews */}
                            <div className="space-y-4">
                                {reviews.map((review: any) => (
                                    <div key={review.id} className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                                                <User className="w-4 h-4 text-primary-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-slate-900">
                                                    {review.client?.fullName || 'Usuario'}
                                                </p>
                                                <div className="flex items-center gap-1.5">
                                                    <div className="flex gap-0.5">
                                                        {[1,2,3,4,5].map(n => (
                                                            <Star key={n} className={`w-3 h-3 ${n <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                                                        ))}
                                                    </div>
                                                    <span className="text-xs text-slate-400">
                                                        {new Date(review.createdAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {review.comment && (
                                            <p className="text-sm text-slate-600 pl-11">{review.comment}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <BookingModal
                establishment={estForModal as any}
                isOpen={showBooking}
                onClose={() => setShowBooking(false)}
            />
        </div>
    )
}
