'use client'

import { useState, useEffect } from 'react'
import { addPet } from '@/lib/actions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { 
    Sparkles, ShieldCheck, Heart, PawPrint, Info, 
    ChevronRight, ArrowLeft, ArrowRight, Loader2, Compass, CheckCircle2, Check
} from 'lucide-react'

export function ClientOnboarding({ initialNeedsOnboarding }: { initialNeedsOnboarding: boolean }) {
    const [isOpen, setIsOpen] = useState(initialNeedsOnboarding)
    const [step, setStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [selectedSpecies, setSelectedSpecies] = useState('dog')
    const router = useRouter()

    useEffect(() => {
        if (isOpen) {
            localStorage.setItem('brofy_onboarding_active', 'true')
        } else {
            localStorage.removeItem('brofy_onboarding_active')
        }
        return () => {
            localStorage.removeItem('brofy_onboarding_active')
        }
    }, [isOpen])

    if (!isOpen) return null

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsLoading(true)

        const formData = new FormData(event.currentTarget)
        try {
            const result = await addPet(formData)
            if (result?.errors) {
                const errorMsg = Object.values(result.errors).flat().join(', ')
                toast.error(errorMsg || 'Por favor, completa los campos obligatorios.')
            } else if (result?.message && !result.success) {
                toast.error(result.message)
            } else if (result?.success) {
                toast.success('¡Mascota registrada con éxito!')
                setStep(3)
            } else {
                toast.error('Error al guardar la mascota')
            }
        } catch (e) {
            toast.error('Ocurrió un error al procesar el registro')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-slate-900 flex items-center justify-center p-4 overflow-y-auto">
            {/* Background design accents */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_45%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.12),transparent_40%)] pointer-events-none" />

            <div className="bg-white/95 backdrop-blur-md rounded-3xl w-full max-w-xl shadow-2xl border border-slate-100 overflow-hidden relative transition-all duration-300">
                {/* Step indicator */}
                <div className="px-6 pt-6 pb-3 border-b border-slate-100/80 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1.5">
                            <span className="text-xl">🐾</span>
                            <span className="text-sm font-black text-slate-800 tracking-tight">Brofy</span>
                        </div>
                        <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-md">
                            Progreso
                        </span>
                    </div>
                    
                    {/* Stepper timeline */}
                    <div className="relative flex items-start justify-between w-full px-2 mb-2">
                        {/* Connecting Line */}
                        <div className="absolute top-[14px] left-0 right-0 h-0.5 bg-slate-100 z-0" />
                        <div 
                            className="absolute top-[14px] left-0 h-0.5 bg-emerald-500 transition-all duration-500 z-0" 
                            style={{ width: `${((step - 1) / 2) * 100}%` }}
                        />

                        {[
                            { stepNum: 1, label: 'Inicio' },
                            { stepNum: 2, label: 'Mascota' },
                            { stepNum: 3, label: 'Descubrir' }
                        ].map((s) => {
                            const isActive = s.stepNum === step
                            const isCompleted = s.stepNum < step
                            return (
                                <div key={s.stepNum} className="flex flex-col items-center relative z-10">
                                    <div 
                                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border ${
                                            isActive 
                                                ? 'bg-primary-600 border-primary-700 text-white ring-4 ring-primary-100 shadow-md scale-110 z-10' 
                                                : isCompleted
                                                    ? 'bg-emerald-500 border-emerald-600 text-white z-10' 
                                                    : 'bg-white border-slate-200 text-slate-400 z-10'
                                        }`}
                                    >
                                        {isCompleted ? <Check className="w-3.5 h-3.5 text-white stroke-[3]" /> : s.stepNum}
                                    </div>
                                    <span 
                                        className={`text-[10px] font-bold mt-1.5 transition-colors duration-300 ${
                                            isActive 
                                                ? 'text-primary-600 font-black' 
                                                : isCompleted
                                                    ? 'text-emerald-600'
                                                    : 'text-slate-400'
                                        }`}
                                    >
                                        {s.label}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Step 1: Bienvenida e Introducción */}
                {step === 1 && (
                    <div className="p-6 sm:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
                        <div className="space-y-2 text-center sm:text-left">
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2 justify-center sm:justify-start">
                                ¡Bienvenido a Brofy! <Sparkles className="w-6 h-6 text-primary-500 animate-pulse" />
                            </h2>
                            <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                Tu compañero ideal para gestionar el bienestar y cuidado médico de tus engreídos.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center shrink-0">
                                    <Heart className="w-5.5 h-5.5 fill-primary-650 stroke-primary-650" />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-sm font-bold text-slate-850">Carnet Digital de Salud</h3>
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                        Registra antecedentes, vacunas, peso e historial clínico completo de tus mascotas de forma unificada y portable.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                                    <ShieldCheck className="w-5.5 h-5.5 text-amber-755" />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-sm font-bold text-slate-855">Código de Verificación Seguro</h3>
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                        Al agendar una cita, obtendrás un código único. El especialista te lo solicitará para iniciar la atención, garantizando seguridad y autenticidad.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={() => setStep(2)}
                                className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-primary-100 transition-all hover:shadow-xl active:scale-95"
                            >
                                Empezar Registro
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Registro de Mascota */}
                {step === 2 && (
                    <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4 animate-in fade-in slide-in-from-right-3 duration-300">
                        <div className="space-y-1">
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Registra a tu primer engreído</h2>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                Cuéntanos sobre tu mascota para habilitar su carnet digital. Podrás actualizar estos datos o agregar más mascotas luego.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Nombre de la mascota (Obligatorio)</label>
                                <input 
                                    required 
                                    name="name" 
                                    type="text" 
                                    placeholder="Ej. Firulais, Pelusa" 
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium" 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Especie (Obligatorio)</label>
                                    <select 
                                        name="species" 
                                        value={selectedSpecies}
                                        onChange={(e) => setSelectedSpecies(e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                                    >
                                        <option value="dog">Perro 🐕</option>
                                        <option value="cat">Gato 🐈</option>
                                        <option value="bird">Ave 🐦</option>
                                        <option value="rabbit">Conejo 🐰</option>
                                        <option value="hamster">Hámster 🐹</option>
                                        <option value="other">Otro</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Sexo (Obligatorio)</label>
                                    <select 
                                        name="sex" 
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                                    >
                                        <option value="male">Macho ♂</option>
                                        <option value="female">Hembra ♀</option>
                                        <option value="unknown">Desconocido</option>
                                    </select>
                                </div>
                            </div>

                            {selectedSpecies === 'other' && (
                                <div className="animate-in fade-in duration-250">
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Especie Personalizada (Obligatorio)</label>
                                    <input 
                                        required 
                                        name="customSpecies" 
                                        type="text" 
                                        placeholder="Ej. Loro, Minicerdo, Erizo..." 
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium" 
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Raza (Opcional)</label>
                                    <input 
                                        name="breed" 
                                        type="text" 
                                        placeholder="Ej. Boxer, Siamés" 
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Peso (kg) (Opcional)</label>
                                    <input 
                                        name="weight" 
                                        type="number" 
                                        step="0.1" 
                                        min="0" 
                                        placeholder="Ej. 10.5" 
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium" 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-3">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="px-5 py-4 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-sm rounded-xl transition-all"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 flex items-center justify-center gap-2 px-5 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-primary-100 transition-all hover:shadow-xl disabled:opacity-75 active:scale-95"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Registrando...
                                    </>
                                ) : (
                                    <>
                                        Guardar y Continuar
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}

                {/* Step 3: Éxito */}
                {step === 3 && (
                    <div className="p-6 sm:p-8 space-y-6 text-center animate-in fade-in slide-in-from-right-3 duration-300">
                        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                            <CheckCircle2 className="w-9 h-9" />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">¡Todo listo para empezar!</h2>
                            <p className="text-sm text-slate-500 leading-relaxed font-medium max-w-sm mx-auto">
                                Tu mascota se ha registrado correctamente y su carnet digital está habilitado.
                            </p>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left space-y-2">
                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                <Compass className="w-4 h-4 text-primary-500" /> ¿Cómo descubrir locales y veterinarias?
                            </h4>
                            <p className="text-xs text-slate-550 leading-relaxed">
                                Presiona el botón de abajo para ir a la sección **Descubrir**. Allí podrás:
                            </p>
                            <ul className="text-xs text-slate-550 space-y-1 pl-4 list-disc font-medium">
                                <li>Filtrar por tipo de servicio (consultas, vacunas, estética, etc.).</li>
                                <li>Visualizar en el mapa los locales más cercanos a tu ubicación.</li>
                                <li>Comparar precios de tarifarios y leer opiniones de otros dueños de mascotas.</li>
                            </ul>
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={() => {
                                    setIsOpen(false)
                                    localStorage.removeItem('brofy_onboarding_active')
                                    router.push('/dashboard/discover')
                                    router.refresh()
                                }}
                                className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-primary-100 transition-all hover:shadow-xl active:scale-95"
                            >
                                Descubrir Locales
                                <Compass className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
