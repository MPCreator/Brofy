import {
    ArrowRight, MapPin, Search, Star, ShieldCheck, KeyRound,
    ClipboardList, Wallet, Stethoscope, Store, CalendarCheck,
    PawPrint, CreditCard, BookOpen
} from "lucide-react";
import Link from "next/link";

export default function Home() {
    return (
        <main className="min-h-screen flex flex-col bg-surface-50">
            {/* Header */}
            <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-primary-600 tracking-tight">Brofy</span>
                    </div>
                    <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
                        <a href="#como-funciona" className="hover:text-primary-600 transition-colors">¿Cómo funciona?</a>
                        <a href="#beneficios" className="hover:text-primary-600 transition-colors">Beneficios</a>
                        <a href="#soy-veterinario" className="hover:text-primary-600 transition-colors">Para Veterinarios</a>
                    </nav>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-primary-600">
                            Ingresar
                        </Link>
                        <Link href="/signup" className="bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-primary-700 transition-shadow shadow-md hover:shadow-lg">
                            Crear cuenta
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center gap-12">
                <div className="flex-1 space-y-8 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 text-sm font-medium">
                        <Star className="w-4 h-4 fill-primary-700" />
                        La nueva era del cuidado animal en Perú
                    </div>
                    <h1 className="text-4xl lg:text-6xl font-extrabold text-slate-900 tracking-tight text-balance leading-tight">
                        El ecosistema integral para <span className="text-primary-600">mascotas y veterinarias.</span>
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 text-balance">
                        Brofy conecta a dueños de mascotas con los mejores especialistas. Reserva citas, gestiona el historial médico de tu engreído y llega al veterinario con tu código de atención listo.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        <Link href="/signup" className="flex items-center justify-center gap-2 bg-primary-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                            <Search className="w-5 h-5" />
                            Explorar Servicios
                        </Link>
                        <Link href="#soy-veterinario" className="flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-full font-semibold text-lg hover:bg-slate-50 transition-all shadow-sm hover:shadow">
                            <Stethoscope className="w-5 h-5" />
                            Soy Especialista
                        </Link>
                    </div>
                </div>

                {/* Hero Visual */}
                <div className="flex-1 relative w-full max-w-lg aspect-square">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary-200 to-primary-50 rounded-[3rem] -rotate-6 transform shadow-xl" />
                    <div className="absolute inset-0 bg-white rounded-[2.5rem] shadow-2xl p-8 flex flex-col justify-center gap-4 overflow-hidden border border-slate-100">
                        {/* Paso 1 */}
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center shrink-0">
                                    <CalendarCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-sm">Reserva tu Cita</h3>
                                    <p className="text-xs text-slate-500">Elige veterinaria, servicio y horario</p>
                                </div>
                                <span className="ml-auto text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-full">S/ 5</span>
                            </div>
                        </div>
                        {/* Paso 2 */}
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                                    <KeyRound className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-sm">Recibe tu Código de Atención</h3>
                                    <p className="text-xs text-slate-500">Disponible en tu panel al instante</p>
                                </div>
                                <span className="ml-auto font-mono font-black text-amber-700 text-lg tracking-widest">7381</span>
                            </div>
                        </div>
                        {/* Paso 3 */}
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                                    <ClipboardList className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-sm">El Vet valida y atiende</h3>
                                    <p className="text-xs text-slate-500">Historial actualizado automáticamente</p>
                                </div>
                                <ShieldCheck className="ml-auto w-5 h-5 text-emerald-500" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section id="como-funciona" className="py-20 bg-white border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">¿Cómo funciona?</h2>
                        <p className="text-slate-600 text-lg">
                            Tres pasos simples para una atención veterinaria sin fricciones.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 relative">
                        {/* connector line on desktop */}
                        <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-primary-200 to-primary-200" />

                        <div className="relative text-center bg-surface-50 p-8 rounded-3xl border border-slate-100">
                            <div className="w-16 h-16 bg-primary-600 text-white rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg shadow-primary-200">
                                <CalendarCheck className="w-8 h-8" />
                            </div>
                            <div className="absolute -top-3 -right-3 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-black text-sm">1</div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Solicita tu Turno Digital</h3>
                            <p className="text-slate-600">Encuentra la veterinaria ideal, elige el servicio y el horario. Abona S/ 5 de acceso a plataforma para generar tu código de atención.</p>
                        </div>

                        <div className="relative text-center bg-surface-50 p-8 rounded-3xl border border-slate-100">
                            <div className="w-16 h-16 bg-amber-500 text-white rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg shadow-amber-200">
                                <KeyRound className="w-8 h-8" />
                            </div>
                            <div className="absolute -top-3 -right-3 w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-black text-sm">2</div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Tu Código de Atención</h3>
                            <p className="text-slate-600">Recibes un código único en tu panel. Al llegar, díselo al veterinario. Él lo ingresa para desbloquear tu ficha médica y comenzar la atención.</p>
                        </div>

                        <div className="relative text-center bg-surface-50 p-8 rounded-3xl border border-slate-100">
                            <div className="w-16 h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg shadow-emerald-200">
                                <PawPrint className="w-8 h-8" />
                            </div>
                            <div className="absolute -top-3 -right-3 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-black text-sm">3</div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Atención y Registro</h3>
                            <p className="text-slate-600">El veterinario completa la ficha. Diagnósticos, recetas y tratamientos quedan en el historial digital de tu mascota, siempre accesible.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits for pet owners */}
            <section id="beneficios" className="py-20 bg-surface-50 border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Beneficios para dueños de mascotas</h2>
                        <p className="text-slate-600 text-lg text-balance">
                            Todo lo que necesitas para cuidar de tu mejor amigo, accesible desde la palma de tu mano.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-3xl border border-slate-100 hover:border-primary-200 transition-colors hover:shadow-lg">
                            <div className="w-14 h-14 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mb-6">
                                <MapPin className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Encuentra Locales</h3>
                            <p className="text-slate-600">
                                Descubre veterinarias, spas y paseadores cerca de ti. Revisa perfiles, servicios y tarifas actualizadas antes de ir.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-3xl border border-slate-100 hover:border-primary-200 transition-colors hover:shadow-lg">
                            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                                <KeyRound className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Código de Atención Rápida</h3>
                            <p className="text-slate-600">
                                Accede a tus servicios y paga de forma simple. Al llegar, solo muestra tu código de consulta al veterinario. Sin filas ni esperas innecesarias.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-3xl border border-slate-100 hover:border-primary-200 transition-colors hover:shadow-lg">
                            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                                <ShieldCheck className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Carnet Digital</h3>
                            <p className="text-slate-600">
                                Mantén el registro de vacunas, diagnósticos y recetas siempre a salvo en tu cuenta. Nunca más pierdas una libreta física.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Security & Trust Section — Volviendo comercial la seguridad de los datos */}
            <section className="py-20 bg-slate-50 border-t border-b border-slate-200/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-xs font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full">
                            🔐 Confianza y Seguridad
                        </span>
                        <h2 className="text-3xl font-extrabold text-slate-900 mt-4 mb-4">
                            Tus datos y tus mascotas en las mejores manos
                        </h2>
                        <p className="text-slate-600 text-lg">
                            Diseñado bajo estándares de seguridad y regulaciones legales peruanas para brindarte total tranquilidad.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mb-6">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Protección de Privacidad</h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Cumplimos estrictamente con la <strong>Ley N.° 29733 (Ley de Protección de Datos Personales de Perú)</strong>. Tu información médica y de contacto está cifrada y nunca se comparte sin tu consentimiento explícito.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                                <Stethoscope className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Médicos Habilitados</h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Validamos el código de habilitación del <strong>Colegio Médico Veterinario del Perú (CMVP)</strong> de todos los especialistas registrados en la plataforma. Sin sorpresas, solo profesionales validados.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                                <Wallet className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Transacciones Protegidas</h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Procesamos el cobro de la reserva mediante pasarelas de pago reguladas (como Izipay). Tus datos de facturación nunca quedan expuestos ni se almacenan en nuestros servidores.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* For Veterinarians & Providers */}
            <section id="soy-veterinario" className="py-24 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-900/40 to-slate-900" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="text-primary-400 font-bold tracking-wider uppercase text-sm mb-2 block">Haz crecer tu negocio</span>
                            <h2 className="text-4xl font-extrabold mb-6 leading-tight">
                                La herramienta definitiva para Especialistas
                            </h2>
                            <p className="text-slate-300 text-lg mb-8 text-balance">
                                Brofy no es solo un directorio — es tu sistema operativo completo. Gestiona clientes, historiales médicos y finanzas sin intermediarios que corten la comunicación con tus pacientes.
                            </p>

                            <ul className="space-y-4 mb-8">
                                {[
                                    "Perfil público de tu local y tarifario de servicios actualizable.",
                                    "Agenda de citas con gestión de horarios y capacidad simultánea.",
                                    "Panel de \"Ficha Rápida\" para registrar historias clínicas en segundos.",
                                    "Módulo financiero: ingresos, gastos y deuda de comisiones Brofy.",
                                    "Sistema de validación con Código de Atención para garantizar la identidad del cliente.",
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-slate-200">
                                        <div className="w-6 h-6 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center shrink-0 mt-0.5">
                                            <CheckIcon className="w-4 h-4" />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            <Link href="/signup" className="inline-flex items-center gap-2 bg-primary-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-primary-400 transition-colors shadow-lg">
                                Unirse como Profesional <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 p-6 rounded-3xl space-y-4">
                                <Store className="w-8 h-8 text-blue-400" />
                                <h4 className="font-bold text-lg">Perfil de Local</h4>
                                <p className="text-sm text-slate-400">Atrae nuevos clientes mostrando tus servicios y precios en el mapa interactivo.</p>
                            </div>
                            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 p-6 rounded-3xl space-y-4 mt-8">
                                <ClipboardList className="w-8 h-8 text-emerald-400" />
                                <h4 className="font-bold text-lg">Ficha Rápida</h4>
                                <p className="text-sm text-slate-400">Registra síntomas y diagnósticos en segundos. También para clientes presenciales sin cita previa.</p>
                            </div>
                            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 p-6 rounded-3xl space-y-4">
                                <Wallet className="w-8 h-8 text-amber-400" />
                                <h4 className="font-bold text-lg">Finanzas</h4>
                                <p className="text-sm text-slate-400">Control de ingresos, gastos y comisiones pendientes con Brofy en un solo lugar.</p>
                            </div>
                            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 p-6 rounded-3xl space-y-4 mt-8">
                                <KeyRound className="w-8 h-8 text-purple-400" />
                                <h4 className="font-bold text-lg">Código de Consulta</h4>
                                <p className="text-sm text-slate-400">Confirma la identidad del cliente y desbloquea su ficha médica con su código de atención de consulta.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-100 py-12">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <span className="text-2xl font-bold text-slate-900 tracking-tight block mb-2">Brofy</span>
                    <p className="text-slate-500 mb-8">Elevando el estándar del cuidado veterinario en Perú.</p>
                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
                        <span>© 2026 Brofy. Todos los derechos reservados.</span>
                        <Link href="/login" className="hover:text-primary-600 transition-colors">Ingresar</Link>
                        <Link href="/signup" className="hover:text-primary-600 transition-colors">Registrarse</Link>
                        <Link href="/terminos" className="hover:text-primary-600 transition-colors">Términos y Condiciones</Link>
                        <a href="/libro-de-reclamaciones" className="hover:text-primary-600 transition-colors border-l pl-6 border-slate-200">
                            <BookOpen className="w-3.5 h-3.5 inline mr-1" />Libro de Reclamaciones
                        </a>
                    </div>
                </div>
            </footer>
        </main>
    );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <polyline points="20 6 9 17 4 12" />
        </svg>
    )
}
