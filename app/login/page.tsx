'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { login } from '@/lib/auth'
import Link from 'next/link'
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react'

// Wrap the submit button to use useFormStatus for loading state
function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 transition-all shadow-md hover:shadow-lg"
        >
            {pending && <Loader2 className="w-4 h-4 animate-spin" />}
            {pending ? 'Ingresando...' : 'Ingresar'}
        </button>
    )
}

export default function LoginPage() {
    // login needs to be compatible with useFormState: (prevState, formData) => Promise<State>
    const [state, formAction] = useFormState(login, null)

    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50/30 px-4">
            <div className="w-full max-w-sm space-y-6">
                {/* Logo */}
                <div className="text-center">
                    <Link href="/" className="text-3xl font-bold text-primary-600 tracking-tight">
                        Brofy
                    </Link>
                    <p className="text-sm text-slate-500 mt-2">Inicia sesión en tu cuenta</p>
                </div>

                {/* Form */}
                <form action={formAction} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                name="email"
                                type="email"
                                required
                                placeholder="tu@email.com"
                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Contraseña
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                name="password"
                                type="password"
                                required
                                minLength={6}
                                placeholder="••••••"
                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                            />
                        </div>
                    </div>

                    {state?.message && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {state.message}
                        </div>
                    )}

                    <SubmitButton />
                </form>

                <p className="text-center text-sm text-slate-500">
                    ¿No tienes cuenta?{' '}
                    <Link href="/signup" className="text-primary-600 font-medium hover:underline">
                        Crear cuenta
                    </Link>
                </p>
            </div>
        </main>
    )
}
