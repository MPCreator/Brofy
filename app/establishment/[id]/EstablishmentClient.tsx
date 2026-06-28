'use client'

import { useState, useMemo } from 'react'
import { ESTABLISHMENT_TYPE_LABELS, SERVICE_CATEGORIES } from '@/lib/types'
import { formatPEN } from '@/lib/utils'
import Link from 'next/link'
import {
    MapPin, Phone, Star, Clock, ArrowLeft, Stethoscope, Navigation,
    DollarSign, Shield, CalendarPlus, MessageSquare, User, Lock
} from 'lucide-react'
import type { EstablishmentType } from '@/lib/types'
import { BookingModal } from '@/components/dashboard/booking-modal'
import { saveLastEstablishment } from '@/components/dashboard/quick-reschedule'
import { useRouter } from 'next/navigation'
import SafeImage from '@/components/ui/SafeImage'

const typeEmoji: Record<string, string> = {
    clinic: '🏥', hospital: '🏥', groomer: '✂️', walker: '🦮', lodging: '🏨', trainer: '🎓', other: '🐾'
}

function parseDescriptionAndTags(desc: string | null) {
    if (!desc) return { descriptionText: '', tags: [] }
    const match = desc.match(/\[Atiende:\s*([^\]]+)\]/)
    if (match) {
        const tags = match[1].split(',').map((t: string) => t.trim()).filter(Boolean)
        const descriptionText = desc.replace(/\[Atiende:\s*[^\]]+\]/, '').trim()
        return { descriptionText, tags }
    }
    return { descriptionText: desc, tags: [] }
}

function StarRow({ rating, filled }: { rating: number; filled: boolean }) {
    return <Star className={`w-4 h-4 ${filled ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
}

export default function EstablishmentClient({ est, reviews, session }: { est: any; reviews: any[]; session?: any }) {
    const router = useRouter()
    const [showBooking, setShowBooking] = useState(false)
    const initialPhotos = est.photoUrl ? est.photoUrl.split(',').map((url: string) => url.trim()).filter((url: string) => {
        const clean = url.toLowerCase();
        return clean.length > 0 && clean !== 'null' && clean !== 'undefined';
    }) : [];
    const [loadedPhotos, setLoadedPhotos] = useState<string[]>([]);

    const handleBookingClick = () => {
        if (!session) {
            router.push(`/login?from=/establishment/${est.id}`)
        } else {
            saveLastEstablishment(est.id, est.name)
            setShowBooking(true)
        }
    }

    const estForModal = useMemo(() => ({
        id: est.id,
        name: est.name,
        ownerId: est.owner?.id || '',
        type: est.type,
        address: est.address,
        city: est.city,
        services: est.services || [],
        operatingHours: est.operatingHours,
        blockedDates: est.blockedDates,
        concurrentSlots: est.concurrentSlots,
    }), [est])

    return (
        <div className="min-h-screen bg-surface-50">
            {/* Hero Header */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white px-4 pt-6 pb-10">
                <div className="max-w-2xl mx-auto">
                    <Link href="/dashboard/discover" className="inline-flex items-center gap-1 text-sm text-white/70 hover:text-white mb-4">
                        <ArrowLeft className="w-4 h-4" /> Volver al buscador
                    </Link>
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                            <SafeImage
                                src={est.logoUrl || ''}
                                alt={est.name}
                                className="w-full h-full object-cover"
                                bare
                                fallback={
                                    initialPhotos.length > 0 ? (
                                        <SafeImage
                                            src={initialPhotos[0]}
                                            alt={est.name}
                                            className="w-full h-full object-cover"
                                            bare
                                            fallback={<span className="text-3xl">{est.type ? est.type.split(',').map((t: string) => typeEmoji[t.trim()] || '').filter(Boolean).join('') || '🏠' : '🏠'}</span>}
                                        />
                                    ) : (
                                        <span className="text-3xl">{est.type ? est.type.split(',').map((t: string) => typeEmoji[t.trim()] || '').filter(Boolean).join('') || '🏠' : '🏠'}</span>
                                    )
                                }
                            />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold">{est.name}</h1>
                            <p className="text-sm text-white/80 mt-1">
                                {est.type ? est.type.split(',').map((t: string) => ESTABLISHMENT_TYPE_LABELS[t.trim() as EstablishmentType] || t.trim()).join(' · ') : ''}
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
                                            <span className="text-xs bg-white/20 px-2 py-0.5 rounded flex items-center gap-1 group relative cursor-help" title="Colegio de Médicos Veterinarios del Perú: Colegiatura registrada por el profesional. Brofy muestra esta información declarada con fines informativos; la atención y decisiones clínicas son responsabilidad exclusiva del médico y del local.">
                                                🩺 Vet. Colegiado CMVP: {est.owner.cmvpId}
                                            </span>
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
                        onClick={handleBookingClick}
                        className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-primary-600 text-white rounded-xl font-semibold text-base hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all hover:shadow-xl active:scale-[0.98]"
                    >
                        <CalendarPlus className="w-5 h-5" />
                        Solicitar Turno
                    </button>
                    <p className="text-xs text-center text-slate-400">
                        Elige servicio y horario · Acceso a plataforma: <strong className="text-slate-600">S/ 5.00</strong>
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

                {/* Hidden background preloader to verify images */}
                <div className="hidden" aria-hidden="true">
                    {initialPhotos.map((url: string, index: number) => (
                        <SafeImage
                            key={index}
                            src={url}
                            alt="Preload"
                            fallback={<></>}
                            onLoad={() => {
                                setLoadedPhotos(prev => prev.includes(url) ? prev : [...prev, url])
                            }}
                        />
                    ))}
                </div>

                {/* Photo Gallery (shown if at least 1 photo loads successfully) */}
                {loadedPhotos.length >= 1 && (
                    <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3 shadow-sm">
                        <h2 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                            🖼️ Galería del Local
                        </h2>
                        <div className="grid grid-cols-2 gap-2">
                            {loadedPhotos.map((url: string, index: number) => (
                                <div key={index} className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-slate-200/60 shadow-sm relative group">
                                    <SafeImage 
                                        src={url} 
                                        alt={`Imagen ${index + 1}`} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" 
                                        fallback={null}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Info Card */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
                    <h2 className="font-semibold text-slate-900">Información</h2>
                    <div className="flex items-start gap-2 text-sm text-slate-600">
                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <span>{est.address}{est.district ? `, ${est.district}` : ''}, {est.city}</span>
                    </div>
                    {est.description && (() => {
                        const parsed = parseDescriptionAndTags(est.description)
                        return (
                            <div className="space-y-3">
                                {parsed.descriptionText && (
                                    <p className="text-sm text-slate-650 leading-relaxed whitespace-pre-line">{parsed.descriptionText}</p>
                                )}
                                {parsed.tags.length > 0 && (
                                    <div className="border-t border-slate-100 pt-2.5 mt-1">
                                        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                            🐾 Especies Atendidas
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {parsed.tags.map((tag: string) => (
                                                <span key={tag} className="text-[11px] px-2.5 py-0.5 bg-primary-50 text-primary-750 font-bold rounded-lg border border-primary-100/50">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })()}
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
                                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                            {(() => {
                                                const cat = SERVICE_CATEGORIES.find(c => c.value === svc.category);
                                                const label = cat?.label || svc.category;
                                                
                                                let colorClass = 'bg-slate-50 text-slate-600 border-slate-200';
                                                switch (svc.category) {
                                                    case 'consultation':
                                                        colorClass = 'bg-primary-50 text-primary-700 border-primary-100';
                                                        break;
                                                    case 'vaccination':
                                                        colorClass = 'bg-teal-50 text-teal-700 border-teal-100';
                                                        break;
                                                    case 'grooming':
                                                        colorClass = 'bg-cyan-50 text-cyan-700 border-cyan-100';
                                                        break;
                                                    case 'surgery':
                                                        colorClass = 'bg-slate-100 text-slate-700 border-slate-200';
                                                        break;
                                                    case 'deworming':
                                                        colorClass = 'bg-primary-100/50 text-primary-800 border-primary-200/50';
                                                        break;
                                                    case 'test':
                                                        colorClass = 'bg-cyan-100/50 text-cyan-800 border-cyan-200/50';
                                                        break;
                                                    case 'walk':
                                                        colorClass = 'bg-teal-100/50 text-teal-800 border-teal-200/50';
                                                        break;
                                                    case 'bath':
                                                        colorClass = 'bg-primary-600 text-white border-transparent';
                                                        break;
                                                }
                                                
                                                return (
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${colorClass} uppercase tracking-wider`}>
                                                        {label}
                                                    </span>
                                                )
                                            })()}
                                            <span className="flex items-center gap-0.5 text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                                                <Clock className="w-3 h-3 text-slate-400" /> {svc.duration} min
                                            </span>
                                            {svc.tariffUpdatedAt && (
                                                <span className="text-[10px] text-slate-400 bg-slate-150/50 px-1.5 py-0.5 rounded" title="Fecha de última actualización del precio">
                                                    Tarifa del: {new Date(svc.tariffUpdatedAt).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                </span>
                                            )}
                                        </div>
                                        {svc.description && <p className="text-xs text-slate-400 mt-1">{svc.description}</p>}
                                    </div>
                                    <button
                                        onClick={handleBookingClick}
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
