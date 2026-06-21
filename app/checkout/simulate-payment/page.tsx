import React from 'react'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { formatPEN } from '@/lib/utils'
import { CreditCard, Shield, AlertCircle } from 'lucide-react'

// Action to simulate successful payment
async function simulatePaymentAction(formData: FormData) {
    'use server'
    const appointmentId = formData.get('appointmentId') as string
    if (!appointmentId) return

    // 1. Generate mock OTP code (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes

    // 2. Update appointment status in Database
    await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
            status: 'paid',
            paymentId: `sim_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            otpValidationCode: otp,
            otpExpiresAt: expiresAt
        }
    })

    // 3. Redirect back to client dashboard pending appointments
    redirect('/dashboard/client/pending?status=success')
}

export default async function SimulatePaymentPage({
    searchParams
}: {
    searchParams: { appointmentId?: string }
}) {
    const appointmentId = searchParams.appointmentId

    if (!appointmentId) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
                <AlertCircle className="w-12 h-12 text-red-500 mb-2" />
                <h1 className="text-lg font-bold text-slate-800">Error</h1>
                <p className="text-sm text-slate-500 text-center">Falta el parámetro `appointmentId` para iniciar el pago.</p>
            </div>
        )
    }

    // Fetch details of the appointment
    const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
            establishment: true,
            client: true
        }
    })

    if (!appointment) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
                <AlertCircle className="w-12 h-12 text-red-500 mb-2" />
                <h1 className="text-lg font-bold text-slate-800">Error</h1>
                <p className="text-sm text-slate-500 text-center">No se encontró la cita solicitada.</p>
            </div>
        )
    }

    const totalFee = appointment.commissionAmount

    return (
        <div className="min-h-screen flex flex-col justify-between bg-slate-50 font-sans text-slate-800">
            {/* Header */}
            <header className="bg-red-600 px-6 py-4 text-white flex items-center justify-between shadow-sm">
                <span className="font-extrabold text-2xl tracking-wider uppercase">izipay</span>
                <span className="text-xs bg-red-700/60 px-3 py-1 rounded-full border border-red-500/50">
                    MODO SIMULADOR / PRUEBAS
                </span>
            </header>

            {/* Content */}
            <main className="flex-1 flex items-center justify-center p-4 py-8">
                <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between gap-4 items-start text-sm">
                        <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-900 truncate">{appointment.establishment.name}</p>
                            <p className="text-xs text-slate-500 break-words mt-0.5">Reserva: {appointment.serviceType}</p>
                        </div>
                        <div className="text-right shrink-0">
                            <p className="font-bold text-slate-900 text-lg">{formatPEN(totalFee)}</p>
                            <p className="text-[10px] text-slate-400">Total a Pagar</p>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 flex items-start gap-2.5">
                            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-950 leading-relaxed">
                                Estás en el **Simulador de Izipay**. Al hacer clic en &quot;Confirmar Pago Exitoso&quot;, simularemos la pasarela marcando la cita como pagada y generando el código de atención.
                            </p>
                        </div>

                        {/* Credit Card Fields Mock */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                    Número de Tarjeta
                                </label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="text" 
                                        disabled 
                                        value="4557 88XX XXXX 1234" 
                                        className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50/50 text-slate-500" 
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                        Fecha Vence
                                    </label>
                                    <input 
                                        type="text" 
                                        disabled 
                                        value="12/30" 
                                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50/50 text-slate-500" 
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                        CVC
                                    </label>
                                    <input 
                                        type="password" 
                                        disabled 
                                        value="***" 
                                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50/50 text-slate-500" 
                                    />
                                </div>
                            </div>
                        </div>

                        <form action={simulatePaymentAction}>
                            <input type="hidden" name="appointmentId" value={appointment.id} />
                            
                            <button
                                type="submit"
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-6 rounded-2xl transition-all shadow-md active:scale-[0.98]"
                            >
                                Confirmar Pago Exitoso
                            </button>
                        </form>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-slate-100 py-4 px-6 text-center text-[10px] text-slate-400 border-t border-slate-200">
                <div className="flex items-center justify-center gap-1.5 font-medium">
                    <Shield className="w-3.5 h-3.5 text-slate-400" />
                    Tecnología y Seguridad por Izipay / Lyra Network
                </div>
            </footer>
        </div>
    )
}
