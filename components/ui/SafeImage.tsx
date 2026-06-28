'use client'

import { useState, useRef, useEffect } from 'react'
import { Loader2 } from 'lucide-react'

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string
    alt: string
    fallback: React.ReactNode
    skeletonClassName?: string
    /** If true, does NOT wrap the img in a positioning div. Use for inline/icon contexts. */
    bare?: boolean
}

function isValidSrc(src?: string): boolean {
    if (!src) return false
    const clean = src.trim().toLowerCase()
    return clean.length > 0 && clean !== 'null' && clean !== 'undefined'
}

export default function SafeImage({
    src,
    alt,
    fallback,
    skeletonClassName = '',
    className = '',
    bare = false,
    ...props
}: SafeImageProps) {
    const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')
    const imgRef = useRef<HTMLImageElement>(null)

    useEffect(() => {
        // Reset on src change
        setStatus('loading')
        // Brief tick to let ref attach before checking cache
        const tid = requestAnimationFrame(() => {
            const el = imgRef.current
            if (!el) return
            if (el.complete && el.naturalWidth > 0) {
                setStatus('loaded')
            } else if (el.complete && el.naturalWidth === 0) {
                setStatus('error')
            }
        })
        return () => cancelAnimationFrame(tid)
    }, [src])

    // If src is invalid, render fallback immediately
    if (!isValidSrc(src)) {
        return <>{fallback}</>
    }

    if (status === 'error') {
        return <>{fallback}</>
    }

    // In bare mode, render just the img (for avatar / icon contexts)
    if (bare) {
        return (
            <>
                <img
                    ref={imgRef}
                    src={src}
                    alt={alt}
                    className={className}
                    onLoad={() => setStatus('loaded')}
                    onError={() => setStatus('error')}
                    style={{ display: status === 'loaded' ? undefined : 'none', ...props.style }}
                    {...props}
                />
                {status === 'loading' && (
                    <div className={`absolute inset-0 bg-slate-100 animate-pulse flex items-center justify-center ${skeletonClassName}`}>
                        <Loader2 className="w-4 h-4 animate-spin text-primary-600 opacity-70" />
                    </div>
                )}
            </>
        )
    }

    return (
        <div className={`relative w-full h-full ${status !== 'loaded' ? 'overflow-hidden' : ''}`}>
            {/* Elegant Pulsing Loading Skeleton */}
            {status === 'loading' && (
                <div className={`absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 animate-pulse flex items-center justify-center ${skeletonClassName}`}>
                    <Loader2 className="w-5 h-5 animate-spin text-primary-600 opacity-70" />
                </div>
            )}

            <img
                ref={imgRef}
                src={src}
                alt={alt}
                className={`${className} transition-opacity duration-300 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                style={{ position: status !== 'loaded' ? 'absolute' : undefined, width: status !== 'loaded' ? 0 : undefined, height: status !== 'loaded' ? 0 : undefined }}
                onLoad={() => setStatus('loaded')}
                onError={() => setStatus('error')}
                {...props}
            />
        </div>
    )
}
