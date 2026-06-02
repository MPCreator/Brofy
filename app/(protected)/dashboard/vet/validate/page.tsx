'use client'

import { useState, useEffect } from 'react'
import { validateOtp, getPendingAppointments } from '@/lib/actions'
import { ShieldCheck, AlertTriangle, Loader2, CalendarClock, User, Clock, KeyRound } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import { formatDateTime } from '@/lib/utils'

export default function ValidarCodigoPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const prefilledAppointmentId = searchParams.get('appointmentId') || ''

    const [appointments, setAppointments] = useState<any[]>([])
    const [loadingAppointments, setLoadingAppointments] = useState(true)
    const [appointmentId, setAppointmentId] = useState(prefilledAppointmentId)
    const [codigo, setCodigo] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

    useEffect(() => {
        async function cargarCitas() {
            setLoadingAppointments(true)
            try {
                const data = await getPendingAppointments()
                setAppointments(data)
                setAppointmentId(prev => {
                    if (data.length === 1 && !prev) return data[0].id
                    return prev
                })
            } catch (error) {
                console.error(error)
            } finally {
                setLoadingAppointments(false)
            }
        }
        cargarCitas()
    }, [])

    async function handleValidar(e: React.FormEvent) {
        e.preventDefault()
        if (!appointmentId || !codigo || codigo.length !== 6) return

        setLoading(true)
        setResult(null)

        try {
            const res = await validateOtp(appointmentId, codigo)
            setResult(res)
            if (res.success) {
                setTimeout(() => {
                    router.push(`/dashboard/vet/fast-entry?appointmentId=${appointmentId}`)
                }, 1500)
            }
        } catch {
            setResult({ success: false, message: 'Error de conexión. Intenta de nuevo.' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 pb-20 lg:pb-0 max-w-2xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <KeyRound className="w-6 h-6 text-primary-600" />
                    Iniciar Atención
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Pide al cliente su código de atención (6 dígitos) e ingrésalo aquí para abrir la ficha.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Lista de clientes esperando */}
                <div className="space-y-3">
                    <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <CalendarClock className="w-4 h-4" />
                        Clientes en espera ({appointments.length})
                    </h2>

                    {loadingAppointments ? (
                        <div className="flex justify-center p-8 bg-white rounded-2xl border border-slate-100">
                            <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
                        </div>
                    ) : appointments.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-500 text-sm">
                            No hay clientes esperando atención en este momento.
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
                            {appointments.map(apt => (
                                <button
                                    key={apt.id}
                                    onClick={() => {
                                        setAppointmentId(apt.id)
                                        setResult(null)
                                        setCodigo('')
                                    }}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                                        appointmentId === apt.id
                                            ? 'border-primary-500 bg-primary-50 shadow-sm'
                                            : 'border-slate-100 bg-white hover:border-slate-200'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-bold text-slate-900">{apt.pet.name}</span>
                                        <span className="text-xs text-primary-600 bg-primary-100 px-2 py-0.5 rounded-full font-medium">
                                            {apt.serviceType}
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                            <User className="w-3.5 h-3.5" />
                                            {apt.pet.owner.fullName}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                            <Clock className="w-3.5 h-3.5" />
                                            {formatDateTime(apt.createdAt)}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Formulario de código */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm h-fit sticky top-6">
                    <h2 className="text-sm font-semibold text-slate-700 mb-4">
                        Ingresar Código de Atención
                    </h2>

                    {!appointmentId ? (
                        <div className="text-center py-8 text-sm text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                            Selecciona un cliente de la lista<br />para ingresar su código
                        </div>
                    ) : (
                        <form onSubmit={handleValidar} className="space-y-4 animate-in fade-in">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Código de atención del cliente
                                </label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={codigo}
                                    onChange={e => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="• • • • • •"
                                    className="w-full px-4 py-5 bg-white border-2 border-slate-200 rounded-2xl text-center text-3xl font-mono font-bold tracking-[0.5em] text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                                    required
                                />
                                <p className="text-xs text-slate-400 text-center mt-1.5">
                                    El cliente lo ve en su pantalla al iniciar sesión
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || codigo.length !== 6}
                                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary-600 text-white rounded-2xl font-semibold text-lg hover:bg-primary-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <ShieldCheck className="w-5 h-5" />
                                )}
                                {loading ? 'Verificando...' : 'Abrir Ficha del Paciente'}
                            </button>

                            {result && (
                                <div
                                    className={`p-4 rounded-xl border-2 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 ${
                                        result.success
                                            ? 'bg-emerald-50 border-emerald-200'
                                            : 'bg-red-50 border-red-200'
                                    }`}
                                >
                                    {result.success ? (
                                        <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                                    ) : (
                                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                    )}
                                    <div>
                                        <p className={`font-semibold text-sm ${result.success ? 'text-emerald-800' : 'text-red-800'}`}>
                                            {result.success ? '¡Código correcto! Abriendo ficha...' : 'Código incorrecto'}
                                        </p>
                                        <p className={`text-xs mt-0.5 ${result.success ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {result.message}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
