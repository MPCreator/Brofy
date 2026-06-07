'use client'

import { useState, useEffect } from 'react'
import { getMyEstablishments, updateEstablishment, createEstablishment, getMyRole } from '@/lib/actions'
import { ESTABLISHMENT_TYPE_LABELS } from '@/lib/types'
import Link from 'next/link'
import {
    Building2, MapPin, Phone, FileText, Save, Loader2, CheckCircle2,
    QrCode, Copy, Check, ExternalLink, Tag, Plus, X, Navigation, Users, Camera
} from 'lucide-react'
import { toast } from 'sonner'
import { QRCodeSVG } from 'qrcode.react'
import { OperatingHoursInput } from './OperatingHoursInput'

function compressImage(file: File, maxWidth: number, maxHeight: number, quality: number): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = (event) => {
            const img = new Image()
            img.src = event.target?.result as string
            img.onload = () => {
                const canvas = document.createElement('canvas')
                let width = img.width
                let height = img.height

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width)
                        width = maxWidth
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height)
                        height = maxHeight
                    }
                }

                canvas.width = width
                canvas.height = height
                const ctx = canvas.getContext('2d')
                ctx?.drawImage(img, 0, 0, width, height)
                
                const compressedBase64 = canvas.toDataURL('image/jpeg', quality)
                resolve(compressedBase64)
            }
            img.onerror = (err) => reject(err)
        }
        reader.onerror = (err) => reject(err)
    })
}

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

    // Blocked dates (holidays) state
    const [blockedDatesMap, setBlockedDatesMap] = useState<Record<string, string[]>>({})

    // Specialists state
    const [specialistsMap, setSpecialistsMap] = useState<Record<string, { id: string; name: string; cmvpId: string; role: string; isActive: boolean }[]>>({})

    // User role (vet vs provider)
    const [userRole, setUserRole] = useState<string>('vet')

    useEffect(() => { loadData() }, [])

    async function loadData() {
        setLoading(true)
        const [data, role] = await Promise.all([getMyEstablishments(), getMyRole()])
        setUserRole(role)
        setEstablishments(data)
        // Pre-fill editPhotosMap, editLogosMap, blockedDatesMap, and specialistsMap for each establishment
        const initialMap: Record<string, (string | null)[]> = {}
        const initialLogos: Record<string, string | null> = {}
        const initialBlockedDates: Record<string, string[]> = {}
        const initialSpecialists: Record<string, { id: string; name: string; cmvpId: string; role: string; isActive: boolean }[]> = {}
        data.forEach(est => {
            const urls = est.photoUrl ? est.photoUrl.split(',') : []
            initialMap[est.id] = [...urls, null, null, null, null].slice(0, 4)
            initialLogos[est.id] = est.logoUrl || null
            try {
                initialBlockedDates[est.id] = JSON.parse(est.blockedDates || '[]')
            } catch {
                initialBlockedDates[est.id] = []
            }
            try {
                initialSpecialists[est.id] = JSON.parse(est.specialists || '[]')
            } catch {
                initialSpecialists[est.id] = []
            }
        })
        setEditPhotosMap(initialMap)
        setEditLogosMap(initialLogos)
        setBlockedDatesMap(initialBlockedDates)
        setSpecialistsMap(initialSpecialists)
        setLoading(false)
    }

    const addSpecialist = (estId: string, name: string, cmvpId: string, role: string) => {
        if (!name.trim()) {
            toast.error('El nombre es obligatorio')
            return
        }
        const cleanCmvp = cmvpId.trim()
        const finalCmvp = (!cleanCmvp || cleanCmvp.toLowerCase() === 'no aplica') ? 'No aplica' : cleanCmvp
        setSpecialistsMap(prev => {
            const currentList = prev[estId] || []
            if (finalCmvp !== 'No aplica') {
                const exists = currentList.some(s => s.cmvpId.toLowerCase().trim() === finalCmvp.toLowerCase().trim())
                if (exists) {
                    toast.error('Ya existe un especialista registrado con este CMVP')
                    return prev
                }
            }
            const newSvc = {
                id: Math.random().toString(36).substring(2, 11),
                name: name.trim(),
                cmvpId: finalCmvp,
                role: role || 'vet',
                isActive: true
            }
            return { ...prev, [estId]: [...currentList, newSvc] }
        })
    }

    const removeSpecialist = (estId: string, id: string) => {
        setSpecialistsMap(prev => {
            const currentList = prev[estId] || []
            const nextList = currentList.filter(s => s.id !== id)
            return { ...prev, [estId]: nextList }
        })
    }

    const toggleSpecialistActive = (estId: string, id: string) => {
        setSpecialistsMap(prev => {
            const currentList = prev[estId] || []
            const nextList = currentList.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s)
            return { ...prev, [estId]: nextList }
        })
    }

    const addBlockedDate = (estId: string, dateString: string) => {
        if (!dateString) return
        setBlockedDatesMap(prev => {
            const currentList = prev[estId] || []
            if (currentList.includes(dateString)) {
                toast.error('Esta fecha ya está registrada')
                return prev
            }
            const nextList = [...currentList, dateString].sort()
            return { ...prev, [estId]: nextList }
        })
    }

    const removeBlockedDate = (estId: string, dateString: string) => {
        setBlockedDatesMap(prev => {
            const currentList = prev[estId] || []
            const nextList = currentList.filter(d => d !== dateString)
            return { ...prev, [estId]: nextList }
        })
    }

    const handleCreatePhotoChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 10 * 1024 * 1024) {
            toast.error('La imagen no debe superar los 10MB')
            return
        }

        try {
            const base64String = await compressImage(file, 1200, 1200, 0.8)
            setCreatePhotos(prev => {
                const next = [...prev]
                next[index] = base64String
                return next
            })
        } catch {
            toast.error('Error al procesar la imagen')
        }
    }

    const handleRemoveCreatePhoto = (index: number) => {
        setCreatePhotos(prev => {
            const next = [...prev]
            next[index] = null
            return next
        })
    }

    const handleEditPhotoChange = async (estId: string, index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 10 * 1024 * 1024) {
            toast.error('La imagen no debe superar los 10MB')
            return
        }

        try {
            const base64String = await compressImage(file, 1200, 1200, 0.8)
            setEditPhotosMap(prev => {
                const next = { ...prev }
                const currentArr = next[estId] ? [...next[estId]] : [null, null, null, null]
                currentArr[index] = base64String
                next[estId] = currentArr
                return next
            })
        } catch {
            toast.error('Error al procesar la imagen')
        }
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

    const handleCreateLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 5 * 1024 * 1024) {
            toast.error('El logo no debe superar los 5MB')
            return
        }

        try {
            const base64String = await compressImage(file, 600, 600, 0.85)
            setCreateLogo(base64String)
        } catch {
            toast.error('Error al procesar el logo')
        }
    }

    const handleRemoveCreateLogo = () => {
        setCreateLogo(null)
    }

    const handleEditLogoChange = async (estId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 5 * 1024 * 1024) {
            toast.error('El logo no debe superar los 5MB')
            return
        }

        try {
            const base64String = await compressImage(file, 600, 600, 0.85)
            setEditLogosMap(prev => ({
                ...prev,
                [estId]: base64String
            }))
        } catch {
            toast.error('Error al procesar el logo')
        }
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

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1"><Building2 className="w-3.5 h-3.5" /> Nombre</label>
                                    <input name="name" defaultValue={est.name} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                </div>

                                <div>
                                    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1"><MapPin className="w-3.5 h-3.5" /> Dirección</label>
                                    <input name="address" defaultValue={est.address} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-500 mb-1 block">Distrito</label>
                                    <input name="district" defaultValue={est.district || ''} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                </div>

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

                                <div className="sm:col-span-2">
                                    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1"><FileText className="w-3.5 h-3.5" /> Descripción</label>
                                    <textarea name="description" defaultValue={est.description || ''} rows={2} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
                                </div>
                            </div>

                            {/* Services summary */}
                            <div className="bg-slate-50 rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-slate-600">{est.services.length} servicios activos</span>
                                    <Link href="/dashboard/vet/services" className="text-xs text-primary-600 font-medium hover:underline">Gestionar →</Link>
                                </div>
                            </div>

                            {/* Calendario de Feriados y Cierres del Local */}
                            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 space-y-3">
                                <div>
                                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                                        📅 Feriados y Días de Cierre del Local
                                    </h4>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                        Registra los días festivos o no laborables especiales de tu país/región. Los dueños de mascota no podrán agendar citas generales en estas fechas.
                                    </p>
                                </div>
                                <input type="hidden" name="blockedDates" value={JSON.stringify(blockedDatesMap[est.id] || [])} />
                                
                                <div className="flex gap-2">
                                    <input 
                                        type="date"
                                        id={`new-blocked-date-${est.id}`}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            const inputEl = document.getElementById(`new-blocked-date-${est.id}`) as HTMLInputElement
                                            if (inputEl && inputEl.value) {
                                                addBlockedDate(est.id, inputEl.value)
                                                inputEl.value = ''
                                            } else {
                                                toast.error('Selecciona una fecha válida')
                                            }
                                        }}
                                        className="px-3.5 py-2 bg-slate-200 text-slate-850 rounded-lg text-xs font-bold hover:bg-slate-250 transition-colors shrink-0"
                                    >
                                        Agregar Feriado
                                    </button>
                                </div>

                                {/* List/Table of blocked dates */}
                                {(blockedDatesMap[est.id] || []).length === 0 ? (
                                    <p className="text-[11px] text-slate-405 italic py-1">No hay feriados configurados para este local.</p>
                                ) : (
                                    <div className="border border-slate-200/50 rounded-lg bg-white max-h-40 overflow-y-auto overflow-x-auto">
                                        <table className="w-full text-left border-collapse text-xs">
                                            <thead>
                                                <tr className="bg-slate-100 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200">
                                                    <th className="px-3 py-1.5">Fecha</th>
                                                    <th className="px-3 py-1.5 text-right">Acción</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                                {(blockedDatesMap[est.id] || []).map((dateStr) => {
                                                    const formatted = new Date(dateStr + 'T00:00:00').toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })
                                                    return (
                                                        <tr key={dateStr} className="hover:bg-slate-50/50">
                                                            <td className="px-3 py-2">{formatted}</td>
                                                            <td className="px-3 py-2 text-right">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeBlockedDate(est.id, dateStr)}
                                                                    className="text-red-500 hover:text-red-750 font-bold transition-colors"
                                                                >
                                                                    Eliminar
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            <OperatingHoursInput defaultHours={est.operatingHours} />

                            {/* Veterinarios y Especialistas de la Sede */}
                            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 space-y-3">
                                <div>
                                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                                        🩺 Staff, Veterinarios y Especialistas
                                    </h4>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                        Registra a los veterinarios, estilistas (groomers), paseadores o personal adicional. Podrás seleccionarlos al emitir las recetas o fichas de servicio.
                                    </p>
                                </div>

                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-900 space-y-1">
                                    <span className="font-bold flex items-center gap-1">
                                        ⚠️ Declaración de Responsabilidad del Local:
                                    </span>
                                    <p className="opacity-95 leading-relaxed">
                                        Al registrar especialistas médicos en esta sede, declaras bajo juramento que cuentan con habilitación profesional (CMVP) vigente y autorizada por ley. Para personal de estética o cuidado (no médicos), declaras bajo juramento que cuentan con la idoneidad y permisos correspondientes. La plataforma Brofy actúa únicamente como soporte de infraestructura tecnológica y exime toda responsabilidad médica, de adiestramiento o estética.
                                    </p>
                                </div>

                                <input type="hidden" name="specialists" value={JSON.stringify(specialistsMap[est.id] || [])} />
                                
                                <div className="grid grid-cols-1 gap-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        <input 
                                            type="text"
                                            id={`new-specialist-name-${est.id}`}
                                            placeholder="Nombre completo (Ej: Ana Gómez)"
                                            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 w-full"
                                        />
                                        <select
                                            id={`new-specialist-role-${est.id}`}
                                            defaultValue={userRole === 'provider' ? 'groomer' : 'vet'}
                                            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 w-full font-medium cursor-pointer"
                                        >
                                            {/* Opción médica: solo para cuentas vet */}
                                            {userRole !== 'provider' && (
                                                <option value="vet">🩺 Veterinario/a (Médico)</option>
                                            )}
                                            <option value="groomer">✂️ Estilista / Groomer</option>
                                            <option value="bath">🛁 Bañador/a</option>
                                            <option value="walker">🦮 Paseador/a</option>
                                            <option value="trainer">🎓 Entrenador/a</option>
                                            <option value="other">👤 Otro personal</option>
                                        </select>
                                    </div>
                                    {/* Campo CMVP: solo visible para cuentas vet que puedan registrar médicos */}
                                    {userRole !== 'provider' && (
                                        <input 
                                            type="text"
                                            id={`new-specialist-cmvp-${est.id}`}
                                            placeholder="CMVP (solo para veterinarios, opcional para otros)"
                                            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 w-full"
                                        />
                                    )}
                                    {/* Campo oculto para CMVP en providers, siempre 'No aplica' */}
                                    {userRole === 'provider' && (
                                        <input type="hidden" id={`new-specialist-cmvp-${est.id}`} value="No aplica" />
                                    )}
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => {
                                        const nameEl = document.getElementById(`new-specialist-name-${est.id}`) as HTMLInputElement
                                        const cmvpEl = document.getElementById(`new-specialist-cmvp-${est.id}`) as HTMLInputElement
                                        const roleEl = document.getElementById(`new-specialist-role-${est.id}`) as HTMLSelectElement
                                        if (nameEl && nameEl.value.trim()) {
                                            addSpecialist(est.id, nameEl.value, cmvpEl.value, roleEl.value)
                                            nameEl.value = ''
                                            cmvpEl.value = ''
                                            roleEl.value = userRole === 'provider' ? 'groomer' : 'vet'
                                        } else {
                                            toast.error('El nombre del especialista es obligatorio')
                                        }
                                    }}
                                    className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-bold transition-colors"
                                >
                                    ➕ Agregar al Staff de la Sede
                                </button>

                                {/* List/Table of specialists */}
                                {(specialistsMap[est.id] || []).length === 0 ? (
                                    <p className="text-[11px] text-slate-400 italic py-1">No hay especialistas adicionales registrados.</p>
                                ) : (
                                    <div className="border border-slate-200/50 rounded-lg bg-white max-h-40 overflow-y-auto overflow-x-auto">
                                        <table className="w-full text-left border-collapse text-xs">
                                            <thead>
                                                <tr className="bg-slate-100 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200">
                                                    <th className="px-3 py-1.5">Nombre</th>
                                                    <th className="px-3 py-1.5">Rol</th>
                                                    <th className="px-3 py-1.5">CMVP</th>
                                                    <th className="px-3 py-1.5 text-center">Estado</th>
                                                    <th className="px-3 py-1.5 text-right">Acción</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                                {(specialistsMap[est.id] || []).map((spec) => {
                                                    const roleLabels: Record<string,string> = { vet: '🩺 Veterinario', groomer: '✂️ Groomer', bath: '🛁 Bañador/a', walker: '🦮 Paseador/a', trainer: '🎓 Entrenador/a', other: '👤 Otro' }
                                                    return (
                                                        <tr key={spec.id} className="hover:bg-slate-50/50">
                                                            <td className="px-3 py-2 truncate max-w-[120px] font-semibold">{spec.name}</td>
                                                            <td className="px-3 py-2 text-[10px]">{roleLabels[spec.role] || '👤 Otro'}</td>
                                                            <td className="px-3 py-2 font-mono text-[10px] text-slate-500">{spec.cmvpId}</td>
                                                            <td className="px-3 py-2 text-center">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleSpecialistActive(est.id, spec.id)}
                                                                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${spec.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}
                                                                >
                                                                    {spec.isActive ? 'Activo' : 'Inactivo'}
                                                                </button>
                                                            </td>
                                                            <td className="px-3 py-2 text-right">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeSpecialist(est.id, spec.id)}
                                                                    className="text-red-500 hover:text-red-700 font-bold transition-colors"
                                                                >
                                                                    Eliminar
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

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
