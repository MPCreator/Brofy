'use client'

import { useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { signup } from '@/lib/auth'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, Lock, User, Phone, FileText, Loader2, AlertCircle, Stethoscope, PawPrint, Store } from 'lucide-react'
import type { UserRole } from '@/lib/types'

const roles: Array<{ value: UserRole; label: string; icon: typeof PawPrint; description: string }> = [
    { value: 'client', label: 'Soy Dueño de Mascota', icon: PawPrint, description: 'Buscar servicios y gestionar la salud de tus mascotas' },
    { value: 'vet', label: 'Soy Veterinario', icon: Stethoscope, description: 'Atender pacientes y gestionar fichas médicas' },
    { value: 'provider', label: 'Soy Proveedor', icon: Store, description: 'Ofrecer grooming, paseos u otros servicios' },
]

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 transition-all shadow-md hover:shadow-lg"
        >
            {pending && <Loader2 className="w-4 h-4 animate-spin" />}
            {pending ? 'Creando...' : 'Crear cuenta'}
        </button>
    )
}

export default function SignupPage() {
    const [selectedRole, setSelectedRole] = useState<UserRole | ''>('')
    const [state, formAction] = useFormState(signup, null)
    const [countryCode, setCountryCode] = useState('+51')
    const [phoneDigits, setPhoneDigits] = useState('')

    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50/30 px-4 py-8">
            <div className="w-full max-w-sm space-y-6">
                {/* Logo */}
                <div className="text-center space-y-3 flex flex-col items-center">
                    <Link href="/" className="inline-flex items-center justify-center">
                        <Image 
                            src="/logo.png" 
                            alt="Brofy Logo" 
                            width={340} 
                            height={185} 
                            className="object-contain w-72 md:w-[320px]" 
                            style={{ height: 'auto' }}
                            priority 
                        />
                    </Link>
                    <p className="text-sm text-slate-500">Crea tu cuenta</p>
                </div>

                {state?.success ? (
                    <div className="space-y-4 text-center bg-white rounded-3xl shadow-xl p-8 border border-slate-100 animate-in">
                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col items-center gap-3">
                            <PawPrint className="w-12 h-12 text-emerald-600 flex-shrink-0" />
                            <div>
                                <p className="font-bold text-emerald-800 text-base">¡Cuenta registrada!</p>
                                <p className="text-xs text-emerald-700 mt-2 leading-relaxed">
                                    {state.message}
                                </p>
                            </div>
                        </div>
                        <p className="text-xs text-slate-400">
                            Una vez confirmado el enlace, podrás ingresar sin problemas.
                        </p>
                        <Link
                            href="/login"
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-colors"
                        >
                            Ir al inicio de sesión
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Role Selection */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">¿Quién eres?</label>
                            {roles.map(role => (
                                <button
                                    key={role.value}
                                    type="button"
                                    onClick={() => setSelectedRole(role.value)}
                                    className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                                        selectedRole === role.value
                                            ? 'border-primary-500 bg-primary-50'
                                            : 'border-slate-100 bg-white hover:border-slate-200'
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                        selectedRole === role.value ? 'bg-primary-100' : 'bg-slate-50'
                                    }`}>
                                        <role.icon className={`w-5 h-5 ${selectedRole === role.value ? 'text-primary-600' : 'text-slate-400'}`} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">{role.label}</p>
                                        <p className="text-xs text-slate-500">{role.description}</p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Form */}
                        {selectedRole && (
                            <form action={formAction} className="space-y-3 animate-in">
                                <input type="hidden" name="role" value={selectedRole} />
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nombre completo</label>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            name="fullName"
                                            type="text"
                                            required
                                            minLength={2}
                                            placeholder="Tu nombre"
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            name="email"
                                            type="email"
                                            required
                                            placeholder="tu@email.com"
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            name="password"
                                            type="password"
                                            required
                                            minLength={6}
                                            placeholder="Mínimo 6 caracteres"
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono móvil *</label>
                                    <div className="flex gap-2">
                                        <select
                                            value={countryCode}
                                            onChange={e => setCountryCode(e.target.value)}
                                            className="px-3 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium cursor-pointer"
                                        >
                                            <option value="+51">🇵🇪 +51</option>
                                            <option value="+54">🇦🇷 +54</option>
                                            <option value="+56">🇨🇱 +56</option>
                                            <option value="+57">🇨🇴 +57</option>
                                            <option value="+52">🇲🇽 +52</option>
                                            <option value="+593">🇪🇨 +593</option>
                                            <option value="+591">🇧🇴 +591</option>
                                        </select>
                                        <div className="relative flex-1">
                                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="tel"
                                                required
                                                value={phoneDigits}
                                                onChange={e => setPhoneDigits(e.target.value.replace(/\D/g, ''))}
                                                placeholder="999 999 999"
                                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-medium"
                                            />
                                        </div>
                                    </div>
                                    <input type="hidden" name="phone" value={`${countryCode}${phoneDigits}`} />
                                </div>

                                {/* CMVP field for vets only */}
                                {selectedRole === 'vet' && (
                                    <div className="animate-in">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            N° CMVP (Colegiatura)
                                        </label>
                                        <div className="relative">
                                            <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                name="cmvpId"
                                                type="text"
                                                placeholder="CMVP-12345"
                                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            />
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1">Se verificará manualmente</p>
                                    </div>
                                )}

                                {/* Legal Consent Block */}
                                <div className="space-y-2.5 pt-2 border-t border-slate-100">
                                    {/* Age declaration */}
                                    <label className="flex items-start gap-2.5 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            name="ageConfirm"
                                            required
                                            className="mt-0.5 w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 shrink-0"
                                        />
                                        <span className="text-xs text-slate-600 group-hover:text-slate-800 transition-colors">
                                            Declaro tener <strong>18 años o más</strong>. Si soy menor de edad, cuento con la autorización de mi tutor legal.
                                        </span>
                                    </label>

                                    {/* T&C + Privacy */}
                                    <label className="flex items-start gap-2.5 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            name="termsConfirm"
                                            required
                                            className="mt-0.5 w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 shrink-0"
                                        />
                                        <span className="text-xs text-slate-600 group-hover:text-slate-800 transition-colors">
                                            He leído y acepto los{' '}
                                            <a href="/terminos" target="_blank" className="text-primary-600 font-medium hover:underline">
                                                Términos y Condiciones
                                            </a>{' '}
                                            y la{' '}
                                            <a href="/privacidad" target="_blank" className="text-primary-600 font-medium hover:underline">
                                                Política de Privacidad
                                            </a>{' '}
                                            de Brofy.
                                        </span>
                                    </label>

                                    {/* Vet-specific professional declaration */}
                                    {selectedRole === 'vet' && (
                                        <label className="flex items-start gap-2.5 cursor-pointer group animate-in fade-in">
                                            <input
                                                type="checkbox"
                                                name="vetProfConfirm"
                                                required
                                                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 shrink-0"
                                            />
                                            <span className="text-xs text-slate-600 group-hover:text-slate-800 transition-colors">
                                                Declaro que mi habilitación profesional (CMVP) está <strong>vigente</strong>, que soy exclusivo responsable de los actos médicos que realice, y acepto el sistema de comisiones de Brofy por el uso de la plataforma.
                                            </span>
                                        </label>
                                    )}

                                    {/* Provider-specific */}
                                    {selectedRole === 'provider' && (
                                        <label className="flex items-start gap-2.5 cursor-pointer group animate-in fade-in">
                                            <input
                                                type="checkbox"
                                                name="providerConfirm"
                                                required
                                                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 shrink-0"
                                            />
                                            <span className="text-xs text-slate-600 group-hover:text-slate-800 transition-colors">
                                                Declaro que los servicios que ofrezco son lícitos, que cuentan con las autorizaciones municipales/sanitarias requeridas, y acepto el sistema de comisiones de Brofy.
                                            </span>
                                        </label>
                                    )}
                                </div>

                                {state?.message && (
                                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        {state.message}
                                    </div>
                                )}

                                <SubmitButton />
                            </form>
                        )}

                        <p className="text-center text-sm text-slate-500">
                            ¿Ya tienes cuenta?{' '}
                            <Link href="/login" className="text-primary-600 font-medium hover:underline">
                                Ingresar
                            </Link>
                        </p>
                    </>
                )}
            </div>
        </main>
    )
}
