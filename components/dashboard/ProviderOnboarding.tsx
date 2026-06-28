'use client'

import { useState, useEffect } from 'react'
import { createEstablishment, addService } from '@/lib/actions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { 
    Building2, Sparkles, ShieldCheck, FileText, CheckCircle2,
    Loader2, ArrowRight, ArrowLeft, Plus, DollarSign, Clock, Tag, ChevronRight, Check
} from 'lucide-react'

export function ProviderOnboarding({ 
    userRole, 
    initialEstablishmentId,
    initialNeedsOnboarding 
}: { 
    userRole: string, 
    initialEstablishmentId?: string,
    initialNeedsOnboarding: boolean
}) {
    const [isOpen, setIsOpen] = useState(initialNeedsOnboarding)
    const [step, setStep] = useState(initialEstablishmentId ? 3 : 1)
    const [isLoading, setIsLoading] = useState(false)
    const [establishmentId, setEstablishmentId] = useState<string | null>(initialEstablishmentId || null)
    const [animalTags, setAnimalTags] = useState<string[]>([])
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

    const handleCreateEst = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsLoading(true)

        const formData = new FormData(event.currentTarget)
        
        // Hardcode a default location (Lima / Miraflores coordinates) so they don't have to input them
        formData.set('latitude', '-12.1223')
        formData.set('longitude', '-77.0279')
        
        // Set type based on userRole
        formData.set('type', userRole === 'vet' ? 'clinic' : 'groomer')

        // Append animal tags to description
        const rawDesc = formData.get('description') as string || ''
        const cleanDesc = rawDesc.replace(/\[Atiende:\s*[^\]]+\]/, '').trim()
        const finalDesc = animalTags.length > 0 ? `${cleanDesc}\n[Atiende: ${animalTags.join(', ')}]` : cleanDesc
        formData.set('description', finalDesc)

        try {
            const result = await createEstablishment(formData)
            if (result && 'message' in result) {
                toast.error(result.message)
            } else if (result && 'errors' in result && result.errors) {
                const errorMsg = Object.values(result.errors).flat().join(', ')
                toast.error(errorMsg || 'Por favor, completa los campos obligatorios.')
            } else if (result && 'success' in result && result.success && result.establishmentId) {
                toast.success('¡Establecimiento registrado con éxito!')
                setEstablishmentId(result.establishmentId)
                setStep(3)
            } else {
                toast.error('Error al guardar el establecimiento.')
            }
        } catch (e) {
            toast.error('Error al procesar el registro.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateService = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!establishmentId) {
            toast.error('Error: Código de establecimiento no encontrado.')
            return
        }

        setIsLoading(true)
        const formData = new FormData(event.currentTarget)
        formData.set('establishmentId', establishmentId)

        try {
            const result = await addService(formData)
            if (result && 'message' in result) {
                toast.error(result.message)
            } else {
                toast.success('¡Servicio agregado con éxito!')
                setStep(4)
            }
        } catch (e) {
            toast.error('Error al agregar el servicio.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-slate-900 flex items-center justify-center p-4 overflow-y-auto">
            {/* Background design accents */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_45%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.12),transparent_40%)] pointer-events-none" />

            <div className="bg-white/95 backdrop-blur-md rounded-3xl w-full max-w-xl shadow-2xl border border-slate-100 overflow-hidden relative transition-all duration-300 my-8">
                {/* Step indicator */}
                <div className="px-6 pt-6 pb-3 border-b border-slate-100/80 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1.5">
                            <span className="text-xl">🐾</span>
                            <span className="text-sm font-black text-slate-800 tracking-tight">Brofy Socios</span>
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
                            style={{ width: `${((step - 1) / 3) * 100}%` }}
                        />

                        {[
                            { stepNum: 1, label: 'Inicio' },
                            { stepNum: 2, label: 'Local' },
                            { stepNum: 3, label: 'Servicio' },
                            { stepNum: 4, label: 'Listo' }
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
                                ¡Bienvenido Socio Brofy! <Sparkles className="w-6 h-6 text-primary-500 animate-pulse" />
                            </h2>
                            <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                Comencemos a configurar tu centro operativo para que puedas empezar a recibir citas y gestionar pacientes.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center shrink-0">
                                    <ShieldCheck className="w-5.5 h-5.5 text-primary-750" />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-sm font-bold text-slate-850">El Código de Verificación</h3>
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                        Es el corazón de la seguridad. Cuando un cliente asista a tu establecimiento, **debes pedirle su código de verificación de 6 dígitos**. Al ingresarlo en tu panel, se registrará el inicio de la atención y se validará la cita correspondiente.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                                    <Building2 className="w-5.5 h-5.5 text-amber-755" />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-sm font-bold text-slate-855">Configuración Inicial</h3>
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                        En los siguientes pasos registraremos tu local (establecimiento) y tu primera tarifa/servicio para habilitar tu perfil público en el buscador.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-lg">
                                    💵
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-sm font-bold text-slate-855">Ingresos Manuales y Comisión de Plataforma</h3>
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                        Las fichas rápidas y registros manuales (sin cita digital) generan una comisión de **S/ 6.00** por uso de plataforma. Esta se reflejará en tu panel de <strong>&quot;Finanzas&quot;</strong> y deberás pagarla al finalizar el mes para evitar penalizaciones o restricciones en tu cuenta.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={() => setStep(2)}
                                className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-primary-100 transition-all hover:shadow-xl active:scale-95"
                            >
                                Registrar mi Local
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Crear Establecimiento */}
                {step === 2 && (
                    <form onSubmit={handleCreateEst} className="p-6 sm:p-8 space-y-4 animate-in fade-in slide-in-from-right-3 duration-300">
                        <div className="space-y-1">
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Registra tu establecimiento</h2>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                Cuéntanos sobre tu local veterinario o servicio.
                            </p>
                        </div>

                        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Nombre del Local (Obligatorio)</label>
                                <input 
                                    required 
                                    name="name" 
                                    type="text" 
                                    placeholder="Ej. Veterinaria San Martín, Pet Spa & Grooming" 
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium" 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Teléfono de contacto (Opcional)</label>
                                    <input 
                                        name="phone" 
                                        type="tel" 
                                        placeholder="Ej. 987654321" 
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Distrito (Lima) (Obligatorio)</label>
                                    <input 
                                        required
                                        name="district" 
                                        type="text" 
                                        placeholder="Ej. Miraflores, Surco" 
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium" 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Dirección Completa (Obligatorio)</label>
                                <input 
                                    required 
                                    name="address" 
                                    type="text" 
                                    placeholder="Ej. Av. Larco 123" 
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium" 
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Breve Descripción (Opcional)</label>
                                <textarea 
                                    name="description" 
                                    rows={2}
                                    placeholder="Ej. Especialistas en medicina general, cirugías menores y pet grooming..." 
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium resize-none" 
                                />
                            </div>

                            {/* Animal Tag Selector */}
                            <div className="space-y-2 pt-1.5">
                                <label className="block text-xs font-bold text-slate-700 mb-1">🐾 Animales que atiendes (Opcional)</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {['Perros', 'Gatos', 'Aves', 'Conejos', 'Hámsters', 'Reptiles', 'Peces'].map(animal => {
                                        const isSelected = animalTags.includes(animal)
                                        return (
                                            <button
                                                type="button"
                                                key={animal}
                                                onClick={() => {
                                                    setAnimalTags(prev =>
                                                        prev.includes(animal) ? prev.filter(a => a !== animal) : [...prev, animal]
                                                    )
                                                }}
                                                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                                                    isSelected
                                                        ? 'bg-primary-600 text-white shadow-sm'
                                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                            >
                                                {animal}
                                            </button>
                                        )
                                    })}
                                </div>
                                
                                <div className="flex items-center gap-2 pt-0.5">
                                    <input
                                        type="text"
                                        id="new-onboarding-animal-tag"
                                        placeholder="Otros animales (ej. Loros)"
                                        className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                const input = e.currentTarget;
                                                const val = input.value.trim();
                                                if (val && !animalTags.includes(val)) {
                                                    setAnimalTags(prev => [...prev, val]);
                                                    input.value = '';
                                                }
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const input = document.getElementById('new-onboarding-animal-tag') as HTMLInputElement
                                            if (input && input.value.trim()) {
                                                const val = input.value.trim()
                                                if (!animalTags.includes(val)) {
                                                    setAnimalTags(prev => [...prev, val])
                                                    input.value = ''
                                                }
                                            }
                                        }}
                                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all"
                                    >
                                        +
                                    </button>
                                </div>

                                {animalTags.filter(a => !['Perros', 'Gatos', 'Aves', 'Conejos', 'Hámsters', 'Reptiles', 'Peces'].includes(a)).length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                        {animalTags.filter(a => !['Perros', 'Gatos', 'Aves', 'Conejos', 'Hámsters', 'Reptiles', 'Peces'].includes(a)).map(animal => (
                                            <span key={animal} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-primary-50 text-primary-750 border border-primary-100/50">
                                                {animal}
                                                <button
                                                    type="button"
                                                    onClick={() => setAnimalTags(prev => prev.filter(a => a !== animal))}
                                                    className="text-primary-500 hover:text-primary-700 font-extrabold focus:outline-none"
                                                >
                                                    &times;
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-3">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="px-5 py-3 border border-slate-200 text-slate-650 hover:bg-slate-50 font-bold text-sm rounded-xl transition-all"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-primary-100 transition-all hover:shadow-xl disabled:opacity-75 active:scale-95"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Registrando...
                                    </>
                                ) : (
                                    <>
                                        Registrar Establecimiento
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}

                {/* Step 3: Registrar Tarifario */}
                {step === 3 && (
                    <form onSubmit={handleCreateService} className="p-6 sm:p-8 space-y-4 animate-in fade-in slide-in-from-right-3 duration-300">
                        <div className="space-y-1">
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Crea tu primer servicio</h2>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                Para aparecer en las búsquedas, ingresa al menos un servicio con su tarifa.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Nombre del Servicio (Obligatorio)</label>
                                <input 
                                    required 
                                    name="name" 
                                    type="text" 
                                    placeholder="Ej. Consulta Veterinaria, Baño y Corte de Pelo" 
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium" 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Precio (S/) (Obligatorio)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                                            S/
                                        </div>
                                        <input 
                                            required 
                                            name="price" 
                                            type="number" 
                                            step="0.01" 
                                            min="0"
                                            placeholder="0.00" 
                                            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium" 
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Duración (minutos) (Obligatorio)</label>
                                    <select 
                                        name="duration" 
                                        defaultValue="30"
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                                    >
                                        <option value="15">15 minutos</option>
                                        <option value="30">30 minutos</option>
                                        <option value="45">45 minutos</option>
                                        <option value="60">60 minutos (1 hora)</option>
                                        <option value="90">90 minutos</option>
                                        <option value="120">120 minutos (2 horas)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Categoría de servicio (Obligatorio)</label>
                                <select 
                                    name="category" 
                                    defaultValue="consultation"
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                                >
                                    <option value="consultation">Consulta Médica</option>
                                    <option value="vaccination">Vacunación</option>
                                    <option value="grooming">Estética / Grooming</option>
                                    <option value="bath">Baño</option>
                                    <option value="surgery">Cirugía</option>
                                    <option value="deworming">Desparasitación</option>
                                    <option value="test">Exámenes Clínicos</option>
                                    <option value="walk">Paseo / Ejercicio</option>
                                    <option value="general">Otro / General</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-3">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-primary-100 transition-all hover:shadow-xl disabled:opacity-75 active:scale-95"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Registrando Servicio...
                                    </>
                                ) : (
                                    <>
                                        Guardar Servicio y Finalizar
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}

                {/* Step 4: Finalización */}
                {step === 4 && (
                    <div className="p-6 sm:p-8 space-y-6 text-center animate-in fade-in slide-in-from-right-3 duration-300">
                        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                            <CheckCircle2 className="w-9 h-9" />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">¡Configuración Completada!</h2>
                            <p className="text-sm text-slate-500 leading-relaxed font-medium max-w-sm mx-auto">
                                Tu establecimiento y tu primera tarifa se han registrado satisfactoriamente.
                            </p>
                        </div>

                        <div className="bg-primary-50 border border-primary-100 rounded-2xl p-4 text-left space-y-2 text-primary-950">
                            <h4 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4 text-primary-600 animate-pulse" /> Información Importante
                            </h4>
                            <p className="text-xs leading-relaxed font-medium">
                                Recuerda que no es necesario que todo sea definitivo ahora. En tu panel de control **podrás modificar todos los datos en cualquier momento**:
                            </p>
                            <ul className="text-xs space-y-1 pl-4 list-disc font-semibold">
                                <li>Añadir imágenes de tu local y subir tu logotipo.</li>
                                <li>Cambiar precios de los servicios existentes o agregar nuevos servicios al tarifario.</li>
                                <li>Configurar tus horarios de atención semanales y registrar feriados de cierre.</li>
                                <li>Registrar asistentes de staff o colaboradores médicos.</li>
                            </ul>
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={() => {
                                    setIsOpen(false)
                                    localStorage.removeItem('brofy_onboarding_active')
                                    router.push('/dashboard/vet')
                                    router.refresh()
                                }}
                                className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-primary-100 transition-all hover:shadow-xl active:scale-95"
                            >
                                Ir a mi Panel de Control
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
