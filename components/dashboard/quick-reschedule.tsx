'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CalendarPlus, RefreshCw } from 'lucide-react'

/**
 * Guarda el último establecimiento visitado/reservado en localStorage.
 * Se llama desde EstablishmentClient cuando el usuario abre el modal de reserva.
 */
export function saveLastEstablishment(id: string, name: string) {
    if (typeof window !== 'undefined') {
        localStorage.setItem('brofy_last_est_id', id)
        localStorage.setItem('brofy_last_est_name', name)
    }
}

/**
 * Botón de acceso rápido que aparece en el dashboard del cliente
 * si ya tiene una reserva previa.
 */
export function QuickRescheduleButton() {
    const [lastId, setLastId] = useState<string | null>(null)
    const [lastName, setLastName] = useState<string | null>(null)

    useEffect(() => {
        setLastId(localStorage.getItem('brofy_last_est_id'))
        setLastName(localStorage.getItem('brofy_last_est_name'))
    }, [])

    if (!lastId || !lastName) {
        return (
            <Link
                href="/dashboard/discover"
                className="flex items-center gap-4 p-4 bg-primary-50 border border-primary-100 text-primary-800 rounded-2xl hover:bg-primary-100/70 transition-colors shadow-sm"
            >
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CalendarPlus className="w-5 h-5 text-white animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm">Reserva tu primera cita</p>
                    <p className="text-xs text-primary-700 truncate">Encuentra y agenda en veterinarias cercanas</p>
                </div>
            </Link>
        )
    }

    return (
        <Link
            href={`/establishment/${lastId}`}
            className="flex items-center gap-4 p-4 bg-emerald-50 border-2 border-emerald-200 text-emerald-800 rounded-2xl hover:bg-emerald-100 transition-colors"
        >
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <RefreshCw className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">Volver a agendar</p>
                <p className="text-xs text-emerald-700 truncate">{lastName}</p>
            </div>
        </Link>
    )
}