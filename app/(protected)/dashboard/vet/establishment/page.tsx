'use client'

import { useState, useEffect } from 'react'
import { getMyEstablishments, updateEstablishment, createEstablishment } from '@/lib/actions'
import { ESTABLISHMENT_TYPE_LABELS } from '@/lib/types'
import Link from 'next/link'
import {
    Building2, MapPin, Phone, FileText, Save, Loader2, CheckCircle2,
    QrCode, Copy, Check, ExternalLink, Tag, Plus, X, Navigation, Users, Camera
} from 'lucide-react'
import { toast } from 'sonner'
import { QRCodeSVG } from 'qrcode.react'
import { OperatingHoursInput } from './OperatingHoursInput'

export default function EstablishmentPage() {
    const [establishments, setEstablishments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [copiedQr, setCopiedQr] = useState<string | null>(null)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [creatingLocation, setCreatingLocation] = useState(false)
    const [createLat, setCreateLat] = useState('-12.0464')
    const [createLng, setCreateLng] = useState('-77.0428')

    // Multiple photos (up to 4) states
    const [createPhotos, setCreatePhotos] = useState<(string | null)[]>([null, null, null, null])
    const [editPhotosMap, setEditPhotosMap] = useState<Record<string, (string | null)[]>>({})

    // Logo states
    const [createLogo, setCreateLogo] = useState<string | null>(null)
    const [editLogosMap, setEditLogosMap] = useState<Record<string, string | null>>({})

    useEffect(() => { loadData() }, [])

    async function loadData() {
        setLoading(true)
        const data = await getMyEstablishments()
        setEstablishments(data)
        // Pre-fill editPhotosMap and editLogosMap for each establishment
        const initialMap: Record<string, (string | null)[]> = {}
        const initialLogos: Record<string, string | null> = {}
        data.forEach(est => {
            const urls = est.photoUrl ? est.photoUrl.split(',') : []
            initialMap[est.id] = [...urls, null, null, null, null].slice(0, 4)
            initialLogos[est.id] = est.logoUrl || null
        })
        setEditPhotosMap(initialMap)
        setEditLogosMap(initialLogos)
        setLoading(false)
    }

    const handleCreatePhotoChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 4 * 1024 * 1024) {
            toast.error('La imagen no debe superar los 4MB')
            return
        }

        const reader = new FileReader()
        reader.onloadend = () => {
            const base64String = reader.result as string
            setCreatePhotos(prev => {
                const next = [...prev]
                next[index] = base64String
                return next
            })
        }
        reader.readAsDataURL(file)
    }

    const handleRemoveCreatePhoto = (index: number) => {
        setCreatePhotos(prev => {
            const next = [...prev]
            next[index] = null
            return next
        })
    }

    const handleEditPhotoChange = (estId: string, index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 4 * 1024 * 1024) {
            toast.error('La imagen no debe superar los 4MB')
            return
        }

        const reader = new FileReader()
        reader.onloadend = () => {
            const base64String = reader.result as string
            setEditPhotosMap(prev => {
                const next = { ...prev }
                const currentArr = next[estId] ? [...next[estId]] : [null, null, null, null]
                currentArr[index] = base64String
                next[estId] = currentArr
                return next
            })
        }
        reader.readAsDataURL(file)
    }

    const handleRemoveEditPhoto = (estId: string, index: number) => {
        setEditPhotosMap(prev => {
            const next = { ...prev }
            const currentArr = next[estId] ? [...next[estId]] : [null, null, null, null]
            currentArr[index] = null
            next[estId] = currentArr
            return next
        })
    }

    const handleCreateLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 2 * 1024 * 1024) {
            toast.error('El logo no debe superar los 2MB')
            return
        }

        const reader = new FileReader()
        reader.onloadend = () => {
            setCreateLogo(reader.result as string)
        }
        reader.readAsDataURL(file)
    }

    const handleRemoveCreateLogo = () => {
        setCreateLogo(null)
    }

    const handleEditLogoChange = (estId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 2 * 1024 * 1024) {
            toast.error('El logo no debe superar los 2MB')
            return
        }

        const reader = new FileReader()
        reader.onloadend = () => {
            setEditLogosMap(prev => ({
                ...prev,
                [estId]: reader.result as string
            }))
        }
        reader.readAsDataURL(file)
    }

    const handleRemoveEditLogo = (estId: string) => {
        setEditLogosMap(prev => ({
            ...prev,
            [estId]: ''
        }))
    }

    async function handleSave(formData: FormData) {
        setSaving(true)
        const estId = formData.get('id') as string
        const currentPhotos = editPhotosMap[estId] || []
        formData.set('photosBase64', JSON.stringify(currentPhotos.filter(Boolean)))
        
        const currentLogo = editLogosMap[estId]
        if (currentLogo !== undefined && currentLogo !== null) {
            formData.set('logoBase64', currentLogo)
        }

        try {
            const result = await updateEstablishment(formData)
            if (result && 'message' in result) {
                toast.error(result.message)
            } else if (result && 'success' in result && result.success) {
                toast.success('Establecimiento actualizado')
                loadData()
            } else {
                toast.error('Error al actualizar establecimiento')
            }
        } catch {
            toast.error('Error del servidor al actualizar')
        } finally {
            setSaving(false)
        }
    }

    async function handleCreate(formData: FormData) {
        setSaving(true)
        formData.set('latitude', createLat)
        formData.set('longitude', createLng)
        formData.set('photosBase64', JSON.stringify(createPhotos.filter(Boolean)))
        
        if (createLogo) {
            formData.set('logoBase64', createLogo)
        }
        
        try {
            const result = await createEstablishment(formData)
            
            if (result && 'message' in result) {
                toast.error(result.message)
            } else if (result && 'errors' in result) {
                console.error("Validation errors:", result.errors)
                toast.error('Revisa los campos obligatorios.')
            } else if (result && 'success' in result && result.success) {
                toast.success('Establecimiento creado correctamente')
                setShowCreateForm(false)
                setCreatePhotos([null, null, null, null])
                setCreateLogo(null)
                loadData()
            } else {
                toast.error('Ocurrió un error inesperado al crear el local')
            }
        } catch (e) {
            console.error("Creation error:", e)
            toast.error('Error del servidor al intentar crear el establecimiento')
        } finally {
            setSaving(false)
        }
    }

    function detectLocation() {
        setCreatingLocation(true)
        if (typeof navigator !== 'undefined' && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setCreateLat(pos.coords.latitude.toFixed(6))
                    setCreateLng(pos.coords.longitude.toFixed(6))
                    setCreatingLocation(false)
                },
                () => {
                    setCreatingLocation(false)
                    alert('No se pudo obtener la ubicación. Ingresa las coordenadas manualmente.')
                },
                { enableHighAccuracy: true, timeout: 10000 }
            )
        } else {
            setCreatingLocation(false)
        }
    }

    function copyQr(estId: string) {
        const origin = typeof window !== 'undefined' ? window.location.origin : 'https://brofy-phi.vercel.app'
        const url = `${origin}/establishment/${estId}`
        // Safari-safe clipboard
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).catch(() => {
                fallbackCopy(url)
            })
        } else {
            fallbackCopy(url)
        }
        setCopiedQr(estId)
        setTimeout(() => setCopiedQr(null), 2000)
    }

    function fallbackCopy(text: string) {
        const ta = document.createElement('textarea')
        ta.value = text
        ta.style.position = 'fixed'
        ta.style.left = '-9999px'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
    }

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Mis Establecimientos</h1>
                    <p className="text-sm text-slate-500 mt-1">Gestiona tus locales y servicios</p>
                </div>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-full text-sm font-medium hover:bg-primary-700 transition-colors shadow-md"
                >
                    <Plus className="w-4 h-4" /> Nuevo local
                </button>
            </div>

            {/* Create New Form */}
            {showCreateForm && (
                <form action={handleCreate} className="bg-white rounded-3xl border border-primary-200 p-5 space-y-4 animate-in shadow-card">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-primary-600" />
                            Nuevo Establecimiento
                        </h3>
                        <button type="button" onClick={() => setShowCreateForm(false)} className="p-1 text-slate-400 hover:text-slate-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Interactive Photo Upload (Up to 4 images) */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                                <Camera className="w-4 h-4 text-primary-500" />
                                Fotos del establecimiento (Máximo 4)
                            </label>
                            <span className="text-[10px] text-slate-400 font-medium">Sube fotos o logos para tu espacio público</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2.5">
                            {[0, 1, 2, 3].map(index => {
                                const preview = createPhotos[index]
                                return (
                                    <div key={index} className="relative group aspect-[4/3] rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden transition-all shadow-sm hover:border-primary-300">
                                        {preview ? (
                                            <>
                                                <img src={preview} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveCreatePhoto(index)}
                                                    className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/75 text-white rounded-full transition-colors"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </>
                                        ) : (
                                            <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50/50 transition-colors">
                                                <Camera className="w-5 h-5 text-slate-300 group-hover:text-primary-500 transition-colors" />
                                                <span className="text-[9px] text-slate-400 font-bold mt-1">Foto {index + 1}</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleCreatePhotoChange(index, e)}
                                                    className="hidden"
                                                />
                                            </label>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Interactive Logo Upload (Single logo image) */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                                <Camera className="w-4 h-4 text-primary-500" />
                                Logo del establecimiento (Opcional)
                            </label>
                            <span className="text-[10px] text-slate-400 font-medium">Sube el logo de tu marca</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative group w-20 h-20 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden transition-all shadow-sm hover:border-primary-300">
                                {createLogo ? (
                                    <>
                                        <img src={createLogo} alt="Logo" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={handleRemoveCreateLogo}
                                            className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/75 text-white rounded-full transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </>
                                ) : (
                                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50/50 transition-colors">
                                        <Plus className="w-6 h-6 text-slate-300 group-hover:text-primary-500 transition-colors" />
                                        <span className="text-[9px] text-slate-400 font-bold mt-1">Logo</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleCreateLogoChange}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>
                            <div className="text-xs text-slate-400">
                                <p>Soporta JPG, PNG de hasta 2MB.</p>
                                <p>Se mostrará en los perfiles públicos y búsquedas.</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2">
                            <label className="text-xs font-semibold text-slate-500 mb-1 block">Nombre del local *</label>
                            <input name="name" required placeholder="Ej: Clínica Veterinaria San Borja" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="text-xs font-medium text-slate-500 mb-1 block">Dirección *</label>
                            <input name="address" required placeholder="Av. Principal 123, Distrito" className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500 mb-1 block">Distrito</label>
                            <input name="district" placeholder="Ej: Miraflores" className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-xs font-medium text-slate-500 mb-1 block">Tipo *</label>
                                <select name="type" required className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                                    {Object.entries(ESTABLISHMENT_TYPE_LABELS).map(([val, label]) => (
                                        <option key={val} value={val}>{label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 mb-1 block" title="Veterinarios atendiendo al mismo tiempo">Capacidad (Citas a la vez)</label>
                                <input type="number" name="concurrentSlots" min="1" max="20" defaultValue="1" className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500 mb-1 block">Teléfono</label>
                            <input name="phone" placeholder="+51 999 111 222" className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500 mb-1 block">Ubicación (GPS)</label>
                            <button
                                type="button"
                                onClick={detectLocation}
                                disabled={creatingLocation}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-primary-50 hover:text-primary-600 transition-colors disabled:opacity-50"
                            >
                                {creatingLocation ? (
                                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Detectando...</>
                                ) : (
                                    <><Navigation className="w-3.5 h-3.5" /> Usar mi ubicación</>
                                )}
                            </button>
                        </div>
                        <div className="sm:col-span-2 grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-xs font-medium text-slate-500 mb-1 block">Latitud</label>
                                <input
                                    type="text"
                                    value={createLat}
                                    onChange={(e) => setCreateLat(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 mb-1 block">Longitud</label>
                                <input
                                    type="text"
                                    value={createLng}
                                    onChange={(e) => setCreateLng(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                        </div>
                        <div className="sm:col-span-2">
                            <label className="text-xs font-medium text-slate-500 mb-1 block">Descripción</label>
                            <textarea name="description" rows={2} placeholder="Describe tu local..." className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
                        </div>
                    </div>

                    <OperatingHoursInput />

                    <div className="flex gap-2 pt-1">
                        <button type="button" onClick={() => setShowCreateForm(false)} className="flex-1 px-3 py-2.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">Cancelar</button>
                        <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 shadow-md">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Crear establecimiento
                        </button>
                    </div>
                </form>
            )}

            {/* Existing Establishments */}
            {establishments.length === 0 && !showCreateForm ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
                    <Building2 className="w-14 h-14 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">Sin establecimientos</h3>
                    <p className="text-sm text-slate-500 mb-4">Registra tu primer local para empezar a recibir clientes</p>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-full text-sm font-medium hover:bg-primary-700 shadow-md"
                    >
                        <Plus className="w-4 h-4" /> Crear mi primer local
                    </button>
                </div>
            ) : (
                establishments.map(est => (
                    <div key={est.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                        {/* QR Section */}
                        <div className="bg-gradient-to-r from-primary-500 to-primary-700 p-6 text-white">
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <div className="bg-white p-3 rounded-2xl shadow-lg shrink-0">
                                    <QRCodeSVG 
                                        value={typeof window !== 'undefined' ? `${window.location.origin}/establishment/${est.id}` : `https://brofy-phi.vercel.app/establishment/${est.id}`}
                                        size={120}
                                        level="H"
                                        includeMargin={false}
                                    />
                                </div>
                                <div className="flex-1 w-full text-center md:text-left space-y-3">
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">{est.name}</h3>
                                        <p className="text-xs opacity-90 mb-1.5">Código Único de Local: <span className="font-bold bg-white/20 px-2 py-0.5 rounded font-mono">{est.dni || 'Pendiente'}</span></p>
                                        <p className="text-sm opacity-80 text-balance">Los clientes deben escanear este código al llegar para iniciar la atención y el pago de comisión.</p>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                                        <button onClick={() => copyQr(est.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 rounded-lg text-xs hover:bg-white/30 transition-colors">
                                            {copiedQr === est.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                            {copiedQr === est.id ? 'Copiado!' : 'Copiar enlace'}
                                        </button>
                                        <Link href={`/establishment/${est.id}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 rounded-lg text-xs hover:bg-white/30 transition-colors">
                                            <ExternalLink className="w-3.5 h-3.5" /> Ver perfil público
                                        </Link>
                                    </div>
                                    <p className="text-xs opacity-70 font-mono truncate bg-black/20 p-2 rounded-lg text-center md:text-left">
                                        {typeof window !== 'undefined' ? `${window.location.origin}/establishment/${est.id}` : `https://brofy-phi.vercel.app/establishment/${est.id}`}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Edit Form */}
                        <form action={handleSave} className="p-4 space-y-3">
                            <input type="hidden" name="id" value={est.id} />

                            {/* Interactive Photo Upload (Up to 4 images) */}
                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2 mb-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                                        <Camera className="w-4 h-4 text-primary-500" />
                                        Fotos del establecimiento (Máximo 4)
                                    </label>
                                    <span className="text-[10px] text-slate-400 font-medium">Gestiona las imágenes de tu local</span>
                                </div>
                                <div className="grid grid-cols-4 gap-2.5">
                                    {[0, 1, 2, 3].map(index => {
                                        const currentArr = editPhotosMap[est.id] || []
                                        const preview = currentArr[index]
                                        return (
                                            <div key={index} className="relative group aspect-[4/3] rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden transition-all shadow-sm hover:border-primary-300">
                                                {preview ? (
                                                    <>
                                                        <img src={preview} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveEditPhoto(est.id, index)}
                                                            className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/75 text-white rounded-full transition-colors"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50/50 transition-colors">
                                                        <Camera className="w-5 h-5 text-slate-300 group-hover:text-primary-500 transition-colors" />
                                                        <span className="text-[9px] text-slate-400 font-bold mt-1">Foto {index + 1}</span>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => handleEditPhotoChange(est.id, index, e)}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Interactive Logo Upload (Single logo image) */}
                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2 mb-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                                        <Camera className="w-4 h-4 text-primary-500" />
                                        Logo del establecimiento (Opcional)
                                    </label>
                                    <span className="text-[10px] text-slate-400 font-medium">Gestiona el logo de tu local</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="relative group w-20 h-20 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden transition-all shadow-sm hover:border-primary-300">
                                        {editLogosMap[est.id] !== undefined && editLogosMap[est.id] !== '' && editLogosMap[est.id] !== null ? (
                                            <>
                                                <img src={editLogosMap[est.id] || ''} alt="Logo" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveEditLogo(est.id)}
                                                    className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/75 text-white rounded-full transition-colors"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </>
                                        ) : (
                                            <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50/50 transition-colors">
                                                <Plus className="w-6 h-6 text-slate-300 group-hover:text-primary-500 transition-colors" />
                                                <span className="text-[9px] text-slate-400 font-bold mt-1">Logo</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleEditLogoChange(est.id, e)}
                                                    className="hidden"
                                                />
                                            </label>
                                        )}
                                    </div>
                                    <div className="text-xs text-slate-400">
                                        <p>Soporta JPG, PNG de hasta 2MB.</p>
                                        <p>Se mostrará en los perfiles públicos y búsquedas.</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1"><Building2 className="w-3.5 h-3.5" /> Nombre</label>
                                <input name="name" defaultValue={est.name} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1"><MapPin className="w-3.5 h-3.5" /> Dirección</label>
                                    <input name="address" defaultValue={est.address} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-500 mb-1 block">Distrito</label>
                                    <input name="district" defaultValue={est.district || ''} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1"><Phone className="w-3.5 h-3.5" /> Teléfono</label>
                                    <input name="phone" defaultValue={est.phone || ''} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1"><Tag className="w-3.5 h-3.5" /> Tipo</label>
                                    <select name="type" defaultValue={est.type} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                                        {Object.entries(ESTABLISHMENT_TYPE_LABELS).map(([val, label]) => (
                                            <option key={val} value={val}>{label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-500 mb-1 block flex items-center gap-1.5" title="Veterinarios atendiendo al mismo tiempo">
                                        <Users className="w-3.5 h-3.5" /> Capacidad Simultánea
                                    </label>
                                    <input type="number" name="concurrentSlots" min="1" max="20" defaultValue={est.concurrentSlots || 1} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                </div>
                            </div>
                            </div>

                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1"><FileText className="w-3.5 h-3.5" /> Descripción</label>
                                <textarea name="description" defaultValue={est.description || ''} rows={2} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
                            </div>

                            {/* Services summary */}
                            <div className="bg-slate-50 rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-slate-600">{est.services.length} servicios activos</span>
                                    <Link href="/dashboard/vet/services" className="text-xs text-primary-600 font-medium hover:underline">Gestionar →</Link>
                                </div>
                            </div>

                            <OperatingHoursInput defaultHours={est.operatingHours} />

                            <div className="sm:col-span-2 mt-2">
                                <button disabled={saving} type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg font-medium text-sm hover:bg-primary-700 disabled:opacity-50 shadow-md">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {saving ? 'Guardando...' : 'Guardar cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                ))
            )}
        </div>
    )
}
