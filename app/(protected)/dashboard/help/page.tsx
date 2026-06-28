'use client'

import { useState, useEffect } from 'react'
import { getProfile } from '@/lib/actions'
import { 
    BookOpen, KeyRound, Tag, DollarSign, Sparkles, Award, Zap, HelpCircle, 
    ArrowRight, RefreshCw, GraduationCap, Megaphone, CheckCircle2, ChevronDown, ChevronUp, Clock
} from 'lucide-react'
import { toast } from 'sonner'
import { LoadingState } from '@/components/ui/loading-state'

export default function HelpPage() {
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'guides' | 'updates'>('guides')
    const [expandedGuide, setExpandedGuide] = useState<number | null>(0)

    useEffect(() => {
        async function loadProfile() {
            try {
                const data = await getProfile()
                setProfile(data)
            } catch {
                toast.error('Error al cargar perfil')
            } finally {
                setLoading(false)
            }
        }
        loadProfile()
    }, [])

    const isVet = profile?.role === 'vet' || profile?.role === 'provider'

    const handleRestartTour = () => {
        if (!profile?.role || !profile?.id) return
        localStorage.removeItem(`brofy_onboarding_shown_${profile.id}_${profile.role}`)
        toast.success('¡Tour guiado reiniciado! Recargando panel...')
        setTimeout(() => {
            window.location.reload()
        }, 1000)
    }

    const providerGuides = [
        {
            title: '1. Validación de Citas con Código de Verificación 🔑',
            subtitle: 'El corazón de la atención y la seguridad digital',
            icon: KeyRound,
            content: `El Código de verificación de 6 dígitos provisto por el cliente al llegar a tu local es fundamental por tres razones:
            
• Validación del Inicio de Atención: Al ingresar este código en la sección "Atención", el sistema registrará el inicio de la consulta y abrirá la ficha correspondiente para registrar la nueva atención.
• Prevención de Desintermediación: Brofy valida la asistencia al local garantizando que las atenciones se efectúen dentro del marco de la plataforma.
• Registro del No-Show: Si el cliente no asiste y la cita expira, la plataforma permite registrar la disputa para el arbitraje de la comisión de reserva.`
        },
        {
            title: '2. Gestión de Tarifario Maestro y Cambios de Precios 📋',
            subtitle: 'Libertad comercial completa con transparencia obligatoria',
            icon: Tag,
            content: `En Brofy tienes absoluta libertad e independencia comercial para definir y actualizar las tarifas de tus servicios cuando lo desees en la sección "Servicios":

• Precio Libre: Brofy no impone precios. Al actualizar un servicio, el cambio se refleja inmediatamente en tu perfil público para nuevas reservas.
• Reservas Existentes e Inmutabilidad: Las citas ya programadas conservan la tarifa original seleccionada por el cliente al reservar.
• Alerta y Consentimiento de Tarifas: Si modificas la tarifa, el sistema alertará automáticamente en el panel del cliente que tiene reservas pendientes de ese servicio, permitiéndole aceptar el cambio de precio de forma voluntaria, o cancelar sin costo alguno con devolución del 100% de su reserva a su Billetera de Huellitas.`
        },
        {
            title: '3. Ficha Rápida y Agendamiento Manual de Turnos ⚡',
            subtitle: 'Atención presencial a clientes sin cita previa o sin cuenta digital',
            icon: Zap,
            content: `Si un cliente acude a tu establecimiento de forma directa (Atención Presencial) y no cuenta con una reserva digital en la Plataforma, dispones de dos herramientas:

• Ficha Rápida Directa: Registra de inmediato la atención clínica o estética junto con el diagnóstico y receta en un solo paso. Al guardar, el historial clínico se crea al instante.
• Edición de Fichas (Límite de 24h): Tras guardar cualquier ficha médica (ya sea rápida o desde una cita normal), dispones de 24 horas para editarla o completarla antes de su cierre definitivo. Puedes acceder a estas fichas editables en la sección "Atenciones Recientes Modificables" de tu panel principal.
• Agendar Turno Manual (Crear Turno): Si deseas programar al paciente presencial en tu agenda o colocarlo en tu Sala de Espera para atenderlo más tarde, usa "+ Agendar Turno" al lado de tu agenda. Esto reservará y bloqueará el horario para evitar cruces en tu calendario.
• Iniciar Atención Directa (Sin OTP): Para citas creadas manualmente con "+ Agendar Turno", al dar clic en "Atender ahora" desde la Sala de Espera, el sistema no te solicitará código OTP. Mostrará un botón para iniciar la atención directamente y abrir la Ficha Rápida pre-completada.
• Notificaciones Gratuitas de Recetas: Es obligatorio ingresar el teléfono o el correo del cliente. Si ingresas su correo, el sistema le enviará un email gratuito con los detalles médicos e invitación a registrarse. Si ingresas su teléfono, al finalizar podrás compartirle su receta por WhatsApp de forma gratuita mediante un enlace automático.
• Comisión por Ingreso Manual: El registro de atenciones presenciales sin cuenta digital (Caso B) genera una comisión administrativa de S/ 6.00 que se adiciona a tu "Deuda con Brofy" al completarse la atención. Puedes liquidar este saldo periódicamente en la sección "Finanzas", y deberás pagarlo al finalizar cada mes para evitar penalizaciones o restricciones en tu cuenta.`
        },
        {
            title: '4. Finanzas e Historial de Ingresos 📈',
            subtitle: 'Control total de tu facturación y comisiones Brofy',
            icon: DollarSign,
            content: `El módulo de "Finanzas" es tu centro contable completo:

• Registro de Transacciones: Consulta de manera detallada todos tus ingresos de atenciones validadas, así como egresos registrados manualmente.
• Monitoreo de Deuda Brofy: Control en tiempo real del saldo pendiente por concepto de comisiones de Ficha Rápida y citas intermediadas.
• Pagos Seguros: Enlaces directos a pasarelas autorizadas (como Izipay) para liquidar saldos de forma protegida.`
        },
        {
            title: '5. Instalar Brofy como Aplicación en tu Celular o PC 📱',
            subtitle: 'Acceso instantáneo de tipo PWA en tu pantalla de inicio',
            icon: Sparkles,
            content: `Brofy es compatible con Progressive Web App (PWA), lo que te permite instalarla directamente en tus dispositivos sin pasar por App Store o Play Store:

• En tu celular Android (Chrome): Presiona los tres puntos arriba a la derecha y selecciona "Instalar aplicación".
• En tu iPhone/iPad (Safari): Presiona el botón "Compartir" (el cuadrado con la flecha hacia arriba) y selecciona "Añadir a la pantalla de inicio".
• En tu Computadora (Chrome/Edge): Haz clic en el ícono de monitor con flecha ("Instalar") a la derecha de la barra de direcciones de tu navegador.
• Ventaja: Se abrirá en pantalla completa y con un acceso directo en tu escritorio/dock, optimizando el uso diario del local.`
        },
        {
            title: '6. Registro de Especialistas y Responsabilidad de CMVP 🩺',
            subtitle: 'Cómo agregar personal médico y delegar firmas',
            icon: Award,
            content: `Si en tu sede atienden múltiples veterinarios u otros especialistas, puedes gestionarlos en la sección "Mi Local":

• Registro del Staff: Agrega a cada profesional indicando su nombre completo y número de colegiatura (CMVP).
• Selección en Ficha Médica: Al rellenar una Ficha Rápida o completar una atención, tendrás un selector para indicar qué veterinario realizó la consulta.
• Firma e Historial Digital: La ficha clínica y carnet de vacunas de la mascota se guardarán de forma inmutable con el nombre y colegiatura del doctor seleccionado, garantizando la trazabilidad.
• Declaración Legal: El establecimiento asume la total responsabilidad ética y legal de verificar la vigencia de las colegiaturas de su personal, liberando a Brofy de responsabilidad por falsedad de datos.`
        },
        {
            title: '7. Horarios por Servicio y Feriados 📅',
            subtitle: 'Horarios personalizados y bloqueo de reservas en días festivos',
            icon: Clock,
            content: `Brofy te permite un control total del calendario operativo de tu negocio:

• Herencia de Horarios: Por defecto, todos tus servicios heredan las horas de apertura de tu local.
• Horario Personalizado: Si un servicio tiene horas reducidas (por ejemplo, baño de mascotas solo hasta mediodía), puedes desmarcar el checkbox "Heredar horario" y definir su rango de horas y días operativos individualmente.
• Feriados y Días de Cierre: En "Mi Local" puedes bloquear fechas específicas de feriados o cierres. Los clientes no podrán agendar citas normales en esos días.
• Excepción en Servicios: En cada servicio puedes activar la opción "¿Atiende feriados?", permitiendo que ese servicio específico sí reciba reservas en las fechas bloqueadas por el local.`
        }
    ]

    const clientGuides = [
        {
            title: '1. Reservas de Citas y Acceso Digital 📅',
            subtitle: 'Cómo agendar tu servicio en 3 pasos',
            icon: BookOpen,
            content: `Agendar tus citas en Brofy es sumamente sencillo:
            
• Explora Locales: Utiliza el mapa interactivo en la sección "Descubrir" para encontrar veterinarias, spas, paseadores u hoteles cercanos.
• Elige y Compara Precios: Revisa el tarifario oficial publicado por el local, incluyendo la fecha de la última actualización de precios.
• Cargo por Infraestructura: Al confirmar tu agenda, abonarás S/ 5.00 a la plataforma por uso de infraestructura e intermediación digital. Recibirás tu Código de verificación al instante.`
        },
        {
            title: '2. El Código de verificación y Ficha Digital 🔑',
            subtitle: 'Tu llave de acceso al llegar al local',
            icon: KeyRound,
            content: `Tras agendar y realizar el pago digital, se genera un código de verificación único en tu panel de "Citas Activas":

• Al llegar al local: Dicta este código de 6 dígitos al especialista. Él lo ingresará para validar tu cita y registrar el inicio de la atención de tu mascota.
• Carnet de Vacunas Digitalizado: La información, diagnósticos o indicaciones médicas registradas por el especialista quedarán guardadas permanentemente en tu cuenta, sin riesgo de pérdida de libretas físicas.`
        },
        {
            title: '3. Programa de Fidelización Huellitas 🐾',
            subtitle: 'Tu billetera de puntos de lealtad y devoluciones',
            icon: Award,
            content: `Brofy recompensa tu lealtad y maneja tus devoluciones mediante la billetera de puntos **Huellitas**:

• Equivalencia de Valor: 100 Huellitas equivalen exactamente a S/ 1.00 (de esta forma, una comisión de S/ 5.00 devuelta representa 500 Huellitas).
• Acumulación Directa: Las Huellitas se abonan al instante en tu cuenta tras resolverse disputas de inasistencia a tu favor.
• Reservas Gratis: Utiliza tu saldo de Huellitas para pagar el cargo de infraestructura de tus siguientes reservas, ¡totalmente gratis!`
        },
        {
            title: '4. Modificaciones de Tarifas y Consentimiento ⚖',
            subtitle: 'Tus derechos ante alza de tarifas',
            icon: Tag,
            content: `Los establecimientos son libres de modificar sus precios en su tarifario. Sin embargo, respetamos tu decisión:

• Alerta Tarifaria: Si el local aumenta el precio de un servicio que ya habías reservado, se activará un banner en tu sección de "Citas Activas" notificándote la diferencia.
• Aceptar Nueva Tarifa: Puedes consentir el cambio y continuar con tu cita pactada al nuevo precio.
• Cancelar con Reembolso: Si no estás de acuerdo con el alza, podrás presionar "Cancelar con Reembolso". Se cancelará la cita a coste cero y te devolveremos el 100% de tu comisión de reserva (500 Huellitas) de forma inmediata a tu cuenta.`
        },
        {
            title: '5. Cómo Instalar Brofy en tu Pantalla de Inicio 📱',
            subtitle: 'Lleva la salud de tu mascota a un toque de distancia',
            icon: Sparkles,
            content: `Puedes tener Brofy anclado directamente en la pantalla de inicio de tu celular o computadora como si fuera una app nativa:

• En Android (Google Chrome): Entra a Brofy, toca los tres puntos verticales de arriba a la derecha y pulsa en "Instalar aplicación".
• En iOS/iPhone (Safari): Abre Brofy, presiona el botón "Compartir" al centro abajo en tu navegador y selecciona "Añadir a la pantalla de inicio".
• En Windows/Mac (Chrome/Edge/Brave): Haz clic en el ícono de instalación (icono de computadora con flecha o "+") en la barra de direcciones superior.
• Beneficio: Accede al instante a tu Billetera de Huellitas, carnet digital e inicio de atención rápido sin escribir la dirección web.`
        },
        {
            title: '6. Gestión de Feriados y Bloqueos de Citas 📅',
            subtitle: 'Reserva segura en fechas festivas o no laborables',
            icon: Clock,
            content: `Para evitar malentendidos e inasistencias por cierres del local, Brofy cuenta con un control de feriados:

• Bloqueo Inteligente: Cuando un local registra un día feriado o de descanso, el calendario de reserva desactiva automáticamente esa fecha para evitar citas.
• Servicios con Guardia: Algunos servicios especiales (como emergencias 24h u hospedajes) pueden marcarse como disponibles en feriados. Si es el caso, el sistema te permitirá seleccionarlos y agendarlos normalmente en esa fecha.`
        },
        {
            title: '7. Especialista Tratante Registrado 🩺',
            subtitle: 'Transparencia total sobre quién atiende a tu mascota',
            icon: Award,
            content: `Aunque reserves tu cita para la veterinaria o clínica en general, tienes completa seguridad sobre qué profesional atendió a tu mascota:

• Registro Virtual de Firma: Al realizarse la consulta, el veterinario a cargo selecciona al especialista que efectuó la atención.
• Trazabilidad en el Carnet: El diagnóstico, vacunas y recetas del carnet digital de tu mascota mostrarán permanentemente el nombre y número CMVP del médico tratante responsable.
• Seguridad y Garantía: Podrás verificar en todo momento el profesional a cargo para tus controles o consultas de seguimiento.`
        }
    ]

    const updates = [
        {
            tag: 'NUEVO',
            date: '29 de mayo, 2026',
            title: '¡Soporte Completo de PWA (Instalar como App) en todos tus dispositivos! 📱✨',
            description: '¡Brofy ahora es una PWA! Ya puedes instalar Brofy directamente en tu pantalla de inicio en smartphones Android y Apple (iOS), así como en computadoras Windows y Mac (añadiéndola al Dock o escritorio), permitiéndote abrir la plataforma a pantalla completa con acceso ultra rápido y un diseño completamente responsivo.'
        },
        {
            tag: 'NUEVO',
            date: '28 de mayo, 2026',
            title: '¡Mecanismo de Consentimiento y Devolución por Cambio de Precios! ⚖️',
            description: 'Hemos añadido protección de tarifas para los clientes. Si un local actualiza el precio de un servicio previamente agendado, el cliente recibirá una alerta para decidir si acepta el nuevo precio o cancela con reembolso instantáneo de su comisión a su Billetera de Huellitas.'
        },
        {
            tag: 'ACTUALIZACIÓN',
            date: '28 de mayo, 2026',
            title: 'Centro de Capacitación y Ayuda Interactivo 📚',
            description: 'Estrenamos esta nueva sección dedicada a capacitar paso a paso tanto a los especialistas veterinarios/estéticos como a los dueños de mascotas para garantizar que le saques el máximo provecho a la plataforma sin perderte.'
        },
        {
            tag: 'NUEVO',
            date: '27 de mayo, 2026',
            title: 'Billetera Digital de Huellitas 🐾',
            description: 'Se introdujo el nuevo programa de lealtad y recompensas Huellitas. Las devoluciones de comisiones por disputas aprobadas se devuelven en forma de puntos (100 Huellitas = S/ 1.00) que sirven para reservar nuevas citas gratis.'
        },
        {
            tag: 'ACTUALIZACIÓN',
            date: '26 de mayo, 2026',
            title: 'Reprogramación Bidireccional de Horarios 📅',
            description: 'Tanto los clientes como los especialistas pueden proponer horarios alternativos (contrapropuestas) en caso de inconvenientes con la fecha pactada originalmente, todo coordinado desde el panel principal de forma ágil.'
        }
    ]

    const activeGuides = isVet ? providerGuides : clientGuides

    if (loading) {
        return <LoadingState message="Cargando centro de ayuda..." description="Obteniendo guías de aprendizaje y novedades" />;
    }

    return (
        <div className="space-y-6 pb-20 lg:pb-0 max-w-3xl mx-auto">
            {/* Page Header */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-850 text-white rounded-3xl p-6 md:p-8 shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                <div className="relative z-10 space-y-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-bold shadow-inner">
                        <GraduationCap className="w-4 h-4" /> Centro de Capacitación y Ayuda
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight">
                            {isVet ? 'Guías de Operación y Capacitación para Especialistas' : 'Centro de Ayuda y Preguntas para Clientes'}
                        </h1>
                        <p className="text-sm text-primary-100 max-w-xl">
                            {isVet 
                                ? 'Domina el sistema operativo Brofy: gestión de tarifas, validación con código de verificación, fichas rápidas y comisiones.' 
                                : 'Todo sobre tu cuenta Brofy, el carnet digital de tu mascota, la Billetera de Huellitas y cómo reservar citas.'
                            }
                        </p>
                    </div>

                    <div className="pt-2 flex flex-wrap gap-3">
                        <button
                            onClick={handleRestartTour}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-primary-800 rounded-xl text-xs font-black shadow-md hover:bg-slate-50 transition-all cursor-pointer"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-primary-600 animate-pulse" /> Reiniciar Tour Guiado
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('guides')}
                    className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-bold transition-all cursor-pointer ${
                        activeTab === 'guides'
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <BookOpen className="w-4 h-4" /> Módulos de Aprendizaje
                </button>
                <button
                    onClick={() => setActiveTab('updates')}
                    className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-bold transition-all cursor-pointer ${
                        activeTab === 'updates'
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <Megaphone className="w-4 h-4" /> Actualizaciones y Novedades
                </button>
            </div>

            {/* Guides Tab Content */}
            {activeTab === 'guides' && (
                <div className="space-y-4">
                    {activeGuides.map((guide, idx) => {
                        const isExpanded = expandedGuide === idx
                        const GuideIcon = guide.icon
                        return (
                            <div 
                                key={idx} 
                                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:border-primary-100"
                            >
                                <button
                                    onClick={() => setExpandedGuide(isExpanded ? null : idx)}
                                    className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0`}>
                                            <GuideIcon className="w-5 h-5 text-primary-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-extrabold text-slate-900 text-sm md:text-base">{guide.title}</h3>
                                            <p className="text-xs text-slate-500 mt-0.5">{guide.subtitle}</p>
                                        </div>
                                    </div>
                                    {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                                </button>

                                {isExpanded && (
                                    <div className="border-t border-slate-100 p-5 bg-slate-50/50 text-xs md:text-sm text-slate-650 leading-relaxed whitespace-pre-line font-medium">
                                        {guide.content}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Updates Tab Content */}
            {activeTab === 'updates' && (
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm border-b border-slate-100 pb-3">
                            <Megaphone className="w-4 h-4 text-primary-600" /> Tablón de Novedades Brofy
                        </div>
                        
                        <div className="space-y-6">
                            {updates.map((update, idx) => (
                                <div key={idx} className="flex gap-4 items-start relative pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                                    <div className="w-2.5 h-2.5 rounded-full bg-primary-550 shrink-0 mt-1.5 ring-4 ring-primary-50" />
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap items-center gap-2.5">
                                            <span className="text-[9px] font-extrabold tracking-wider bg-primary-100 text-primary-850 px-2 py-0.5 rounded-full uppercase">
                                                {update.tag}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-medium">
                                                {update.date}
                                            </span>
                                        </div>
                                        <h4 className="font-extrabold text-slate-900 text-sm md:text-base leading-tight">
                                            {update.title}
                                        </h4>
                                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                            {update.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
