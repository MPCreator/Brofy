'use client'

import { useState, useEffect } from 'react'
import { getProfile, updateProfile, deleteProfileAccount, createClaim } from '@/lib/actions'
import { User, Mail, Phone, FileText, Save, Loader2, Camera, Trash2, AlertTriangle, Lock } from 'lucide-react'
import { toast } from 'sonner'
import SafeImage from '@/components/ui/SafeImage'
import { LoadingState } from '@/components/ui/loading-state'

export default function SettingsPage() {
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
    const [avatarBase64, setAvatarBase64] = useState<string | null>(null)

    // ARCO Rights Form State
    const [showArco, setShowArco] = useState(false)
    const [arcoType, setArcoType] = useState('arco_acceso')
    const [documentId, setDocumentId] = useState('')
    const [address, setAddress] = useState('')
    const [arcoDescription, setArcoDescription] = useState('')
    const [arcoRequest, setArcoRequest] = useState('')
    const [arcoSubmitting, setArcoSubmitting] = useState(false)

    const handleArcoSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!documentId.trim() || !address.trim() || !arcoDescription.trim() || !arcoRequest.trim()) {
            toast.error('Por favor, completa todos los campos requeridos para la solicitud ARCO')
            return
        }

        setArcoSubmitting(true)
        try {
            const formData = new FormData()
            formData.set('fullName', profile.fullName)
            formData.set('email', profile.email)
            formData.set('phone', profile.phone || '')
            formData.set('documentId', documentId)
            formData.set('address', address)
            formData.set('claimType', arcoType)
            formData.set('description', arcoDescription)
            formData.set('request', arcoRequest)

            const res = await createClaim(formData)
            if (res.success) {
                toast.success('Solicitud de Derechos ARCO enviada con éxito')
                setDocumentId('')
                setAddress('')
                setArcoDescription('')
                setArcoRequest('')
                setShowArco(false)
            } else {
                toast.error('Error al enviar la solicitud')
            }
        } catch {
            toast.error('Error del servidor al procesar la solicitud')
        } finally {
            setArcoSubmitting(false)
        }
    }

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm(
            "¿Estás absolutamente seguro de que deseas eliminar tu cuenta permanentemente? " +
            "Esta acción borrará todas tus mascotas, clínicas, citas y datos relacionados. " +
            "Esta operación no se puede deshacer."
        );
        if (!confirmed) return;

        setDeleting(true);
        try {
            await deleteProfileAccount();
            toast.success("Cuenta eliminada con éxito.");
            window.location.href = '/';
        } catch (error: any) {
            toast.error(error.message || "Error al eliminar la cuenta.");
            setDeleting(false);
        }
    };

    useEffect(() => {
        getProfile().then(p => { 
            setProfile(p)
            if (p?.avatarUrl) {
                setAvatarPreview(p.avatarUrl)
            }
            setLoading(false) 
        })
    }, [])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 4 * 1024 * 1024) {
            toast.error('La imagen no debe superar los 4MB')
            return
        }

        const reader = new FileReader()
        reader.onloadend = () => {
            const base64String = reader.result as string
            setAvatarPreview(base64String)
            setAvatarBase64(base64String)
        }
        reader.readAsDataURL(file)
    }

    async function handleSubmit(formData: FormData) {
        setSaving(true)
        try {
            if (avatarBase64) {
                formData.set('avatarBase64', avatarBase64)
            }
            await updateProfile(formData)
            toast.success('Perfil actualizado correctamente')
            const updated = await getProfile()
            setProfile(updated)
            if (updated?.avatarUrl) {
                setAvatarPreview(updated.avatarUrl)
            }
            setAvatarBase64(null)
        } catch {
            toast.error('Error al actualizar el perfil')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <LoadingState message="Cargando configuración..." description="Obteniendo la información de tu perfil" />
    if (!profile) return null

    return (
        <div className="space-y-6 pb-20 lg:pb-0 max-w-lg mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
                <p className="text-sm text-slate-500 mt-1">Edita tu información personal</p>
            </div>

            {/* Interactive Avatar */}
            <div className="flex items-center gap-6 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
                <div className="relative group">
                    <div className="w-20 h-20 rounded-full bg-primary-50 border-2 border-primary-100 flex items-center justify-center overflow-hidden transition-all group-hover:opacity-90">
                        <SafeImage
                            src={avatarPreview || ''}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                            fallback={<User className="w-10 h-10 text-primary-600" />}
                        />
                    </div>
                    <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center cursor-pointer shadow-md transition-all">
                        <Camera className="w-4 h-4" />
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                </div>
                <div>
                    <p className="font-bold text-slate-900 text-lg">{profile.fullName}</p>
                    <p className="text-sm text-slate-500 font-medium">
                        {profile.role === 'vet' ? '🩺 Veterinario' : profile.role === 'provider' ? '🏪 Proveedor' : '🐾 Cliente'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Haz clic en la cámara para subir tu foto de perfil</p>
                </div>
            </div>

            <form action={handleSubmit} className="space-y-4">
                <input type="hidden" name="avatarBase64" value={avatarBase64 || ''} />
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
                    <input name="phone" defaultValue={profile.phone || ''} required placeholder="+51 999 111 222" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium" />
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

                <button type="submit" disabled={saving || deleting} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 transition-all shadow-md">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
            </form>

            {/* Danger Zone */}
            <div className="bg-red-50/50 border border-red-100 rounded-3xl p-6 mt-8 space-y-4">
                <div className="flex items-center gap-2 text-red-700 font-extrabold text-sm">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                    <span>Zona de Peligro</span>
                </div>
                <div className="space-y-2">
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        Si decides eliminar tu cuenta, todos tus registros de mascotas, locales, agendas y datos serán borrados permanentemente del sistema de manera irreversible.
                    </p>
                    <button
                        type="button"
                        onClick={handleDeleteAccount}
                        disabled={saving || deleting}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-red-200 text-red-650 hover:bg-red-50 hover:text-red-750 font-semibold rounded-xl text-xs transition-colors shadow-sm disabled:opacity-50"
                    >
                        {deleting ? <Loader2 className="w-4 h-4 animate-spin text-red-600" /> : <Trash2 className="w-4 h-4" />}
                        <span>{deleting ? 'Eliminando cuenta...' : 'Eliminar mi cuenta permanentemente'}</span>
                    </button>
                </div>
            </div>

            {/* ARCO Rights Section (Discreet) */}
            <div className="text-center mt-8 pb-4">
                <button
                    onClick={() => setShowArco(!showArco)}
                    type="button"
                    className="text-[11px] text-slate-450 hover:text-slate-600 transition-colors underline decoration-dotted font-semibold focus:outline-none"
                >
                    {showArco ? 'Ocultar solicitud de Derechos ARCO ▲' : 'Ejercer Derechos ARCO (Ley N.º 29733) ▼'}
                </button>

                {showArco && (
                    <div className="bg-white border border-slate-200 rounded-3xl p-5 mt-4 text-left shadow-sm space-y-4 animate-in fade-in duration-200">
                        <p className="text-xs text-slate-500 leading-relaxed">
                            De conformidad con la Ley N.º 29733 de Protección de Datos Personales en el Perú, tienes derecho a ejercer tus derechos de Acceso, Rectificación, Cancelación y Oposición.
                        </p>
                        
                        <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 text-[11px] text-slate-600 space-y-1.5 leading-relaxed">
                            <span className="font-bold text-slate-700 block">Plazos de respuesta legales en Perú:</span>
                            <ul className="list-disc list-inside space-y-0.5 font-medium">
                                <li><strong>Derecho de Acceso:</strong> Hasta 20 días hábiles.</li>
                                <li><strong>Derechos de Rectificación, Cancelación u Oposición:</strong> Hasta 10 días hábiles.</li>
                            </ul>
                            <p className="text-[10px] text-amber-600 font-semibold mt-1 leading-normal">
                                * Nota sobre Cancelación: La supresión de datos clínicos está limitada por la obligación de retención de los veterinarios.
                            </p>
                        </div>

                        <form onSubmit={handleArcoSubmit} className="space-y-3 pt-1">
                            <div>
                                <label className="text-xs font-semibold text-slate-500 mb-1 block">Tipo de Derecho a Ejercer *</label>
                                <select 
                                    value={arcoType} 
                                    onChange={(e) => setArcoType(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 font-semibold text-slate-700"
                                >
                                    <option value="arco_acceso">Derecho de Acceso (Conocer qué datos tenemos)</option>
                                    <option value="arco_rectificacion">Derecho de Rectificación (Corregir/Actualizar datos)</option>
                                    <option value="arco_cancelacion">Derecho de Cancelación (Eliminar datos personales)</option>
                                    <option value="arco_oposicion">Derecho de Oposición (Negarse a cierto tratamiento)</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 mb-1 block">N.° Documento (DNI/CE) *</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={documentId}
                                        onChange={(e) => setDocumentId(e.target.value)}
                                        placeholder="Ej: 44556677" 
                                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 font-mono font-semibold text-slate-700"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Dirección de Domicilio *</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Av. Las Lomas 123, Lima" 
                                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 font-medium text-slate-700"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-500 mb-1 block">Detalle de la Solicitud (Datos implicados) *</label>
                                <textarea 
                                    required 
                                    rows={3}
                                    value={arcoDescription}
                                    onChange={(e) => setArcoDescription(e.target.value)}
                                    placeholder="Explica qué información quieres consultar, rectificar o suprimir..." 
                                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none font-medium text-slate-700"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-500 mb-1 block">Pedido Concreto *</label>
                                <textarea 
                                    required 
                                    rows={2}
                                    value={arcoRequest}
                                    onChange={(e) => setArcoRequest(e.target.value)}
                                    placeholder="Especifica el pedido final (ej. 'Que se elimine mi cuenta', 'Que se me envíe la base de datos...')" 
                                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none font-medium text-slate-700"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={arcoSubmitting}
                                className="w-full flex items-center justify-center gap-1.5 px-4 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 disabled:opacity-50 transition-all text-xs shadow-md mt-1"
                            >
                                {arcoSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                <span>{arcoSubmitting ? 'Enviando solicitud...' : 'Enviar Solicitud ARCO'}</span>
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    )
}
