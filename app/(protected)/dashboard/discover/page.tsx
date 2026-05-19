'use client'

import { useState, useEffect, useCallback } from 'react'
import { getNearbyEstablishments } from '@/lib/actions'
import { getGoogleMapsDirectionsUrl } from '@/lib/utils'
import {
    MapPin,
    Navigation,
    Star,
    Phone,
    QrCode,
    Loader2,
    LocateFixed,
    AlertCircle,
    ExternalLink,
} from 'lucide-react'
import { ESTABLISHMENT_TYPE_LABELS } from '@/lib/types'
import type { EstablishmentWithDistance, EstablishmentType } from '@/lib/types'
import Link from 'next/link'

const typeFilters: Array<{ value: string; label: string; emoji: string }> = [
    { value: 'all', label: 'Todos', emoji: '🏠' },
    { value: 'clinic', label: 'Veterinaria', emoji: '🏥' },
    { value: 'hospital', label: 'Hospital', emoji: '🏨' },
    { value: 'groomer', label: 'Grooming', emoji: '✂️' },
    { value: 'walker', label: 'Paseador', emoji: '🐕‍🦺' },
    { value: 'pet_shop', label: 'Pet Shop', emoji: '🛍️' },
]

export default function DiscoverPage() {
    const [establishments, setEstablishments] = useState<EstablishmentWithDistance[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [activeFilter, setActiveFilter] = useState('all')
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

    const loadEstablishments = useCallback(async (filter: string, loc: { lat: number; lng: number }) => {
        setLoading(true)
        setError('')
        try {
            const data = await getNearbyEstablishments(
                loc.lat,
                loc.lng,
                filter === 'all' ? undefined : filter
            )
            setEstablishments(data)
        } catch {
            setError('Error al cargar establecimientos')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        // Default to Lima centro immediately, then try geolocation
        const defaultLoc = { lat: -12.0464, lng: -77.0428 }
        setUserLocation(defaultLoc)
        loadEstablishments(activeFilter, defaultLoc)

        if (typeof navigator !== 'undefined' && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const loc = { lat: position.coords.latitude, lng: position.coords.longitude }
                    setUserLocation(loc)
                    loadEstablishments(activeFilter, loc)
                },
                () => {
                    setError('No se pudo obtener tu ubicación. Mostrando desde Lima centro.')
                },
                { enableHighAccuracy: true, timeout: 10000 }
            )
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (userLocation) {
            loadEstablishments(activeFilter, userLocation)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeFilter])

    function refreshLocation() {
        if (typeof navigator !== 'undefined' && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const loc = { lat: position.coords.latitude, lng: position.coords.longitude }
                    setUserLocation(loc)
                    loadEstablishments(activeFilter, loc)
                },
                () => setError('No se pudo obtener tu ubicación'),
                { enableHighAccuracy: true, timeout: 10000 }
            )
        }
    }

    return (
        <div className="space-y-4 pb-20 lg:pb-0">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Descubrir</h1>
                    <p className="text-sm text-slate-500">Servicios veterinarios cercanos</p>
                </div>
                <button
                    onClick={refreshLocation}
                    className="p-2.5 rounded-xl bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
                    title="Actualizar ubicación"
                >
                    <LocateFixed className="w-5 h-5" />
                </button>
            </div>

            {/* Location info */}
            {userLocation && (
                <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
                    <MapPin className="w-3.5 h-3.5 text-primary-500" />
                    Tu ubicación: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {error}
                </div>
            )}

            {/* Type Filters */}
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
                {typeFilters.map(filter => (
                    <button
                        key={filter.value}
                        onClick={() => setActiveFilter(filter.value)}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                            activeFilter === filter.value
                                ? 'bg-primary-600 text-white shadow-md'
                                : 'bg-white text-slate-600 border border-slate-200 hover:border-primary-200'
                        }`}
                    >
                        <span>{filter.emoji}</span>
                        {filter.label}
                    </button>
                ))}
            </div>

            {/* Results */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-3" />
                    <p className="text-sm text-slate-500">Buscando servicios cercanos...</p>
                </div>
            ) : establishments.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
                    <MapPin className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">No se encontraron establecimientos cercanos</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {establishments.map(est => (
                        <div
                            key={est.id}
                            className="bg-white rounded-2xl border border-slate-100 p-4 hover:border-primary-200 hover:shadow-card transition-all"
                        >
                            <div className="flex gap-3">
                                {/* Type badge — links to detail page */}
                                <Link href={`/establishment/${est.id}`} className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center text-xl flex-shrink-0 hover:bg-primary-100 transition-colors">
                                    {typeFilters.find(f => f.value === est.type)?.emoji || '🏠'}
                                </Link>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <Link href={`/establishment/${est.id}`} className="hover:text-primary-700">
                                            <h3 className="font-semibold text-slate-900 truncate">{est.name}</h3>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                {ESTABLISHMENT_TYPE_LABELS[est.type as EstablishmentType] || est.type}
                                                {est.district && ` · ${est.district}`}
                                            </p>
                                        </Link>
                                        {est.rating > 0 && (
                                            <span className="flex items-center gap-0.5 text-xs font-medium text-amber-600 flex-shrink-0">
                                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                                {est.rating.toFixed(1)}
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-xs text-slate-400 mt-1 truncate">{est.address}</p>

                                    {/* Distance + Actions */}
                                    <div className="flex items-center justify-between mt-3">
                                        <span className="flex items-center gap-1 text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                                            <Navigation className="w-3 h-3" />
                                            {est.distanceKm < 1
                                                ? `${(est.distanceKm * 1000).toFixed(0)} m`
                                                : `${est.distanceKm.toFixed(1)} km`}
                                        </span>

                                        <div className="flex gap-1.5">
                                            {est.phone && (
                                                <a href={`tel:${est.phone}`} className="p-2 rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors" title="Llamar">
                                                    <Phone className="w-4 h-4" />
                                                </a>
                                            )}

                                            <Link href={`/establishment/${est.id}`} className="p-2 rounded-lg bg-slate-50 text-slate-500 hover:bg-primary-50 hover:text-primary-600 transition-colors" title="Ver detalle">
                                                <ExternalLink className="w-4 h-4" />
                                            </Link>

                                            <Link href={`/checkin/${est.qrCodeToken}`} className="p-2 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors" title="Check-in">
                                                <QrCode className="w-4 h-4" />
                                            </Link>

                                            <a
                                                href={getGoogleMapsDirectionsUrl(est.latitude, est.longitude)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 px-3 py-2 bg-primary-600 text-white rounded-lg text-xs font-medium hover:bg-primary-700 transition-colors shadow-sm"
                                            >
                                                <Navigation className="w-3.5 h-3.5" />
                                                Ir
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
