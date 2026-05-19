'use client'

import { useState, useEffect } from 'react'
import { getProfile, updateProfile } from '@/lib/actions'
import { User, Mail, Phone, FileText, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function SettingsPage() {
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        getProfile().then(p => { setProfile(p); setLoading(false) })
    }, [])

    async function handleSubmit(formData: FormData) {
        setSaving(true)
        try {
            await updateProfile(formData)
            toast.success('Perfil actualizado correctamente')
            const updated = await getProfile()
            setProfile(updated)
        } catch {
            toast.error('Error al actualizar el perfil')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>
    if (!profile) return null

    return (
        <div className="space-y-6 pb-20 lg:pb-0 max-w-lg mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
                <p className="text-sm text-slate-500 mt-1">Edita tu información personal</p>
            </div>

            {/* Avatar */}
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                    <User className="w-8 h-8 text-primary-600" />
                </div>
                <div>
                    <p className="font-semibold text-slate-900">{profile.fullName}</p>
                    <p className="text-xs text-slate-500">{profile.role === 'vet' ? '🩺 Veterinario' : profile.role === 'provider' ? '🏪 Proveedor' : '🐾 Cliente'}</p>
                </div>
            </div>

            <form action={handleSubmit} className="space-y-4">
                <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
                        <User className="w-4 h-4" /> Nombre completo
                    </label>
                    <input name="fullName" defaultValue={profile.fullName} required className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>

                <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
                        <Mail className="w-4 h-4" /> Email
                    </label>
                    <input value={profile.email} disabled className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-400 cursor-not-allowed" />
                    <p className="text-xs text-slate-400 mt-1">No se puede cambiar el email</p>
                </div>

                <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
                        <Phone className="w-4 h-4" /> Teléfono
                    </label>
                    <input name="phone" defaultValue={profile.phone || ''} placeholder="+51 999 111 222" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>

                {profile.role === 'vet' && (
                    <div>
                        <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
                            <FileText className="w-4 h-4" /> N° CMVP
                        </label>
                        <input disabled name="cmvpId" defaultValue={profile.cmvpId || ''} placeholder="CMVP-12345" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-400 cursor-not-allowed" />
                        <p className="text-xs text-slate-400 mt-1">El CMVP requiere validación para ser modificado. Contacte a soporte.</p>
                    </div>
                )}



                <button type="submit" disabled={saving} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 transition-all shadow-md">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
            </form>
        </div>
    )
}
