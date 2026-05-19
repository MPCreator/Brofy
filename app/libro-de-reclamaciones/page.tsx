'use client'

import { useState } from 'react'
import { createClaim } from '@/lib/actions'
import { toast } from 'sonner'
import { FileText, Loader2, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function LibroReclamacionesPage() {
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        try {
            await createClaim(formData)
            setSubmitted(true)
            toast.success('Tu registro ha sido enviado exitosamente')
        } catch (e) {
            toast.error('Ocurrió un error al enviar el formulario')
        } finally {
            setLoading(false)
        }
    }

    if (submitted) {
        return (
            <main className="min-h-screen bg-surface-50 py-20 px-4">
                <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 text-center">
                    <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Formulario Enviado</h1>
                    <p className="text-slate-600 mb-8">
                        Hemos recibido tu solicitud. Nuestro equipo de atención revisará el caso y se pondrá en contacto contigo a la brevedad posible.
                    </p>
                    <Link href="/" className="px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors">
                        Volver al inicio
                    </Link>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-surface-50 py-20 px-4">
            <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-primary-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">Libro de Reclamaciones</h1>
                </div>
                
                <p className="text-slate-600 mb-8 text-sm">
                    Conforme a lo establecido en el Código de Protección y Defensa del Consumidor, este establecimiento virtual cuenta con un Libro de Reclamaciones a tu disposición.
                </p>
                
                <form action={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombres y Apellidos *</label>
                            <input name="fullName" required className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">DNI / CE *</label>
                            <input name="documentId" required className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Correo Electrónico *</label>
                            <input name="email" type="email" required className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Teléfono *</label>
                            <input name="phone" required className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Domicilio *</label>
                            <input name="address" required className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo *</label>
                            <select name="claimType" required className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm bg-white">
                                <option value="queja">Queja (Disconformidad no relacionada a los productos o servicios)</option>
                                <option value="reclamo">Reclamo (Disconformidad relacionada a los productos o servicios)</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Detalle del reclamo/queja *</label>
                            <textarea name="description" required rows={4} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm resize-none"></textarea>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Pedido concreto *</label>
                            <textarea name="request" required rows={3} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm resize-none"></textarea>
                        </div>
                    </div>

                    <button disabled={loading} type="submit" className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 disabled:opacity-50 transition-colors flex justify-center items-center gap-2">
                        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                        {loading ? 'Enviando...' : 'Enviar Formulario'}
                    </button>
                </form>
            </div>
        </main>
    )
}
