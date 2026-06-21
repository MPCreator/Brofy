'use client'

import { useState } from 'react'
import { PawPrint } from 'lucide-react'

interface LoadingStateProps {
    message?: string
    description?: string
    minHeight?: string
    size?: 'sm' | 'md' | 'lg'
}

export function LoadingState({
    message = "Cargando información...",
    description = "Conectando con la base de datos de Brofy",
    minHeight,
    size = 'lg'
}: LoadingStateProps) {
    const [imgError, setImgError] = useState(false)

    // Determine dimensions based on size
    const sizeClasses = {
        sm: {
            container: "space-y-2",
            height: "min-h-[10vh]",
            outerCircle: "w-10 h-10 border-2",
            logo: "w-5 h-5",
            title: "text-[11px] font-bold text-slate-700",
            desc: "text-[9px] text-slate-400"
        },
        md: {
            container: "space-y-3",
            height: "min-h-[25vh]",
            outerCircle: "w-14 h-14 border-[3px]",
            logo: "w-7 h-7",
            title: "text-xs font-extrabold text-slate-800",
            desc: "text-[10px] text-slate-400"
        },
        lg: {
            container: "space-y-4",
            height: "min-h-[50vh]",
            outerCircle: "w-20 h-20 border-4",
            logo: "w-10 h-10",
            title: "text-sm font-extrabold text-slate-800 tracking-tight",
            desc: "text-xs text-slate-400 font-medium"
        }
    }[size]

    const finalMinHeight = minHeight || sizeClasses.height

    return (
        <div className={`flex flex-col items-center justify-center ${finalMinHeight} ${sizeClasses.container} animate-in fade-in duration-300 w-full`}>
            <div className="relative flex items-center justify-center">
                {/* Outer spin track */}
                <div className={`${sizeClasses.outerCircle} rounded-full border-slate-100 border-t-primary-600 animate-spin`} />
                {/* Inner bouncing brand logo / icon */}
                {imgError ? (
                    <PawPrint className={`${sizeClasses.logo} text-primary-600 animate-bounce absolute`} />
                ) : (
                    <img
                        src="/brofy1.png"
                        alt="Brofy Logo"
                        className={`${sizeClasses.logo} animate-bounce absolute object-contain mix-blend-multiply`}
                        onError={() => setImgError(true)}
                    />
                )}
            </div>
            <div className="text-center space-y-1 px-4">
                <p className={`${sizeClasses.title}`}>
                    {message}
                </p>
                {description && (
                    <p className={`${sizeClasses.desc}`}>
                        {description}
                    </p>
                )}
            </div>
        </div>
    )
}


