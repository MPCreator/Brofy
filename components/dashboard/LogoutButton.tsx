'use client'

import { useState } from 'react'
import { LogOut, Loader2 } from 'lucide-react'
import { logout } from '@/lib/auth'

export function LogoutButton({ isMobile = false }: { isMobile?: boolean }) {
    const [loading, setLoading] = useState(false)

    const handleLogout = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await logout()
            window.location.replace('/')
        } catch (err) {
            setLoading(false)
        }
    }

    if (isMobile) {
        return (
            <form onSubmit={handleLogout}>
                <button
                    type="submit"
                    disabled={loading}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50"
                    title="Cerrar sesión"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin text-red-500" /> : <LogOut className="w-4 h-4" />}
                </button>
            </form>
        )
    }

    return (
        <form onSubmit={handleLogout}>
            <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin text-red-500" /> : <LogOut className="w-4 h-4" />}
                <span>{loading ? 'Cerrando sesión...' : 'Cerrar sesión'}</span>
            </button>
        </form>
    )
}
