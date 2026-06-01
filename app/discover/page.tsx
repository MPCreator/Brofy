'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { getNearbyEstablishments } from '@/lib/actions'
import { getGoogleMapsDirectionsUrl } from '@/lib/utils'
import {
    MapPin,
    Navigation,
    Star,
    Phone,
    Loader2,
    LocateFixed,
    AlertCircle,
    ExternalLink,
    ArrowLeft,
    SlidersHorizontal,
    Clock,
    DollarSign,
    ShieldAlert
} from 'lucide-react'
import { ESTABLISHMENT_TYPE_LABELS } from '@/lib/types'
import type { EstablishmentWithDistance, EstablishmentType } from '@/lib/types'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import PhotoCarousel from '@/components/landing/PhotoCarousel'
import { getSession } from '@/lib/auth'

const CATEGORIES = [
    { value: 'all', label: 'Todos', emoji: '🏠' },
    { value: 'clinic', label: 'Veterinarias', emoji: '🏥' },
    { value: 'groomer', label: 'Spas & Grooming', emoji: '✂️' },
    { value: 'walker', label: 'Paseadores', emoji: '🦮' },
    { value: 'hospital', label: 'Hospedajes', emoji: '🏨' },
    { value: 'emergency', label: 'Urgencias 24/7', emoji: '🚨' },
]

function SearchParamsHandler({ 
    setActiveFilter, 
    setDistrictQuery,
    setSelectedDate
}: { 
    setActiveFilter: (val: string) => void
    setDistrictQuery: (val: string) => void 
    setSelectedDate: (val: string) => void
}) {
    const searchParams = useSearchParams()
    
    useEffect(() => {
        const type = searchParams.get('type')
        const district = searchParams.get('district')
        const date = searchParams.get('date')
        
        if (type) {
            setActiveFilter(type)
        }
        if (district) {
            setDistrictQuery(district)
        }
        if (date) {
            setSelectedDate(date)
        }
    }, [searchParams, setActiveFilter, setDistrictQuery, setSelectedDate])

    return null
}

export default function DiscoverPage() {
    const [session, setSession] = useState<any>(null)
    const [loadingSession, setLoadingSession] = useState(true)

    useEffect(() => {
        getSession().then(sess => {
            setSession(sess)
            setLoadingSession(false)
        })
    }, [])

    const [establishments, setEstablishments] = useState<EstablishmentWithDistance[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [activeFilter, setActiveFilter] = useState('all')
    const [districtQuery, setDistrictQuery] = useState('')
    const [selectedDate, setSelectedDate] = useState('')
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
    const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'name'>('distance')
    
    // Advanced Filters State
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [minRating, setMinRating] = useState<number>(0)
    const [maxPrice, setMaxPrice] = useState<number>(9999)
    const [only24h, setOnly24h] = useState<boolean>(false)

    const loadEstablishments = useCallback(async (filter: string, loc: { lat: number; lng: number }) => {
        setLoading(true)
        setError('')
        try {
            // Fetch all to allow client-side category and advanced filtering
            const data = await getNearbyEstablishments(
                loc.lat,
                loc.lng,
                filter === 'all' || filter === 'emergency' ? undefined : filter
            )
            setEstablishments(data)
        } catch {
            setError('Error al cargar establecimientos')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
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

    // Sort establishments
    const sortedEstablishments = [...establishments].sort((a, b) => {
        if (sortBy === 'distance') return a.distanceKm - b.distanceKm
        if (sortBy === 'rating') return b.rating - a.rating
        if (sortBy === 'name') return a.name.localeCompare(b.name)
        return 0
    })

    // 1. Filter by category (client side emergency fallback support)
    const categoryFiltered = activeFilter === 'all'
        ? sortedEstablishments
        : activeFilter === 'emergency'
            ? sortedEstablishments.filter(est => est.type === 'clinic' || est.type === 'hospital')
            : sortedEstablishments.filter(est => est.type === activeFilter)

    // 2. Filter by search district/name/address
    const districtFiltered = districtQuery.trim()
        ? categoryFiltered.filter(est => 
            est.district?.toLowerCase().includes(districtQuery.toLowerCase()) || 
            est.address?.toLowerCase().includes(districtQuery.toLowerCase()) ||
            est.name?.toLowerCase().includes(districtQuery.toLowerCase())
          )
        : categoryFiltered

    // 3. Filter by date availability
    const dateFiltered = selectedDate
        ? districtFiltered.filter(est => {
            try {
                const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
                const searchDate = new Date(selectedDate + 'T00:00:00')
                const dayOfWeek = dayNames[searchDate.getDay()]
                
                const hours = est.operatingHours as any
                if (hours?.is24h) return true
                return !!hours?.[dayOfWeek]
            } catch {
                return true
            }
        })
        : districtFiltered

    // 4. Advanced Filter: Min Rating
    const ratingFiltered = minRating > 0
        ? dateFiltered.filter(est => est.rating >= minRating)
        : dateFiltered

    // 5. Advanced Filter: Max Price
    const priceFiltered = maxPrice < 9999
        ? ratingFiltered.filter(est => {
            if (!est.services || est.services.length === 0) return false
            const minPrice = Math.min(...est.services.map((s: any) => s.price))
            return minPrice <= maxPrice
          })
        : ratingFiltered

    // 6. Advanced Filter: Only 24h
    const finalFiltered = only24h
        ? priceFiltered.filter(est => {
            const hours = est.operatingHours as any
            return hours?.is24h === true
          })
        : priceFiltered

    const getMinPriceLabel = (est: any) => {
        if (est.services && est.services.length > 0) {
            const minPrice = Math.min(...est.services.map((s: any) => s.price))
            return `Servicios desde S/ ${minPrice.toFixed(2)}`
        }
        return 'Sin servicios registrados'
    }

    return (
        <main className="min-h-screen bg-slate-50 flex flex-col">
            <Suspense fallback={null}>
                <SearchParamsHandler 
                    setActiveFilter={setActiveFilter} 
                    setDistrictQuery={setDistrictQuery} 
                    setSelectedDate={setSelectedDate}
                />
            </Suspense>

            {/* Public Header / Navbar */}
            <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm w-full">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center">
                            <Image 
                                src="/logo.png" 
                                alt="Brofy Logo" 
                                width={240} 
                                height={131} 
                                className="object-contain h-[48px] sm:h-[64px]" 
                                style={{ width: 'auto' }}
                                priority 
                            />
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        {!loadingSession && (
                            session ? (
                                <Link 
                                    href={
                                        session.role === 'admin' 
                                            ? '/dashboard/admin' 
                                            : session.role === 'vet' || session.role === 'provider' 
                                                ? '/dashboard/vet' 
                                                : '/dashboard/client'
                                    } 
                                    className="bg-primary-600 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-primary-700 transition-all shadow-md hover:shadow-lg active:scale-95"
                                >
                                    Mi Panel 🐾
                                </Link>
                            ) : (
                                <>
                                    <Link href="/login" className="text-sm font-semibold text-slate-650 hover:text-primary-600 transition-colors">
                                        Ingresar
                                    </Link>
                                    <Link href="/signup" className="bg-primary-600 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-primary-700 transition-all shadow-md hover:shadow-lg active:scale-95">
                                        Crear cuenta
                                    </Link>
                                </>
                            )
                        )}
                    </div>
                </div>
            </header>

            {/* Advanced Dashboard Search Layout */}
            <div className="max-w-7xl mx-auto w-full px-6 py-10 flex-1 space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Descubrir Especialistas</h1>
                        <p className="text-sm md:text-base text-slate-400 mt-2 font-medium">Compara y agenda servicios en los locales mejor valorados de Lima</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className={`flex items-center gap-2 border px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95 ${
                                showAdvanced || minRating > 0 || maxPrice < 9999 || only24h
                                    ? 'bg-primary-50 border-primary-350 text-primary-700'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            <span>Filtros Avanzados</span>
                            {(minRating > 0 || maxPrice < 9999 || only24h) && (
                                <span className="ml-1 w-2.5 h-2.5 rounded-full bg-primary-600"></span>
                            )}
                        </button>
                        <button
                            onClick={refreshLocation}
                            className="p-3 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                            title="Actualizar ubicación"
                        >
                            <LocateFixed className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Primary Search Fields Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-3xl border border-slate-200/70 shadow-sm">
                    {/* District Input */}
                    <div className="relative flex items-center col-span-1 md:col-span-2">
                        <MapPin className="absolute left-4 w-5 h-5 text-slate-400" />
                        <input 
                            type="text"
                            value={districtQuery}
                            onChange={(e) => setDistrictQuery(e.target.value)}
                            placeholder="Buscar por distrito, dirección o nombre del local..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 hover:bg-slate-100/75 focus:bg-white border border-transparent focus:border-primary-400 rounded-2xl text-sm focus:outline-none transition-all font-medium text-slate-800"
                        />
                    </div>
                    
                    {/* Date Input */}
                    <div className="relative flex items-center">
                        <input 
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full pl-4 pr-10 py-3 bg-slate-50 hover:bg-slate-100/75 focus:bg-white border border-transparent focus:border-primary-400 rounded-2xl text-sm focus:outline-none transition-all font-bold text-slate-700 cursor-pointer"
                        />
                    </div>
                </div>

                {/* Advanced Multi-Filter Box */}
                {showAdvanced && (
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-3 duration-300">
                        {/* Rating Filter */}
                        <div className="space-y-2">
                            <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">⭐ Valoración Mínima</label>
                            <div className="flex gap-2">
                                {[0, 4.0, 4.5].map((stars) => (
                                    <button
                                        key={stars}
                                        onClick={() => setMinRating(stars)}
                                        className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                                            minRating === stars
                                                ? 'bg-primary-600 text-white border-primary-600'
                                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-350'
                                        }`}
                                    >
                                        {stars === 0 ? 'Todos' : `⭐ ${stars}+`}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price Limit Filter */}
                        <div className="space-y-2">
                            <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">💰 Tarifa Inicial Máxima</label>
                            <div className="flex gap-2">
                                {[9999, 50, 100].map((price) => (
                                    <button
                                        key={price}
                                        onClick={() => setMaxPrice(price)}
                                        className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                                            maxPrice === price
                                                ? 'bg-primary-600 text-white border-primary-600'
                                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-350'
                                        }`}
                                    >
                                        {price === 9999 ? 'Todos' : `S/ ${price} o menos`}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Open 24 Hours / Clean state trigger */}
                        <div className="space-y-2 flex flex-col justify-end">
                            <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">⏱️ Horario y Estado</label>
                            <div className="flex items-center gap-3 h-10">
                                <button
                                    onClick={() => setOnly24h(!only24h)}
                                    className={`w-full py-2.5 px-4 text-xs font-extrabold rounded-xl border transition-all flex items-center justify-center gap-2 ${
                                        only24h
                                            ? 'bg-primary-50 border-primary-200 text-primary-700 shadow-sm'
                                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-350'
                                    }`}
                                >
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>Atención 24 Horas</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Emoji Categories (Homepage Style) */}
                <div className="flex items-center space-x-6 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-hide py-2">
                    {CATEGORIES.map((cat) => {
                        const isActive = activeFilter === cat.value
                        return (
                            <button
                                key={cat.value}
                                onClick={() => setActiveFilter(cat.value)}
                                className={`flex flex-col items-center space-y-2.5 pb-2 border-b-2 transition-all min-w-[90px] md:min-w-[110px] outline-none ${
                                    isActive
                                        ? 'border-primary-600 text-primary-600 font-extrabold scale-105'
                                        : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                                }`}
                            >
                                <span className={`text-2xl transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-115'}`}>
                                    {cat.emoji}
                                </span>
                                <span className="text-xs font-bold tracking-tight">{cat.label}</span>
                            </button>
                        )
                    })}
                </div>

                {/* Location context bar & Reset indicators */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <div className="flex flex-wrap gap-2">
                        {userLocation && (
                            <span className="text-xs font-bold text-slate-400 bg-slate-100/80 border border-slate-200/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-inner">
                                📍 Lima, Perú
                            </span>
                        )}
                        {selectedDate && (
                            <span className="text-xs font-bold text-primary-700 bg-primary-50 border border-primary-100/60 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                                📅 Disponible: {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
                                <button onClick={() => setSelectedDate('')} className="hover:text-red-500 font-black ml-1">✕</button>
                            </span>
                        )}
                        {minRating > 0 && (
                            <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-100/60 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                                ⭐ {minRating}+ estrellas
                                <button onClick={() => setMinRating(0)} className="hover:text-red-500 font-black ml-1">✕</button>
                            </span>
                        )}
                        {maxPrice < 9999 && (
                            <span className="text-xs font-bold text-primary-700 bg-primary-50 border border-primary-100/60 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                                💸 S/ {maxPrice} o menos
                                <button onClick={() => setMaxPrice(9999)} className="hover:text-red-500 font-black ml-1">✕</button>
                            </span>
                        )}
                        {only24h && (
                            <span className="text-xs font-bold text-primary-700 bg-primary-50 border border-primary-100/60 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                                ⏱️ Solo 24H
                                <button onClick={() => setOnly24h(false)} className="hover:text-red-500 font-black ml-1">✕</button>
                            </span>
                        )}
                    </div>

                    {/* Order selector */}
                    {!loading && finalFiltered.length > 0 && (
                        <div className="flex items-center gap-2 bg-slate-100/70 border border-slate-200/50 p-1 rounded-xl shadow-inner">
                            {(['distance', 'rating', 'name'] as const).map(option => {
                                const labels = {
                                    distance: '📍 Cercanía',
                                    rating: '⭐ Valoración',
                                    name: '🔤 Nombre'
                                }
                                return (
                                    <button
                                        key={option}
                                        onClick={() => setSortBy(option)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            sortBy === option
                                                ? 'bg-white text-slate-800 shadow-sm font-black'
                                                : 'text-slate-500 hover:text-slate-800'
                                        }`}
                                    >
                                        {labels[option]}
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="flex items-center gap-2.5 text-xs text-amber-700 bg-amber-50 rounded-2xl px-4 py-3 border border-amber-200/50">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span className="font-semibold">{error}</span>
                    </div>
                )}

                {/* Grid de Resultados Airbnb (Homologado con Inicio) */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-28 bg-white rounded-[2.5rem] border border-slate-200/50 shadow-sm">
                        <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-4" />
                        <p className="text-sm font-bold text-slate-500">Cargando especialistas y tarifas...</p>
                    </div>
                ) : finalFiltered.length === 0 ? (
                    <div className="bg-white rounded-[2.5rem] border border-slate-200/50 p-20 text-center shadow-sm max-w-2xl mx-auto">
                        <span className="text-5xl block mb-4">🐾</span>
                        <h3 className="text-lg font-bold text-slate-800">No se encontraron especialistas</h3>
                        <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
                            Prueba cambiando los criterios de filtros avanzados o buscando un distrito diferente.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12 animate-in fade-in duration-300">
                        {finalFiltered.map((est) => {
                            const photos = est.photoUrl ? est.photoUrl.split(',').map((url: string) => url.trim()).filter((url: string) => {
                                const clean = url.toLowerCase();
                                return clean.length > 0 && clean !== 'null' && clean !== 'undefined';
                            }) : [];
                            
                            return (
                                <Link 
                                    href={`/establishment/${est.id}`} 
                                    key={est.id} 
                                    className="group cursor-pointer block animate-in fade-in zoom-in-95 duration-300"
                                >
                                    <div className="relative mb-4">
                                        <PhotoCarousel 
                                            photoUrls={photos} 
                                            establishmentName={est.name} 
                                            fallbackCategory={est.type}
                                        />
                                        {(est.type === 'clinic' || est.type === 'hospital') && (
                                            <span className="absolute top-3.5 left-3.5 bg-primary-600 text-white text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-md z-20">
                                                Verificado CMVP
                                            </span>
                                        )}
                                        <button 
                                            type="button"
                                            className="absolute top-3.5 right-3.5 bg-white/85 backdrop-blur-sm p-1.5 rounded-full text-xs shadow-sm hover:bg-white transition-all active:scale-90 z-20 hover:scale-105"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                        >
                                            ❤️
                                        </button>
                                    </div>
                                    
                                    <div className="flex justify-between items-start">
                                        <div className="min-w-0 flex-1 pr-2">
                                            <h3 className="font-extrabold text-slate-900 text-base group-hover:text-primary-600 transition-colors truncate tracking-tight">
                                                {est.name}
                                            </h3>
                                            <p className="text-slate-500 text-xs md:text-sm mt-1 truncate font-medium">
                                                {est.district || 'Lima'} • {est.address || 'Ubicación física'}
                                            </p>
                                            <p className="text-[11px] font-bold text-primary-650 mt-1 flex items-center gap-1.5">
                                                <span>📍</span> 
                                                <span>
                                                    {est.distanceKm < 1
                                                        ? `${(est.distanceKm * 1000).toFixed(0)} metros`
                                                        : `${est.distanceKm.toFixed(1)} km`}
                                                </span>
                                            </p>
                                        </div>
                                        {est.rating > 0 ? (
                                            <div className="flex items-center space-x-1 text-xs font-extrabold text-slate-800 shrink-0 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/40">
                                                <span>⭐</span>
                                                <span>{est.rating.toFixed(1)}</span>
                                                {est.reviewsCount !== undefined && est.reviewsCount > 0 && (
                                                    <span className="text-[10px] text-slate-400 font-normal ml-0.5">({est.reviewsCount})</span>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex items-center space-x-1 text-[10px] font-extrabold text-primary-700 shrink-0 bg-primary-50 px-2.5 py-1 rounded-lg border border-primary-100/50">
                                                <span>✨</span>
                                                <span>Nuevo</span>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs md:text-sm font-extrabold text-slate-850 mt-2.5">
                                        {getMinPriceLabel(est)}
                                    </p>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
        </main>
    )
}
