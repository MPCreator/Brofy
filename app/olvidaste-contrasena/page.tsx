'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react'

export default function OlvidasteContrasenaPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!email) return
        setLoading(true)

        const res = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        })
        const data = await res.json()
        setResult(data)
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-slate-100 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <KeyRound className="w-8 h-8 text-primary-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">¿Olvidaste tu contraseña?</h1>
                        <p className="text-slate-500 text-sm mt-2">
                            Ingresa tu correo y te mostraremos un enlace para restablecerla.
                        </p>
                    </div>

                    {result?.success ? (
                        <div className="space-y-4 text-center">
                            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col items-center gap-3">
                                <CheckCircle2 className="w-10 h-10 text-emerald-600 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-emerald-800 text-base">¡Enlace enviado!</p>
                                    <p className="text-xs text-emerald-700 mt-1">
                                        Hemos enviado las instrucciones para restablecer tu contraseña a tu correo. Revisa tu bandeja de entrada o spam.
                                    </p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400">
                                El enlace de recuperación es válido por 1 hora.
                            </p>
                            <Link
                                href="/login"
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" /> Volver al inicio de sesión
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {result?.error && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                                    {result.error}
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Correo electrónico
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="tu@correo.com"
                                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors"
                            >
                                {loading ? 'Generando enlace...' : 'Enviar enlace de recuperación'}
                            </button>
                            <Link
                                href="/login"
                                className="flex items-center justify-center gap-1 text-sm text-slate-500 hover:text-primary-600 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" /> Volver al inicio de sesión
                            </Link>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
