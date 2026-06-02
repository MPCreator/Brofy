'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PhotoCarouselProps {
    photoUrls: string[]
    establishmentName: string
    fallbackCategory?: string
}

const CATEGORY_STYLES: Record<string, { gradient: string; emoji: string; label: string; glow: string }> = {
    clinic: {
        gradient: 'from-cyan-500 via-primary-600 to-primary-800',
        emoji: '🏥',
        label: 'Clínica Veterinaria',
        glow: 'rgba(7,142,173,0.25)',
    },
    hospital: {
        gradient: 'from-primary-600 via-primary-700 to-slate-900',
        emoji: '🏨',
        label: 'Hospedaje & Hotel',
        glow: 'rgba(5,114,138,0.25)',
    },
    groomer: {
        gradient: 'from-cyan-400 via-primary-500 to-indigo-600',
        emoji: '✂️',
        label: 'Spa & Grooming',
        glow: 'rgba(11,167,200,0.25)',
    },
    walker: {
        gradient: 'from-sky-400 via-primary-500 to-teal-600',
        emoji: '🦮',
        label: 'Paseos y Diversión',
        glow: 'rgba(114,222,247,0.25)',
    },
    default: {
        gradient: 'from-cyan-500 via-primary-600 to-indigo-700',
        emoji: '🐾',
        label: 'Servicio de Calidad',
        glow: 'rgba(7,142,173,0.25)',
    }
}

function PlaceholderCard({ fallbackCategory }: { fallbackCategory: string }) {
    const style = CATEGORY_STYLES[fallbackCategory] || CATEGORY_STYLES.default
    return (
        <div
            className={`relative w-full h-56 bg-gradient-to-br ${style.gradient} rounded-2xl overflow-hidden flex flex-col items-center justify-center border border-white/10 shadow-lg group select-none`}
            style={{ boxShadow: `0 12px 30px ${style.glow}` }}
        >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse pointer-events-none" />
            <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="absolute left-4 top-4 text-white/10 blur-[0.5px] rotate-[-15deg] pointer-events-none transition-transform duration-500 group-hover:translate-y-1 group-hover:rotate-[-10deg]">
                <span className="text-2xl">🐾</span>
            </div>
            <div className="absolute right-6 bottom-4 text-white/10 blur-[0.5px] rotate-[20deg] pointer-events-none transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-[25deg]">
                <span className="text-xl">🐾</span>
            </div>
            <div className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-slate-100 group-hover:scale-110 group-hover:bg-white/25 transition-all duration-500 shadow-xl border border-white/20 relative z-10">
                <span className="text-3xl filter drop-shadow-[0_4px_12px_rgba(255,255,255,0.4)] animate-bounce" style={{ animationDuration: '3s' }}>
                    {style.emoji}
                </span>
            </div>
            <span className="text-[10px] font-extrabold text-white/80 mt-4 tracking-[0.2em] uppercase relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]">
                {style.label}
            </span>
            <span className="text-[11px] text-white/95 font-bold mt-1 bg-white/15 backdrop-blur-sm px-3.5 py-1 rounded-full border border-white/10 relative z-10 shadow-sm transition-colors group-hover:bg-white/20">
                Brofy • Próximamente fotos 📸
            </span>
        </div>
    )
}

export default function PhotoCarousel({ photoUrls, establishmentName, fallbackCategory = 'default' }: PhotoCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({})
    const [errorImages, setErrorImages] = useState<Record<number, boolean>>({})
    const imagesRef = useRef<(HTMLImageElement | null)[]>([])

    // Filter valid URLs
    const validPhotos = photoUrls.filter(url => {
        if (!url) return false
        const clean = url.trim().toLowerCase()
        return clean.length > 0 && clean !== 'null' && clean !== 'undefined'
    })

    // Instant cache check on mount
    useEffect(() => {
        imagesRef.current.forEach((img, i) => {
            if (img && img.complete && !img.naturalWidth) {
                // Broken image that already "completed" with error
                setErrorImages(prev => ({ ...prev, [i]: true }))
            } else if (img && img.complete) {
                setLoadedImages(prev => prev[i] ? prev : { ...prev, [i]: true })
            }
        })
    }, [validPhotos.length])

    // All valid photos errored out → show placeholder
    const allErrored = validPhotos.length > 0 && validPhotos.every((_, i) => errorImages[i])

    if (validPhotos.length === 0 || allErrored) {
        return <PlaceholderCard fallbackCategory={fallbackCategory} />
    }

    const displayImages = validPhotos

    const safeIndex = Math.min(currentIndex, displayImages.length - 1)

    const prevSlide = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setCurrentIndex(prev => (prev === 0 ? displayImages.length - 1 : prev - 1))
    }

    const nextSlide = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setCurrentIndex(prev => (prev === displayImages.length - 1 ? 0 : prev + 1))
    }

    const setSlide = (e: React.MouseEvent, index: number) => {
        e.preventDefault()
        e.stopPropagation()
        setCurrentIndex(index)
    }

    return (
        <div className="relative w-full h-56 bg-slate-100 rounded-2xl overflow-hidden group shadow-sm">
            {/* Images Wrapper */}
            <div
                className="flex w-full h-full transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${safeIndex * 100}%)` }}
            >
                {displayImages.map((src, i) => {
                    const isLoaded = loadedImages[i]
                    const isErrored = errorImages[i]

                    return (
                        <div key={i} className="w-full h-full flex-shrink-0 relative bg-slate-50">
                            {isErrored ? (
                                <PlaceholderCard fallbackCategory={fallbackCategory} />
                            ) : (
                                <>
                                    {/* Pulsing skeleton while loading */}
                                    {!isLoaded && (
                                        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 animate-pulse flex items-center justify-center z-10">
                                            <div className="w-6 h-6 border-2 border-primary-400 border-t-transparent rounded-full animate-spin opacity-60" />
                                        </div>
                                    )}
                                    <img
                                        ref={el => { imagesRef.current[i] = el }}
                                        src={src}
                                        alt={`${establishmentName} - Foto ${i + 1}`}
                                        className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-700 ${
                                            isLoaded ? 'opacity-100 relative' : 'opacity-0 absolute inset-0'
                                        }`}
                                        onLoad={() => setLoadedImages(prev => ({ ...prev, [i]: true }))}
                                        onError={() => setErrorImages(prev => ({ ...prev, [i]: true }))}
                                    />
                                </>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Left Chevron */}
            {displayImages.length > 1 && (
                <button
                    onClick={prevSlide}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm text-slate-800 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-105 active:scale-95 z-10"
                    aria-label="Foto anterior"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
            )}

            {/* Right Chevron */}
            {displayImages.length > 1 && (
                <button
                    onClick={nextSlide}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm text-slate-800 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-105 active:scale-95 z-10"
                    aria-label="Siguiente foto"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            )}

            {/* Slide Indicators */}
            {displayImages.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    {displayImages.map((_, i) => (
                        <button
                            key={i}
                            onClick={e => setSlide(e, i)}
                            className={`h-1.5 rounded-full transition-all ${
                                safeIndex === i ? 'bg-white w-3 scale-110' : 'w-1.5 bg-white/50 hover:bg-white/80'
                            }`}
                            aria-label={`Ir a foto ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
