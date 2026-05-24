'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react'

export default function RestablecerContrasenaPage({ params }: { params: { token: string } }) {
    const router = useRouter()
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [showPwd, setShowPwd] = useState(false)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (password !== confirm) {
            setResult({ error: 'Las contraseñas no coinciden.' })
            return
        }
        if (password.length < 6) {
            setResult({ error: 'La contraseña debe tener al menos 6 caracteres.' })
            return
        }

        setLoading(true)
        const res = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: params.token, password }),
        })
        const data = await res.json()
        setResult(data)
        setLoading(false)

        if (data.success) {
            setTimeout(() => router.push('/login'), 2500)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-slate-100 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Lock className="w-8 h-8 text-primary-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">Nueva contraseña</h1>
                        <p className="text-slate-500 text-sm mt-2">
                            Elige una contraseña segura para tu cuenta.
                        </p>
                    </div>

                    {result?.success ? (
                        <div className="space-y-4 text-center">
                            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                                <p className="font-bold text-emerald-800">¡Contraseña actualizada!</p>
                                <p className="text-sm text-emerald-700 mt-1">Redirigiendo al inicio de sesión...</p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {result?.error && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-sm text-red-700">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    {result.error}
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Nueva contraseña
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type={showPwd ? 'text' : 'password'}
                                        required
                                        minLength={6}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="Mínimo 6 caracteres"
                                        className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPwd(!showPwd)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Confirmar contraseña
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type={showPwd ? 'text' : 'password'}
                                        required
                                        minLength={6}
                                        value={confirm}
                                        onChange={e => setConfirm(e.target.value)}
                                        placeholder="Repite tu contraseña"
                                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors"
                            >
                                {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
                            </button>
                            <Link
                                href="/login"
                                className="flex items-center justify-center text-sm text-slate-500 hover:text-primary-600 transition-colors"
                            >
                                Cancelar
                            </Link>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
