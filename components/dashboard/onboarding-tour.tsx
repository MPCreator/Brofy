'use client'

import { useState, useEffect } from 'react'
import { X, ChevronRight, ChevronLeft, Sparkles, KeyRound, Award, Tag } from 'lucide-react'

export interface OnboardingTourProps {
    role: string
}

export function OnboardingTour({ role }: OnboardingTourProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [step, setStep] = useState(0)

    const isVet = role === 'vet' || role === 'provider'

    useEffect(() => {
        const key = `brofy_onboarding_shown_${role}`
        const hasShown = localStorage.getItem(key)
        if (!hasShown) {
            setIsOpen(true)
        }
    }, [role])

    const handleClose = () => {
        localStorage.setItem(`brofy_onboarding_shown_${role}`, 'true')
        setIsOpen(false)
    }

    // High-impact, highly summarized 3 steps for Clients
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
            title: 'Tu Código de Atención (OTP) 🔑',
            subtitle: 'Tu llave de acceso al llegar al local',
            description: 'Al reservar, recibirás un código de 6 dígitos en tu panel. Dictáselo al especialista al llegar para verificar tu reserva, iniciar el servicio y guardar tus recetas de forma segura.',
            icon: KeyRound,
            gradient: 'from-amber-500 to-orange-600',
            glowColor: 'bg-white/20 text-white border-white/20'
        },
        {
            title: 'Control de Precios y Reembolsos ⚖️',
            subtitle: 'Consentimiento garantizado en tu tarifa',
            description: 'Si un local incrementa sus precios de una cita que ya reservaste, te avisaremos al instante. Podrás aceptar la nueva tarifa o cancelar recibiendo el 100% de reembolso a tu Billetera de Huellitas.',
            icon: Award,
            gradient: 'from-emerald-500 to-teal-600',
            glowColor: 'bg-white/20 text-white border-white/20'
        }
    ]

    // High-impact, highly summarized 3 steps for Providers/Vets
    const providerSteps = [
        {
            title: '¡Bienvenido Socio Brofy! 🏪🩺',
            subtitle: 'El centro operativo para tu negocio',
            description: 'Administra tus reservas, digitaliza historiales clínicos, ingresa clientes rápidos y controla tus finanzas de forma centralizada en una sola interfaz profesional.',
            icon: Sparkles,
            gradient: 'from-cyan-500 to-primary-600',
            glowColor: 'bg-white/20 text-white border-white/20'
        },
        {
            title: 'Valida Citas con el Código OTP 🔑',
            subtitle: 'El corazón de la seguridad e historial',
            description: 'Cuando el cliente llegue, pídele su Código de Atención de 6 dígitos. Ingrésalo en tu panel para desbloquear su historial clínico, iniciar la atención y registrar los detalles en segundos.',
            icon: KeyRound,
            gradient: 'from-amber-500 to-orange-600',
            glowColor: 'bg-white/20 text-white border-white/20'
        },
        {
            title: 'Tarifas Libres y Alertas de Cambio 📈',
            subtitle: 'Libertad de precios con total transparencia',
            description: 'Eres libre de actualizar tus precios cuando desees. Si lo haces, el sistema enviará alertas automáticamente a los clientes con citas activas de ese servicio para que las acepten o las cancelen con devolución.',
            icon: Tag,
            gradient: 'from-purple-500 to-indigo-600',
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
                className="fixed bottom-20 right-4 lg:bottom-4 lg:right-4 z-40 flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-full text-xs font-bold shadow-md hover:bg-slate-50 hover:text-primary-600 transition-all cursor-pointer animate-in fade-in"
            >
                💡 Guía Rápida
            </button>
        )
    }

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            {/* Premium Light-Themed Modal Card with Glowing Headers */}
            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 max-w-sm w-full overflow-hidden flex flex-col justify-between animate-in zoom-in-95 relative">
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-5 right-5 z-10 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Top Visual Gradient Header (Highly Colorful) */}
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

                {/* Content Container (High Contrast Light Theme) */}
                <div className="p-6 md:p-8 space-y-3.5 text-center bg-white">
                    <h4 className="font-bold text-xs text-primary-600 tracking-wide uppercase">{currentStep.subtitle}</h4>
                    <p className="text-slate-600 text-xs leading-relaxed tracking-normal font-medium max-w-[280px] mx-auto">
                        {currentStep.description}
                    </p>
                </div>

                {/* Bottom Navigation with contrasting light colors */}
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
