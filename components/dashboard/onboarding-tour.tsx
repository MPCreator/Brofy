'use client'

import { useState, useEffect } from 'react'
import { 
    X, ChevronRight, ChevronLeft, Sparkles, KeyRound, Tag, 
    PawPrint, AlertCircle, Building2, Users, FileText, DollarSign 
} from 'lucide-react'

export interface OnboardingTourProps {
    role: string
    userId: string
    needsOnboarding?: boolean
}

export function OnboardingTour({ role, userId, needsOnboarding = false }: OnboardingTourProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [step, setStep] = useState(0)
    const [isOnboardingActive, setIsOnboardingActive] = useState(false)

    const isVet = role === 'vet' || role === 'provider'

    useEffect(() => {
        const active = localStorage.getItem('brofy_onboarding_active') === 'true' || needsOnboarding
        setIsOnboardingActive(active)
        if (active) {
            setIsOpen(false)
            return
        }
        const key = `brofy_onboarding_shown_${userId}_${role}`
        const hasShown = localStorage.getItem(key)
        if (!hasShown) {
            setIsOpen(true)
        }
    }, [role, userId, needsOnboarding])

    const handleClose = () => {
        localStorage.setItem(`brofy_onboarding_shown_${userId}_${role}`, 'true')
        setIsOpen(false)
    }

    if (needsOnboarding || isOnboardingActive) return null

    // Client Steps (4 Steps)
    const clientSteps = [
        {
            title: '¡Bienvenido a Brofy! 🐾',
            subtitle: 'El ecosistema digital de tu mascota',
            description: 'Conectamos a dueños de mascotas con las mejores veterinarias, spas y paseadores autorizados del Perú. Todo tu historial de atención y carnet digital en la palma de tu mano.',
            icon: Sparkles,
            gradient: 'from-cyan-500 to-primary-600',
            glowColor: 'bg-white/20 text-white border-white/20'
        },
        {
            title: 'Registra a tu Mascota 🐕',
            subtitle: 'Habilita su carnet digital de salud',
            description: 'Registra el nombre, especie, raza y peso de tu engreído. Así creas su Ficha Médica Única donde cualquier veterinario autorizado podrá leer sus antecedentes clínicos en segundos.',
            icon: PawPrint,
            gradient: 'from-purple-500 to-indigo-600',
            glowColor: 'bg-white/20 text-white border-white/20'
        },
        {
            title: 'Agenda y Valida tu Cita 🔑',
            subtitle: 'El código de verificación al llegar',
            description: 'Reserva tus citas pagando la comisión de plataforma. En tu panel aparecerá un código de verificación de 6 dígitos. Muéstraselo al especialista al llegar para iniciar la atención de forma oficial.',
            icon: KeyRound,
            gradient: 'from-amber-500 to-orange-600',
            glowColor: 'bg-white/20 text-white border-white/20'
        },
        {
            title: 'Gestión ante Imprevistos ⚠️',
            subtitle: 'Reprogramación y Reclamos por inasistencia',
            description: '¿Tuviste un imprevisto? Reprograma gratis negociando el nuevo horario con tu especialista. Si el local no te atiende en la fecha, inicia un Reclamo por inasistencia para recuperar tu comisión.',
            icon: AlertCircle,
            gradient: 'from-emerald-500 to-teal-600',
            glowColor: 'bg-white/20 text-white border-white/20'
        }
    ]

    // Vet/Provider Steps (6 Steps)
    const providerSteps = [
        {
            title: '¡Bienvenido Socio Brofy! Store 🩺',
            subtitle: 'El centro operativo para tu negocio',
            description: 'Administra tus reservas, digitaliza historiales clínicos, ingresa clientes rápidos y controla tus finanzas de forma centralizada en una sola interfaz profesional.',
            icon: Sparkles,
            gradient: 'from-cyan-500 to-primary-600',
            glowColor: 'bg-white/20 text-white border-white/20'
        },
        {
            title: 'Configura tu Local y Tarifarios 🏪',
            subtitle: 'Edición de precios y alertas automáticas',
            description: 'Registra tus sedes, horarios y edita tus precios con total libertad. Si cambias el precio de un servicio, los clientes con citas activas recibirán alertas automáticas para aceptar o reprogramar.',
            icon: Building2,
            gradient: 'from-purple-500 to-indigo-600',
            glowColor: 'bg-white/20 text-white border-white/20'
        },
        {
            title: 'Gestión de Personal 👥',
            subtitle: 'Agrega colaboradores a tu Staff',
            description: 'Registra y administra a tus veterinarios y asistentes de atención. Asigna roles y permite que atiendan de forma simultánea configurando la capacidad de atención en paralelo del local.',
            icon: Users,
            gradient: 'from-blue-500 to-sky-600',
            glowColor: 'bg-white/20 text-white border-white/20'
        },
        {
            title: 'El Código de Verificación 🔑',
            subtitle: 'Inicio seguro de atenciones',
            description: 'Al recibir al cliente, pídele su código de verificación de 6 dígitos. Ingrésalo en tu panel para verificar la cita e iniciar la atención oficial correspondiente.',
            icon: KeyRound,
            gradient: 'from-amber-500 to-orange-600',
            glowColor: 'bg-white/20 text-white border-white/20'
        },
        {
            title: 'Historial Clínico Digital 📋',
            subtitle: 'Carnet digital del paciente y recetas',
            description: 'Registra síntomas, diagnóstico, peso, temperatura y medicamentos. Todo se organiza automáticamente en el Carnet digital del dueño. ¡Puedes modificar la ficha durante las primeras 24 horas antes del cierre definitivo desde la sección Atenciones Recientes!',
            icon: FileText,
            gradient: 'from-teal-500 to-emerald-600',
            glowColor: 'bg-white/20 text-white border-white/20'
        },
        {
            title: 'Gestión Financiera y Reclamos 💵',
            subtitle: 'Flujo de ingresos, comisiones y reclamos',
            description: 'Revisa tu balance de ingresos, comisiones y gastos. Las fichas rápidas y registros manuales generan una comisión de S/ 6.00 que se acumula en Finanzas y debes liquidar a fin de mes para evitar penalizaciones o la suspensión de tu cuenta.',
            icon: DollarSign,
            gradient: 'from-pink-500 to-rose-600',
            glowColor: 'bg-white/20 text-white border-white/20'
        }
    ]

    const activeSteps = isVet ? providerSteps : clientSteps
    const currentStep = activeSteps[step]
    const IconComponent = currentStep.icon

    if (!isOpen) {
        return (
            <button
                onClick={() => { setStep(0); setIsOpen(true); }}
                className="fixed bottom-20 right-4 lg:bottom-4 lg:right-4 z-40 flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-650 rounded-full text-xs font-bold shadow-md hover:bg-slate-50 hover:text-primary-650 transition-all cursor-pointer animate-in fade-in"
            >
                💡 Guía Rápida
            </button>
        )
    }

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 max-w-sm w-full overflow-hidden flex flex-col justify-between animate-in zoom-in-95 relative">
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-5 right-5 z-10 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Top Visual Gradient Header */}
                <div className={`p-8 pb-6 flex flex-col items-center justify-center text-center bg-gradient-to-br ${currentStep.gradient} text-white relative transition-all duration-500`}>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                    
                    {/* Branded Glowing Icon Container */}
                    <div className={`w-14 h-14 ${currentStep.glowColor} backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 shadow-lg transition-all`}>
                        <IconComponent className="w-7 h-7" />
                    </div>

                    <span className="text-[9px] font-extrabold uppercase tracking-widest bg-black/10 px-2.5 py-1 rounded-full mb-1">
                        Paso {step + 1} de {activeSteps.length}
                    </span>
                    <h3 className="font-extrabold text-lg tracking-tight leading-tight">{currentStep.title}</h3>
                </div>

                {/* Content Container */}
                <div className="p-6 md:p-8 space-y-3.5 text-center bg-white">
                    <h4 className="font-bold text-xs text-primary-600 tracking-wide uppercase">{currentStep.subtitle}</h4>
                    <p className="text-slate-600 text-xs leading-relaxed tracking-normal font-medium max-w-[280px] mx-auto">
                        {currentStep.description}
                    </p>
                </div>

                {/* Bottom Navigation */}
                <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
                    {/* Dots indicator */}
                    <div className="flex gap-1.5 pl-2">
                        {activeSteps.map((_, i) => (
                            <span
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                    i === step ? 'w-4 bg-primary-600' : 'w-1.5 bg-slate-300'
                                }`}
                            />
                        ))}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                        {step > 0 && (
                            <button
                                onClick={() => setStep(prev => prev - 1)}
                                className="p-2 border border-slate-200 text-slate-500 rounded-xl hover:bg-white hover:text-slate-800 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                        )}
                        {step < activeSteps.length - 1 ? (
                            <button
                                onClick={() => setStep(prev => prev + 1)}
                                className="flex items-center gap-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-primary-500/10"
                            >
                                Siguiente <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        ) : (
                            <button
                                onClick={handleClose}
                                className="flex items-center gap-1 px-4.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/10 animate-bounce"
                            >
                                ¡Entendido! 🐾
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
