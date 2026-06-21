import Link from 'next/link'
import { ArrowLeft, Shield, Eye, Database, Lock, UserCheck } from 'lucide-react'

export const metadata = {
    title: 'Política de Privacidad — Brofy',
    description: 'Cómo Brofy recopila, usa y protege tus datos personales.',
}

export default function PrivacidadPage() {
    return (
        <main className="min-h-screen bg-surface-50 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <Link href="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary-600 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Volver
                    </Link>
                </div>

                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 space-y-8">
                    {/* Header */}
                    <div className="border-b border-slate-100 pb-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                                <Shield className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Documento Legal</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900">Política de Privacidad</h1>
                        <p className="text-slate-500 mt-2 text-sm">
                            Última actualización: 11 de junio de 2026 · Versión 1.1
                        </p>
                        <p className="text-sm text-slate-600 mt-3">
                            En cumplimiento de la <strong>Ley N.º 29733</strong>, Ley de Protección de Datos Personales, y su Reglamento aprobado por Decreto Supremo N.º 003-2013-JUS, <strong>Brofy S.A.C.</strong> informa sobre el tratamiento de los datos personales de sus usuarios.
                        </p>
                    </div>

                    {/* Quick Summary */}
                    <div className="grid sm:grid-cols-3 gap-4">
                        <div className="bg-blue-50 rounded-2xl p-4 text-center">
                            <Database className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                            <p className="text-xs font-bold text-blue-900">Solo lo necesario</p>
                            <p className="text-xs text-blue-700 mt-1">Recopilamos únicamente los datos indispensables para el servicio</p>
                        </div>
                        <div className="bg-emerald-50 rounded-2xl p-4 text-center">
                            <Lock className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                            <p className="text-xs font-bold text-emerald-900">Cifrado y seguro</p>
                            <p className="text-xs text-emerald-700 mt-1">Tus datos se almacenan cifrados en servidores seguros</p>
                        </div>
                        <div className="bg-amber-50 rounded-2xl p-4 text-center">
                            <UserCheck className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                            <p className="text-xs font-bold text-amber-900">Tus derechos</p>
                            <p className="text-xs text-amber-700 mt-1">Puedes acceder, rectificar o cancelar tus datos en cualquier momento</p>
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* 1 */}
                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <span className="w-7 h-7 bg-primary-100 text-primary-700 rounded-lg text-xs font-black flex items-center justify-center">1</span>
                            Responsable del Tratamiento
                        </h2>
                        <div className="text-sm text-slate-700 leading-relaxed space-y-1">
                            <p><strong>Razón social:</strong> Brofy S.A.C.</p>
                            <p><strong>RUC:</strong> [NÚMERO DE RUC]</p>
                            <p><strong>Domicilio:</strong> Lima, Perú</p>
                            <p><strong>Correo de contacto:</strong> privacidad@brofy.pe</p>
                        </div>
                    </section>

                    <hr className="border-slate-100" />

                    {/* 2 */}
                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <span className="w-7 h-7 bg-primary-100 text-primary-700 rounded-lg text-xs font-black flex items-center justify-center">2</span>
                            Datos que Recopilamos
                        </h2>
                        <div className="text-sm text-slate-700 leading-relaxed space-y-4">
                            <div>
                                <p className="font-semibold mb-1">Datos de registro de cuenta:</p>
                                <ul className="list-disc list-inside pl-2 space-y-0.5 text-slate-600">
                                    <li>Nombre completo</li>
                                    <li>Dirección de correo electrónico</li>
                                    <li>Contraseña (almacenada con hash bcrypt, nunca en texto plano)</li>
                                    <li>Número de teléfono (opcional)</li>
                                    <li>Número de colegiatura CMVP (solo para profesionales veterinarios)</li>
                                </ul>
                            </div>
                            <div>
                                <p className="font-semibold mb-1">Datos de mascotas:</p>
                                <ul className="list-disc list-inside pl-2 space-y-0.5 text-slate-600">
                                    <li>Nombre, especie, raza, fecha de nacimiento, peso, sexo</li>
                                    <li>Número de microchip (opcional)</li>
                                    <li>Historial médico: síntomas, diagnósticos, recetas, tratamientos</li>
                                </ul>
                            </div>
                            <div>
                                <p className="font-semibold mb-1">Datos de uso de la plataforma:</p>
                                <ul className="list-disc list-inside pl-2 space-y-0.5 text-slate-600">
                                    <li>Registro de citas agendadas y completadas</li>
                                    <li>Códigos OTP generados (solo se almacena el hash)</li>
                                    <li>Valoraciones y comentarios publicados</li>
                                    <li>Transacciones realizadas (monto, fecha, referencia de pago)</li>
                                </ul>
                            </div>
                            <div>
                                <p className="font-semibold mb-1">Datos de ubicación:</p>
                                <ul className="list-disc list-inside pl-2 space-y-0.5 text-slate-600">
                                    <li>Coordenadas geográficas del establecimiento (para el mapa de búsqueda), ingresadas manualmente por el profesional</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <hr className="border-slate-100" />

                    {/* 3 */}
                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <span className="w-7 h-7 bg-primary-100 text-primary-700 rounded-lg text-xs font-black flex items-center justify-center">3</span>
                            Finalidad del Tratamiento y Base Legal
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-slate-700 border-collapse">
                                <thead>
                                    <tr className="bg-slate-50">
                                        <th className="text-left p-3 font-semibold text-slate-900 rounded-tl-lg">Finalidad</th>
                                        <th className="text-left p-3 font-semibold text-slate-900 rounded-tr-lg">Base Legal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {[
                                        ['Gestionar la cuenta del usuario y autenticar el acceso', 'Ejecución del contrato (T&C aceptados)'],
                                        ['Proveer los servicios digitales de intermediación', 'Ejecución del contrato'],
                                        ['Registrar y almacenar el historial médico digital', 'Consentimiento expreso del usuario'],
                                        ['Procesar pagos del Cargo por Infraestructura', 'Ejecución del contrato + obligación legal tributaria'],
                                        ['Verificar preliminarmente la colegiatura profesional CMVP al registrar la cuenta del titular', 'Interés legítimo de Brofy en la seguridad y ordenamiento de la Plataforma'],
                                        ['Mostrar valoraciones públicas del establecimiento', 'Consentimiento del usuario al publicar la valoración'],
                                        ['Comunicaciones sobre el servicio (transaccionales)', 'Ejecución del contrato'],
                                        ['Cumplir obligaciones legales (SUNAT, INDECOPI)', 'Obligación legal'],
                                    ].map(([fin, base], i) => (
                                        <tr key={i} className="hover:bg-slate-50/50">
                                            <td className="p-3 align-top">{fin}</td>
                                            <td className="p-3 align-top text-slate-500">{base}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <hr className="border-slate-100" />

                    {/* 4 */}
                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <span className="w-7 h-7 bg-primary-100 text-primary-700 rounded-lg text-xs font-black flex items-center justify-center">4</span>
                            Plazo de Conservación
                        </h2>
                        <div className="text-sm text-slate-700 leading-relaxed space-y-2">
                            <p>Los datos de cuenta se conservan durante la vigencia de la relación contractual y hasta <strong>5 años</strong> después de la cancelación de la cuenta, por obligaciones tributarias y legales.</p>
                            <p>Los historiales y atenciones clínicas de las mascotas se almacenan en la nube para consulta y portabilidad del usuario, pero su conservación definitiva e ininterrumpida recae sobre el Profesional o clínica veterinaria que prestó el servicio, conforme a las leyes sanitarias. Las solicitudes de supresión de estos registros estarán limitadas por la obligación legal de retención regulatoria de historiales médicos que afecte a dichos profesionales.</p>
                            <p>Los registros de transacciones se conservan <strong>7 años</strong> de conformidad con la normativa tributaria peruana.</p>
                        </div>
                    </section>

                    <hr className="border-slate-100" />

                    {/* 5 */}
                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <span className="w-7 h-7 bg-primary-100 text-primary-700 rounded-lg text-xs font-black flex items-center justify-center">5</span>
                            Cesión de Datos a Terceros
                        </h2>
                        <div className="text-sm text-slate-700 leading-relaxed space-y-2">
                            <p>Brofy <strong>no vende ni cede</strong> datos personales a terceros con fines comerciales.</p>
                            <p>Los datos pueden ser compartidos con:</p>
                            <ul className="list-disc list-inside pl-2 space-y-1 text-slate-600">
                                <li><strong>Proveedor de infraestructura cloud</strong> (Supabase/AWS): para el alojamiento seguro de los datos. Sujeto a acuerdo de encargo de tratamiento.</li>
                                <li><strong>Pasarela de pagos</strong> (Izipay): exclusivamente los datos necesarios para procesar el pago. Sujeto a sus propios términos de privacidad.</li>
                                <li><strong>Autoridades competentes</strong>: cuando exista obligación legal o mandato judicial.</li>
                            </ul>
                            <p>Los Profesionales registrados en la plataforma tienen acceso a los datos clínicos de las mascotas de los clientes que los atienden, en el marco de la prestación del servicio médico. Dicho acceso es de carácter profesional y está sujeto al secreto veterinario.</p>
                        </div>
                    </section>

                    <hr className="border-slate-100" />

                    {/* 6 */}
                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <span className="w-7 h-7 bg-primary-100 text-primary-700 rounded-lg text-xs font-black flex items-center justify-center">6</span>
                            Derechos del Titular (ARCO)
                        </h2>
                        <div className="text-sm text-slate-700 leading-relaxed space-y-3">
                            <p>El titular de los datos tiene derecho a:</p>
                            <div className="grid sm:grid-cols-2 gap-3">
                                {[
                                    { t: '🔍 Acceso', d: 'Conocer qué datos personales tuyos tratamos.' },
                                    { t: '✏️ Rectificación', d: 'Corregir datos inexactos o incompletos.' },
                                    { t: '❌ Cancelación', d: 'Solicitar la eliminación de tus datos cuando ya no sean necesarios.' },
                                    { t: '🚫 Oposición', d: 'Oponerte al tratamiento de tus datos en casos específicos.' },
                                ].map(({ t, d }) => (
                                    <div key={t} className="bg-slate-50 rounded-xl p-3">
                                        <p className="font-semibold text-slate-900 text-sm">{t}</p>
                                        <p className="text-xs text-slate-600 mt-1">{d}</p>
                                    </div>
                                ))}
                            </div>
                            <p>
                                Para ejercer estos derechos, puedes enviar tu solicitud directamente a través de la Plataforma ingresando a tu panel de <strong>Configuración</strong> en la sección <strong>&quot;Derechos de Privacidad ARCO (Ley N.º 29733)&quot;</strong>. 
                                Alternativamente, puedes escribirnos al correo electrónico <strong>privacidad@brofy.pe</strong> indicando tu nombre, correo asociado a tu cuenta, documento de identidad, y detallando el derecho específico que deseas ejercer.
                            </p>
                            <p>
                                De conformidad con la ley peruana, los plazos de respuesta son:
                            </p>
                            <ul className="list-disc list-inside pl-4 text-xs text-slate-650 space-y-1">
                                <li><strong>Derecho de Acceso:</strong> Plazo máximo de <strong>20 días hábiles</strong>.</li>
                                <li><strong>Derechos de Rectificación, Cancelación u Oposición:</strong> Plazo máximo de <strong>10 días hábiles</strong>.</li>
                            </ul>
                            <p>Si consideras que el tratamiento de tus datos no es conforme a la ley, puedes presentar una reclamación ante la <strong>Autoridad Nacional de Protección de Datos Personales (ANPD)</strong> del Ministerio de Justicia y Derechos Humanos.</p>
                        </div>
                    </section>

                    <hr className="border-slate-100" />

                    {/* 7 */}
                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <span className="w-7 h-7 bg-primary-100 text-primary-700 rounded-lg text-xs font-black flex items-center justify-center">7</span>
                            Seguridad
                        </h2>
                        <p className="text-sm text-slate-700 leading-relaxed">
                            Brofy implementa medidas técnicas y organizativas apropiadas para proteger tus datos: cifrado en tránsito (TLS/HTTPS), contraseñas almacenadas con hash bcrypt, control de acceso por roles, y auditorías periódicas de seguridad. Sin embargo, ningún sistema es 100% seguro. En caso de brecha de seguridad que afecte tus datos, serás notificado conforme lo exige la ley.
                        </p>
                    </section>

                    <hr className="border-slate-100" />

                    {/* 8 */}
                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <span className="w-7 h-7 bg-primary-100 text-primary-700 rounded-lg text-xs font-black flex items-center justify-center">8</span>
                            Cambios a esta Política
                        </h2>
                        <p className="text-sm text-slate-700 leading-relaxed">
                            Nos reservamos el derecho de actualizar esta Política. Cualquier cambio material será notificado por correo electrónico al menos 15 días antes de su vigencia. El uso continuado de la Plataforma tras la actualización implica la aceptación de la nueva Política.
                        </p>
                    </section>

                    <div className="flex flex-wrap gap-4 pt-4 text-xs text-slate-400 justify-between items-center">
                        <span>© 2026 Brofy S.A.C. — Lima, Perú</span>
                        <div className="flex gap-4">
                            <Link href="/terminos" className="hover:text-primary-600 transition-colors">Términos y Condiciones</Link>
                            <Link href="/libro-de-reclamaciones" className="hover:text-primary-600 transition-colors">Libro de Reclamaciones</Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
