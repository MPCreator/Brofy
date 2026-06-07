import {
    ArrowRight, MapPin, Search, Star, ShieldCheck, KeyRound,
    ClipboardList, Wallet, Stethoscope, Store, CalendarCheck,
    PawPrint, CreditCard, BookOpen
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getSession } from "@/lib/auth";
import { getEstablishments } from "@/lib/actions";
import LandingSearchBar from "@/components/landing/LandingSearchBar";
import InteractiveEstablishments from "@/components/landing/InteractiveEstablishments";

export default async function Home() {
    const session = await getSession();
    const establishments = await getEstablishments();

    return (
        <main className="min-h-screen flex flex-col bg-slate-50 overflow-x-hidden w-full">
            {/* Header */}
            <header className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center">
                        <Link href="/">
                            <Image 
                                src="/logo.png" 
                                alt="Brofy Logo" 
                                width={280} 
                                height={153} 
                                className="object-contain h-14 sm:h-[70px]" 
                                style={{ width: 'auto' }}
                                priority 
                            />
                        </Link>
                    </div>
                    <nav className="hidden md:flex gap-8 text-sm font-semibold text-slate-600">
                        <a href="#como-funciona" className="hover:text-primary-600 transition-colors">¿Cómo funciona?</a>
                        <a href="#beneficios" className="hover:text-primary-600 transition-colors">Beneficios</a>
                        <a href="#soy-proveedor" className="hover:text-primary-600 transition-colors">Para Especialistas</a>
                    </nav>
                    <div className="flex items-center gap-4">
                        {session ? (
                            <Link 
                                href={
                                    session.role === 'admin' 
                                        ? '/dashboard/admin' 
                                        : session.role === 'vet' || session.role === 'provider' 
                                            ? '/dashboard/vet' 
                                            : '/dashboard/client'
                                } 
                                className="bg-primary-600 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-primary-700 transition-all shadow-md hover:shadow-lg active:scale-95"
                            >
                                Mi Panel 🐾
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-primary-600 transition-colors">
                                    Ingresar
                                </Link>
                                <Link href="/signup" className="bg-primary-600 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-primary-700 transition-all shadow-md hover:shadow-lg active:scale-95">
                                    Crear cuenta
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section (Airbnb Styled - Enlarged for Premium SaaS Aesthetics) */}
            <section className="pt-36 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-primary-50 text-primary-700 text-xs md:text-sm font-bold mb-8 border border-primary-100/80 animate-pulse">
                    <span className="flex h-2 w-2 rounded-full bg-primary-600"></span>
                    La nueva era del cuidado animal en Perú
                </div>
                
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-950 max-w-4xl mx-auto leading-[1.1] mb-6">
                    El ecosistema integral para <span className="text-primary-600">mascotas, clínicas y spas.</span>
                </h1>
                
                <p className="text-lg md:text-xl text-slate-500 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
                    Conectamos a dueños de mascotas con los mejores especialistas verificados. Reserva citas, gestiona su historial médico digital y olvídate de las colas.
                </p>

                {/* Floating Search Bar */}
                <div className="mb-12">
                    <LandingSearchBar />
                </div>
            </section>

            {/* Catálogo Interactivo Fluid Filtros + Grid */}
            <InteractiveEstablishments establishments={establishments} />

            {/* ¿Cómo funciona? */}
            <section id="como-funciona" className="py-28 bg-gradient-to-b from-slate-50 via-white to-slate-50 relative overflow-hidden border-t border-slate-100/60">
                {/* Decorative background blur orbs */}
                <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-primary-100/30 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl pointer-events-none"></div>

                <div className="max-w-5xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-24">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-100/80 text-primary-700 text-xs md:text-sm font-bold mb-5 uppercase tracking-wider">
                            🐾 Proceso Simple
                        </div>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">Atención digital sin fricciones en 3 pasos</h2>
                        <p className="text-base md:text-lg text-slate-500 mt-4 max-w-2xl mx-auto leading-relaxed font-medium">
                            Olvídate de las salas de espera interminables, los trámites repetitivos y los papeles perdidos.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {/* Paso 1 */}
                        <div className="bg-white/70 backdrop-blur-md p-10 rounded-[2rem] border border-slate-100 shadow-sm relative group hover:shadow-xl hover:-translate-y-2 hover:border-primary-200/50 transition-all duration-300">
                            <div className="absolute -top-7 left-8 w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 text-white text-lg font-black flex items-center justify-center rounded-2xl shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform duration-300">
                                1
                            </div>
                            <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mb-7 mt-3 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                                <CalendarCheck className="w-8 h-8" />
                            </div>
                            <h3 className="font-extrabold text-xl md:text-2xl text-slate-900 mb-4 group-hover:text-primary-700 transition-colors duration-300">Descubrir y agendar</h3>
                            <p className="text-sm md:text-base text-slate-500 leading-relaxed font-medium">
                                Encuentra la clínica o spa ideal, elige el servicio y el horario que mejor te acomode. Abona únicamente <span className="font-bold text-slate-800">S/ 5.00 de acceso a la plataforma</span> para agendar de forma segura.
                            </p>
                        </div>
                        {/* Paso 2 */}
                        <div className="bg-white/70 backdrop-blur-md p-10 rounded-[2rem] border border-slate-100 shadow-sm relative group hover:shadow-xl hover:-translate-y-2 hover:border-primary-200/50 transition-all duration-300">
                            <div className="absolute -top-7 left-8 w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 text-white text-lg font-black flex items-center justify-center rounded-2xl shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform duration-300">
                                2
                            </div>
                            <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mb-7 mt-3 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                                <KeyRound className="w-8 h-8" />
                            </div>
                            <h3 className="font-extrabold text-xl md:text-2xl text-slate-900 mb-4 group-hover:text-primary-700 transition-colors duration-300">Código de Atención</h3>
                            <p className="text-sm md:text-base text-slate-500 leading-relaxed font-medium">
                                Recibe instantáneamente un código único de 6 dígitos en tu panel. Al llegar al local, solo díselo al especialista para validar tu reserva de forma inmediata.
                            </p>
                        </div>
                        {/* Paso 3 */}
                        <div className="bg-white/70 backdrop-blur-md p-10 rounded-[2rem] border border-slate-100 shadow-sm relative group hover:shadow-xl hover:-translate-y-2 hover:border-primary-200/50 transition-all duration-300">
                            <div className="absolute -top-7 left-8 w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 text-white text-lg font-black flex items-center justify-center rounded-2xl shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform duration-300">
                                3
                            </div>
                            <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mb-7 mt-3 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                                <ClipboardList className="w-8 h-8" />
                            </div>
                            <h3 className="font-extrabold text-xl md:text-2xl text-slate-900 mb-4 group-hover:text-primary-700 transition-colors duration-300">Historial Digital</h3>
                            <p className="text-sm md:text-base text-slate-500 leading-relaxed font-medium">
                                El veterinario o estilista ingresa tu código para abrir la Ficha de Atención. Los diagnósticos, recetas y vacunas se guardan de forma automática en tu Carnet Digital.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Beneficios */}
            <section id="beneficios" className="max-w-5xl mx-auto py-28 px-6 w-full relative">
                <div className="text-center mb-24">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-100/80 text-primary-700 text-xs md:text-sm font-bold mb-5 uppercase tracking-wider">
                        ✨ Beneficios Exclusivos
                    </div>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">Todo lo que necesitas en la palma de tu mano</h2>
                    <p className="text-base md:text-lg text-slate-500 mt-4 max-w-2xl mx-auto leading-relaxed font-medium">
                        La tranquilidad de cuidar a tu mejor amigo con herramientas inteligentes diseñadas para simplificar su vida.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* Beneficio 1 */}
                    <div className="p-10 border border-slate-100 bg-white rounded-[2rem] hover:border-primary-100 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                        <div className="absolute -right-16 -top-16 w-32 h-32 bg-primary-50 rounded-full opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500 -z-10 blur-xl"></div>
                        <div className="w-18 h-18 rounded-[1.25rem] bg-primary-50 text-primary-600 flex items-center justify-center mb-7 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                            <MapPin className="w-9 h-9" />
                        </div>
                        <h3 className="font-extrabold text-xl md:text-2xl text-slate-900 mb-4 group-hover:text-primary-700 transition-colors duration-300">Encuentra Locales Cerca</h3>
                        <p className="text-sm md:text-base text-slate-650 leading-relaxed font-medium">
                            Descubre veterinarias, spas y paseadores a tu alrededor. Compara perfiles detallados, valoraciones reales de la comunidad y tarifas transparentes antes de salir de casa.
                        </p>
                    </div>

                    {/* Beneficio 2 */}
                    <div className="p-10 border border-slate-100 bg-white rounded-[2rem] hover:border-primary-100 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                        <div className="absolute -right-16 -top-16 w-32 h-32 bg-primary-50 rounded-full opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500 -z-10 blur-xl"></div>
                        <div className="w-18 h-18 rounded-[1.25rem] bg-primary-50 text-primary-600 flex items-center justify-center mb-7 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                            <PawPrint className="w-9 h-9" />
                        </div>
                        <h3 className="font-extrabold text-xl md:text-2xl text-slate-900 mb-4 group-hover:text-primary-700 transition-colors duration-300">Reserva de Consulta Rápida</h3>
                        <p className="text-sm md:text-base text-slate-655 leading-relaxed font-medium">
                            Accede y reserva de forma simple. Al llegar al establecimiento, muestra tu código y pasa directo a consulta. Sin papeles extra, sin demoras ni filas innecesarias.
                        </p>
                    </div>

                    {/* Beneficio 3 */}
                    <div className="p-10 border border-slate-100 bg-white rounded-[2rem] hover:border-primary-100 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                        <div className="absolute -right-16 -top-16 w-32 h-32 bg-primary-50 rounded-full opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500 -z-10 blur-xl"></div>
                        <div className="w-18 h-18 rounded-[1.25rem] bg-primary-50 text-primary-600 flex items-center justify-center mb-7 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                            <Stethoscope className="w-9 h-9" />
                        </div>
                        <h3 className="font-extrabold text-xl md:text-2xl text-slate-900 mb-4 group-hover:text-primary-700 transition-colors duration-300">Carnet Médico Digital</h3>
                        <p className="text-sm md:text-base text-slate-660 leading-relaxed font-medium">
                            Mantén el registro completo de vacunas, desparasitaciones, diagnósticos y recetas 100% a salvo en la nube. Accede a la información médica desde cualquier dispositivo.
                        </p>
                    </div>
                </div>
            </section>

            {/* Confianza y Seguridad */}
            <section className="w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white py-28 px-6 relative overflow-hidden border-y border-slate-800/80 group" style={{ isolation: 'isolate' }}>
                {/* Background glowing radial orbs — kept inside bounds so they don't clip */}
                <div className="absolute right-0 bottom-0 w-[32rem] h-[32rem] bg-primary-600/10 rounded-full blur-3xl pointer-events-none translate-x-1/2 translate-y-1/2 group-hover:bg-primary-600/15 transition-all duration-700"></div>
                <div className="absolute left-0 top-0 w-[32rem] h-[32rem] bg-blue-600/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2 group-hover:bg-blue-600/15 transition-all duration-700"></div>

                {/* Floating, blurred, low-opacity background paw prints */}
                <div className="absolute top-10 left-[10%] w-28 h-28 text-primary-500/[0.05] blur-[3px] rotate-[-25deg] pointer-events-none transition-transform duration-700 group-hover:translate-y-2 group-hover:rotate-[-20deg]">
                    <PawPrint className="w-full h-full" />
                </div>
                <div className="absolute bottom-12 right-[12%] w-36 h-36 text-cyan-400/[0.04] blur-[4px] rotate-[35deg] pointer-events-none transition-transform duration-700 group-hover:-translate-y-2 group-hover:rotate-[40deg]">
                    <PawPrint className="w-full h-full" />
                </div>
                <div className="absolute top-1/2 left-[50%] -translate-x-1/2 -translate-y-1/2 w-24 h-24 text-slate-400/[0.03] blur-[2.5px] rotate-[15deg] pointer-events-none transition-transform duration-700 group-hover:scale-110">
                    <PawPrint className="w-full h-full" />
                </div>

                <div className="relative z-10 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-14 items-center">
                    <div className="lg:col-span-1">
                        <span className="bg-primary-500/10 border border-primary-500/30 text-primary-300 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider inline-flex items-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            🔒 Confianza y Seguridad
                        </span>
                        <h2 className="text-3xl md:text-4xl font-black mt-6 mb-5 leading-tight tracking-tight text-white">
                            Seguridad de nivel bancario para tu tranquilidad
                        </h2>
                        <p className="text-sm md:text-base text-slate-300 leading-relaxed font-medium">
                            Diseñado bajo estrictos estándares de seguridad de datos y respetando plenamente las regulaciones legales del Perú.
                        </p>
                    </div>

                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
                        {/* Tarjeta 1 */}
                        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/60 p-7 rounded-[1.5rem] hover:border-primary-500/40 hover:bg-slate-800/30 transition-all duration-300 group">
                            <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                                <ShieldCheck className="w-7 h-7 text-primary-400 drop-shadow-[0_0_8px_rgba(7,142,173,0.3)]" />
                            </div>
                            <h4 className="font-extrabold text-lg md:text-xl text-white mb-3">Ley N.° 29733</h4>
                            <p className="text-xs md:text-sm text-slate-350 leading-relaxed font-medium">
                                Protección de Datos Personales. Tu información médica y de contacto está encriptada y protegida con total privacidad.
                            </p>
                        </div>

                        {/* Tarjeta 2 */}
                        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/60 p-7 rounded-[1.5rem] hover:border-primary-500/40 hover:bg-slate-800/30 transition-all duration-300 group">
                            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                                <Stethoscope className="w-7 h-7 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]" />
                            </div>
                            <h4 className="font-extrabold text-lg md:text-xl text-white mb-3">Médicos Colegiados</h4>
                            <p className="text-xs md:text-sm text-slate-355 leading-relaxed font-medium">
                                Validamos rigurosamente la colegiatura y habilitación vigente del Colegio Médico Veterinario del Perú (CMVP).
                            </p>
                        </div>

                        {/* Tarjeta 3 */}
                        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/60 p-7 rounded-[1.5rem] hover:border-primary-500/40 hover:bg-slate-800/30 transition-all duration-300 group">
                            <div className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                                <CreditCard className="w-7 h-7 text-teal-400 drop-shadow-[0_0_8px_rgba(20,184,166,0.3)]" />
                            </div>
                            <h4 className="font-extrabold text-lg md:text-xl text-white mb-3">Pasarela Regulada</h4>
                            <p className="text-xs md:text-sm text-slate-360 leading-relaxed font-medium">
                                Transacciones ultra seguras procesadas por Izipay. Cumplimos con estándares de encriptación bancaria.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Para Especialistas */}
            <section id="soy-proveedor" className="border-t border-slate-100 bg-white py-28 px-6 w-full">
                <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div>
                        <span className="bg-primary-50 text-primary-700 border border-primary-100 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider inline-block">
                            🚀 Haz crecer tu negocio
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-950 mt-5 mb-6 tracking-tight leading-none">
                            El sistema definitivo para Clínicas, Spas y Especialistas
                        </h2>
                        <p className="text-base md:text-lg text-slate-600 mb-10 leading-relaxed font-medium">
                            Brofy es el sistema operativo integral de tu negocio de mascotas. Gestiona clientes, historiales de atención, tarifarios y tus finanzas en un solo panel intuitivo, eliminando costosos intermediarios.
                        </p>

                        <ul className="space-y-6 mb-12 text-sm md:text-base text-slate-700 font-semibold">
                            <li className="flex items-start gap-4">
                                <div className="mt-0.5 bg-primary-100 text-primary-700 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-bold">✓</span>
                                </div>
                                <span className="text-slate-650">Perfil público del local y tarifarios actualizables en tiempo real.</span>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="mt-0.5 bg-primary-100 text-primary-700 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-bold">✓</span>
                                </div>
                                <span className="text-slate-650">Agenda avanzada de citas y control de aforo en tiempo real.</span>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="mt-0.5 bg-primary-100 text-primary-700 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-bold">✓</span>
                                </div>
                                <span className="text-slate-650">Módulo de &quot;Ficha Rápida&quot; para registrar diagnósticos en segundos.</span>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="mt-0.5 bg-primary-100 text-primary-700 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-bold">✓</span>
                                </div>
                                <span className="text-slate-650">Panel Financiero: Control total de ingresos, egresos y comisiones.</span>
                            </li>
                        </ul>

                        <Link 
                            href="/signup" 
                            className="inline-flex items-center gap-2.5 bg-slate-900 text-white text-base font-black px-10 py-5 rounded-full hover:bg-primary-600 hover:shadow-lg hover:shadow-primary-500/20 active:scale-95 transition-all duration-300 group"
                        >
                            Unirse como Profesional <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Widget 1 */}
                        <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 hover:border-primary-100 hover:bg-white hover:shadow-lg transition-all duration-300 group">
                            <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mb-5 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                                <Store className="w-7 h-7" />
                            </div>
                            <h4 className="font-extrabold text-lg md:text-xl text-slate-900 mb-3">Perfil del Local</h4>
                            <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-medium">
                                Atrae clientes mostrando servicios y precios actualizados en el mapa interactivo.
                            </p>
                        </div>

                        {/* Widget 2 */}
                        <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 hover:border-primary-100 hover:bg-white hover:shadow-lg transition-all duration-300 group">
                            <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mb-5 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                                <ClipboardList className="w-7 h-7" />
                            </div>
                            <h4 className="font-extrabold text-lg md:text-xl text-slate-900 mb-3">Ficha Rápida</h4>
                            <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-medium">
                                Registra síntomas y diagnósticos al instante, incluso para pacientes presenciales.
                            </p>
                        </div>

                        {/* Widget 3 */}
                        <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 hover:border-primary-100 hover:bg-white hover:shadow-lg transition-all duration-300 group">
                            <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mb-5 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                                <Wallet className="w-7 h-7" />
                            </div>
                            <h4 className="font-extrabold text-lg md:text-xl text-slate-900 mb-3">Módulo Financiero</h4>
                            <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-medium">
                                Control transparente de ingresos, gastos y comisiones Brofy en un mismo sitio.
                            </p>
                        </div>

                        {/* Widget 4 */}
                        <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 hover:border-primary-100 hover:bg-white hover:shadow-lg transition-all duration-300 group">
                            <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mb-5 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                                <KeyRound className="w-7 h-7" />
                            </div>
                            <h4 className="font-extrabold text-lg md:text-xl text-slate-900 mb-3">Código de Consulta</h4>
                            <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-medium">
                                Valida la identidad del cliente mediante su código único y desbloquea el historial.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-950 text-slate-400 text-xs pt-20 pb-12 px-6 border-t border-slate-900 w-full mt-auto">
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 text-left">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <Image 
                            src="/Logo_blanco.png" 
                            alt="Brofy Logo" 
                            width={200} 
                            height={109} 
                            className="object-contain h-[48px] w-auto mb-4" 
                        />
                        <p className="text-slate-500 leading-relaxed mb-4">
                            Elevando el estándar del cuidado y salud de mascotas en el Perú.
                        </p>
                    </div>

                    {/* Descubrir */}
                    <div>
                        <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider text-[11px]">Descubrir</h4>
                        <ul className="space-y-2.5 font-medium">
                            <li><Link href="/discover?category=VETERINARIA" className="hover:text-white transition-colors">Clínicas Veterinarias</Link></li>
                            <li><Link href="/discover?category=SPA" className="hover:text-white transition-colors">Spas para Mascotas</Link></li>
                            <li><Link href="/discover?category=PASEOS" className="hover:text-white transition-colors">Servicios de Paseo</Link></li>
                            <li><Link href="/discover" className="hover:text-white transition-colors">Buscar por Distrito</Link></li>
                        </ul>
                    </div>

                    {/* Especialistas */}
                    <div>
                        <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider text-[11px]">Para Especialistas</h4>
                        <ul className="space-y-2.5 font-medium">
                            <li><Link href="/signup" className="hover:text-white transition-colors">Registrar Local</Link></li>
                            <li><Link href="/login" className="hover:text-white transition-colors">Acceder a Panel</Link></li>
                            <li><a href="#soy-proveedor" className="hover:text-white transition-colors">Beneficios de Negocio</a></li>
                        </ul>
                    </div>

                    {/* Legal y Soporte */}
                    <div>
                        <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider text-[11px]">Soporte y Legal</h4>
                        <ul className="space-y-2.5 font-medium">
                            <li><Link href="/terminos" className="hover:text-white transition-colors">Términos y Condiciones</Link></li>
                            <li><Link href="/politica-privacidad" className="hover:text-white transition-colors">Políticas de Privacidad</Link></li>
                            <li>
                                <Link 
                                    href="/libro-de-reclamaciones" 
                                    className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-2 rounded-xl border border-slate-800/80 transition-all font-bold mt-1"
                                >
                                    <BookOpen className="w-3.5 h-3.5 text-amber-400" /> Libro de Reclamaciones
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto pt-8 border-t border-slate-900 text-center text-slate-600 text-[11px] flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>© 2026 Brofy. Todos los derechos reservados.</div>
                    <div className="flex items-center gap-1">
                        Hecho en Perú con <span className="text-rose-500">❤️</span> y <span className="text-primary-400">🐾</span>
                    </div>
                </div>
            </footer>
        </main>
    );
}