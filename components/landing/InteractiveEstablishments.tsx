'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Star } from 'lucide-react'
import PhotoCarousel from './PhotoCarousel'

interface InteractiveEstablishmentsProps {
    establishments: any[]
}

const CATEGORIES = [
    { value: 'all', label: 'Todos', emoji: '🏠' },
    { value: 'clinic', label: 'Veterinarias', emoji: '🏥' },
    { value: 'groomer', label: 'Spas & Grooming', emoji: '✂️' },
    { value: 'walker', label: 'Paseadores', emoji: '🦮' },
    { value: 'lodging', label: 'Hospedajes', emoji: '🏨' },
    { value: 'trainer', label: 'Adiestradores', emoji: '🎓' },
    { value: 'other', label: 'Otros', emoji: '🐾' },
    { value: 'emergency', label: 'Urgencias 24/7', emoji: '🚨' },
]

export default function InteractiveEstablishments({ establishments }: InteractiveEstablishmentsProps) {
    const [activeFilter, setActiveFilter] = useState('all')

    // Filter establishments dynamically
    const filteredEsts = establishments.filter((est) => {
        if (activeFilter === 'all') return true
        const types = est.type ? est.type.split(',').map((t: string) => t.trim()) : []
        if (activeFilter === 'emergency') return types.includes('clinic') || types.includes('hospital')
        return types.includes(activeFilter)
    })

    // Slice to top 8 featured establishments
    const featuredEsts = filteredEsts.slice(0, 8)

    const getMinPriceLabel = (est: any) => {
        if (est.services && est.services.length > 0) {
            const minPrice = Math.min(...est.services.map((s: any) => s.price))
            return `Servicios desde S/ ${minPrice.toFixed(2)}`
        }
        return 'Sin servicios registrados'
    }

    return (
        <div className="space-y-14">
            {/* Categorías Rápidas (Estilo Íconos Flotantes - Ampliado) */}
            <section className="max-w-6xl mx-auto w-full px-6">
                <div className="flex items-center space-x-8 border-b border-slate-100 pb-5 overflow-x-auto scrollbar-hide py-3">
                    {CATEGORIES.map((cat) => {
                        const isActive = activeFilter === cat.value
                        return (
                            <button
                                key={cat.value}
                                onClick={() => setActiveFilter(cat.value)}
                                className={`flex flex-col items-center space-y-3 pb-2 border-b-2 transition-all min-w-[110px] md:min-w-[130px] outline-none ${
                                    isActive
                                        ? 'border-primary-600 text-primary-600 font-extrabold scale-105'
                                        : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-200'
                                }`}
                            >
                                <span className={`text-3xl md:text-4xl transition-transform duration-300 ${isActive ? 'scale-110 rotate-3' : 'group-hover:scale-115'}`}>
                                    {cat.emoji}
                                </span>
                                <span className="text-xs md:text-sm font-semibold tracking-tight">{cat.label}</span>
                            </button>
                        )
                    })}
                </div>
            </section>

            {/* Inventario de Establecimientos mejor valorados (Scroll/Grid Airbnb - Más Grande) */}
            <section id="descubrir" className="max-w-6xl mx-auto w-full px-6 mb-24 space-y-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                            {activeFilter === 'all' 
                                ? 'Especialistas mejor valorados en Lima' 
                                : CATEGORIES.find(c => c.value === activeFilter)?.label}
                        </h2>
                        <p className="text-sm md:text-base text-slate-400 mt-2">
                            Locales recomendados y evaluados para el óptimo cuidado de tu engreído.
                        </p>
                    </div>
                    <Link 
                        href={activeFilter === 'all' ? '/discover' : `/discover?type=${activeFilter === 'emergency' ? 'clinic' : activeFilter}`} 
                        className="flex items-center space-x-2 border border-slate-200 bg-white text-xs md:text-sm font-bold px-5 py-3 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <span>🎛️</span> <span>Ver todos los locales</span>
                    </Link>
                </div>

                {/* Grid de Tarjetas Estilo Airbnb con transición suave */}
                {featuredEsts.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-150 p-16 text-center shadow-sm">
                        <span className="text-5xl block mb-4">🐾</span>
                        <h3 className="text-lg font-bold text-slate-800">No hay locales registrados en esta categoría</h3>
                        <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">Pronto agregaremos más especialistas. ¡Vuelve a consultar o prueba otra categoría!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12 transition-all duration-500">
                        {featuredEsts.map((est) => {
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
                                            fallbackCategory={est.type ? est.type.split(',')[0].trim() : 'default'}
                                        />
                                        {((est.type || '').split(',').map((t: string) => t.trim()).some((t: string) => t === 'clinic' || t === 'hospital')) && (
                                            <div className="absolute top-3.5 left-3.5 group/tooltip z-20">
                                                <span className="bg-emerald-600 text-white text-[8px] sm:text-[9px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1 cursor-help">
                                                    🩺 Vet. Colegiado (CMVP)
                                                </span>
                                                {/* Tooltip Content */}
                                                <div className="absolute left-0 top-full mt-1.5 hidden group-hover/tooltip:block bg-slate-900/95 text-white text-[10px] font-medium p-2.5 rounded-lg shadow-xl w-60 z-30 leading-normal pointer-events-none transition-all duration-200 backdrop-blur-xs">
                                                    <strong>Colegiatura Registrada:</strong> El titular de este local ha declarado estar colegiado en el Colegio de Médicos Veterinarios del Perú (CMVP). Brofy muestra este dato con fines informativos; las consultas y tratamientos son responsabilidad exclusiva del profesional.
                                                </div>
                                            </div>
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
                                        </div>
                                        {est.rating > 0 ? (
                                            <div className="flex items-center space-x-1 text-xs font-extrabold text-slate-800 shrink-0 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/40">
                                                <span>⭐</span>
                                                <span>{est.rating.toFixed(1)}</span>
                                                {est.reviewsCount > 0 && (
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
                                    <p className="text-xs md:text-sm font-extrabold text-slate-800 mt-2.5">
                                        {getMinPriceLabel(est)}
                                    </p>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    )
}
