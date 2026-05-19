'use client'

import { useState, useEffect } from 'react'
import { validateOtp, getPendingAppointments } from '@/lib/actions'
import { Zap, ShieldCheck, AlertTriangle, Loader2, Clock, CalendarClock, User } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import { formatDateTime } from '@/lib/utils'

export default function ValidateOtpPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const prefilledAppointmentId = searchParams.get('appointmentId') || ''

    const [appointments, setAppointments] = useState<any[]>([])
    const [loadingAppointments, setLoadingAppointments] = useState(true)
    const [appointmentId, setAppointmentId] = useState(prefilledAppointmentId)
    const [otp, setOtp] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

    useEffect(() => {
        loadAppointments()
    }, [])

    async function loadAppointments() {
        setLoadingAppointments(true)
        try {
            const data = await getPendingAppointments()
            setAppointments(data)
            // If there's only one pending and we don't have one selected, auto-select it
            if (data.length === 1 && !appointmentId) {
                setAppointmentId(data[0].id)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoadingAppointments(false)
        }
    }

    async function handleValidate(e: React.FormEvent) {
        e.preventDefault()
        if (!appointmentId || !otp || otp.length !== 6) return

        setLoading(true)
        setResult(null)

        try {
            const res = await validateOtp(appointmentId, otp)
            setResult(res)
            if (res.success) {
                setTimeout(() => {
                    router.push(`/dashboard/vet/fast-entry?appointmentId=${appointmentId}`)
                }, 2000)
            }
        } catch {
            setResult({ success: false, message: 'Error de conexión' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 pb-20 lg:pb-0 max-w-2xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-primary-600" />
                    Validar Pacientes
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Ingresa el código OTP (6 dígitos) que el cliente tiene en su pantalla para iniciar la atención.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Pending Appointments List */}
                <div className="space-y-3">
                    <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <CalendarClock className="w-4 h-4" />
                        Citas en espera ({appointments.length})
                    </h2>
                    
                    {loadingAppointments ? (
                        <div className="flex justify-center p-8 bg-white rounded-2xl border border-slate-100">
                            <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
                        </div>
                    ) : appointments.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-500 text-sm">
                            No hay clientes esperando validación actualmente.
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
                            {appointments.map(apt => (
                                <button
                                    key={apt.id}
                                    onClick={() => {
                                        setAppointmentId(apt.id)
                                        setResult(null)
                                        setOtp('')
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

                {/* Validation Form */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm h-fit sticky top-6">
                    <h2 className="text-sm font-semibold text-slate-700 mb-4">
                        Validar Código OTP
                    </h2>
                    
                    {!appointmentId ? (
                        <div className="text-center py-8 text-sm text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                            Selecciona una cita de la lista <br/>para validar su código
                        </div>
                    ) : (
                        <form onSubmit={handleValidate} className="space-y-4 animate-in fade-in">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Código OTP del Cliente
                                </label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={otp}
                                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="• • • • • •"
                                    className="w-full px-4 py-5 bg-white border-2 border-slate-200 rounded-2xl text-center text-3xl font-mono font-bold tracking-[0.5em] text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otp.length !== 6}
                                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary-600 text-white rounded-2xl font-semibold text-lg hover:bg-primary-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <ShieldCheck className="w-5 h-5" />
                                )}
                                {loading ? 'Validando...' : 'Desbloquear Ficha'}
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
                                            {result.success ? '¡OTP Validado!' : 'Error de Validación'}
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
