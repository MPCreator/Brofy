import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'

export const metadata = {
    title: 'Términos y Condiciones de Uso — Brofy',
    description: 'Términos y condiciones del servicio de la plataforma digital Brofy.',
}

export default function TerminosPage() {
    return (
        <main className="min-h-screen bg-surface-50 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center gap-3">
                    <Link href="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary-600 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Volver
                    </Link>
                </div>

                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 space-y-8">
                    {/* Title */}
                    <div className="border-b border-slate-100 pb-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center">
                                <Shield className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-primary-600 uppercase tracking-widest">Documento Legal</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900">Términos y Condiciones de Uso</h1>
                        <p className="text-slate-500 mt-2 text-sm">
                            Última actualización: 15 de mayo de 2026 · Versión 1.0
                        </p>
                    </div>

                    {/* Intro */}
                    <section className="space-y-3 text-slate-700 text-sm leading-relaxed">
                        <p>
                            Bienvenido a <strong>Brofy</strong> (en adelante, la Plataforma o Brofy), un servicio de infraestructura digital desarrollado y operado por <strong>Brofy S.A.C.</strong>, empresa debidamente constituida bajo las leyes de la República del Perú. Al acceder o utilizar la Plataforma, el Usuario (en adelante, Usuario, Cliente o Profesional, según corresponda) declara haber leído, comprendido y aceptado íntegramente los presentes Términos y Condiciones de Uso (T&C). Si no está de acuerdo con alguna disposición, deberá abstenerse de utilizar la Plataforma.
                        </p>
                        <p className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-900 font-medium">
                            ⚠️ AVISO IMPORTANTE: Brofy es una plataforma tecnológica de intermediación digital. Brofy no presta, ofrece, garantiza ni supervisa servicios veterinarios de ninguna clase. Los servicios de salud animal son prestados exclusivamente por los Profesionales independientes que utilizan la Plataforma.
                        </p>
                    </section>

                    <hr className="border-slate-100" />

                    {/* 1 */}
                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-slate-900">1. Definiciones</h2>
                        <div className="space-y-2 text-sm text-slate-700 leading-relaxed">
                            <p><strong>Plataforma:</strong> El software, sitio web y aplicaciones móviles de Brofy.</p>
                            <p><strong>Usuario / Cliente:</strong> Persona natural que accede a la Plataforma en calidad de propietario de una mascota.</p>
                            <p><strong>Profesional:</strong> Médico veterinario, groomer, paseador u otro prestador de servicios de cuidado animal registrado e independiente en la Plataforma.</p>
                            <p><strong>Servicio Digital:</strong> El conjunto de funcionalidades que Brofy provee: directorio, reserva de agenda, sistema de Código de Atención de verificación de identidad, gestión de historial médico digital, y procesamiento de pagos por el uso de infraestructura.</p>
                            <p><strong>Acto Médico:</strong> La consulta, diagnóstico, tratamiento, cirugía o cualquier intervención de salud animal, prestada exclusivamente por el Profesional habilitado y bajo su plena responsabilidad.</p>
                            <p><strong>Cargo por Infraestructura:</strong> El pago de S/ 5.00 (cinco soles con 00/100) que el Cliente abona a Brofy por el uso de la infraestructura digital, intermediación tecnológica y verificación de habilitación profesional, tal como se define en la cláusula 5.</p>
                        </div>
                    </section>

                    <hr className="border-slate-100" />

                    {/* 2 */}
                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-slate-900">2. Naturaleza del Servicio y Disociación del Acto Médico</h2>
                        <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
                            <p>
                                Brofy actúa exclusivamente como intermediario tecnológico entre Usuarios y Profesionales. La Plataforma facilita la búsqueda de Profesionales, la gestión de agendas, la verificación de identidad mediante Código de Atención y el almacenamiento de información clínica en formato digital.
                            </p>
                            <p>
                                Brofy <strong>no es parte</strong> de la relación contractual que se establece entre el Usuario y el Profesional para la prestación del servicio veterinario. La prestación del Acto Médico es un contrato independiente, bilateral y exclusivo entre el Usuario y el Profesional.
                            </p>
                            <p>
                                En consecuencia, Brofy no asume responsabilidad alguna por: (i) la calidad, idoneidad o resultado de los servicios veterinarios; (ii) errores de diagnóstico o tratamiento; (iii) el estado de salud de la mascota antes, durante o después de la atención; o (iv) cualquier daño, perjuicio o pérdida derivada directa o indirectamente del Acto Médico.
                            </p>
                        </div>
                    </section>

                    <hr className="border-slate-100" />

                    {/* 3 */}
                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-slate-900">3. Registro y Cuenta de Usuario</h2>
                        <div className="space-y-2 text-sm text-slate-700 leading-relaxed">
                            <p>Para acceder a las funcionalidades de la Plataforma, el Usuario deberá registrarse y crear una cuenta personal proporcionando información veraz, exacta y actualizada. El Usuario es responsable de mantener la confidencialidad de sus credenciales de acceso.</p>
                            <p>Para el registro como Profesional de tipo Clínica u Hospital, la Plataforma requerirá el número de colegiatura del Colegio Médico Veterinario del Perú (CMVP) como mecanismo de verificación de habilitación profesional, de conformidad con la Ley N.º 30407, Ley de Protección y Bienestar Animal.</p>
                            <p>Brofy se reserva el derecho de suspender o cancelar cuentas que infrinjan los presentes T&C, proporcionen información falsa o incurran en conductas fraudulentas.</p>
                        </div>
                    </section>

                    <hr className="border-slate-100" />

                    {/* 4 */}
                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-slate-900">4. Sistema de Código de Atención para Verificación de Identidad</h2>
                        <div className="space-y-2 text-sm text-slate-700 leading-relaxed">
                            <p>
                                La Plataforma implementa un sistema de Código de Atención con el propósito de verificar la identidad del Usuario en el momento de la atención, garantizando la correcta asignación del historial médico digital y previniendo la desintermediación entre Usuarios y Profesionales fuera de la Plataforma.
                            </p>
                            <p>
                                El Código de Atención es generado automáticamente tras la confirmación de la agenda y el abono del Cargo por Infraestructura. Dicho código es único, intransferible y de uso personal. El Usuario deberá presentar su Código de Atención al Profesional al momento de la atención; el Profesional lo ingresará en la Plataforma para desbloquear el historial médico digital.
                            </p>
                            <p>
                                El Código de Atención permanece válido desde su emisión hasta que el Profesional lo utiliza para iniciar la atención. No existe límite de tiempo artificial que obligue al Usuario a concurrir en un plazo determinado.
                            </p>
                        </div>
                    </section>

                    <hr className="border-slate-100" />

                    {/* 5 — CLAVE LEGAL */}
                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-slate-900">5. Cargo por Uso de Infraestructura Digital, Intermediación Tecnológica y Verificación de Habilitación Profesional</h2>
                        <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
                            <div className="bg-primary-50 border border-primary-200 rounded-xl px-4 py-3 space-y-2">
                                <p className="font-bold text-primary-900">Definición Contractual Imperativa:</p>
                                <p>
                                    El pago de <strong>S/ 5.00 (cinco soles con 00/100)</strong> que el Usuario abona al momento de registrar su agenda en la Plataforma constituye, en su totalidad e integridad, un <strong>Cargo por Uso de Infraestructura Digital, Intermediación Tecnológica y Verificación de Habilitación Profesional</strong> (en adelante, el Cargo).
                                </p>
                                <p>
                                    Este Cargo retribuye, de manera exclusiva y excluyente, los siguientes servicios digitales prestados por Brofy al Usuario:
                                </p>
                                <ul className="list-disc list-inside space-y-1 pl-2">
                                    <li>El uso de la infraestructura tecnológica de la Plataforma (servidores, bases de datos, API, interfaces).</li>
                                    <li>El servicio de intermediación tecnológica que conecta al Usuario con el directorio de Profesionales habilitados.</li>
                                    <li>La verificación digital del estado de habilitación profesional del Profesional seleccionado (consulta de CMVP).</li>
                                    <li>La generación y gestión del sistema de Código de Atención de verificación de identidad.</li>
                                    <li>El almacenamiento y cifrado del historial médico digital de la mascota del Usuario.</li>
                                    <li>La gestión segura de la transacción a través de la pasarela de pago certificada.</li>
                                </ul>
                            </div>
                            <p className="font-semibold text-slate-800">El Cargo no constituye, bajo ninguna interpretación posible:</p>
                            <ul className="list-disc list-inside space-y-1 text-slate-600 pl-2">
                                <li>Un pago por una consulta, diagnóstico, tratamiento o cualquier Acto Médico.</li>
                                <li>Un adelanto, seña, arras o garantía por servicios veterinarios.</li>
                                <li>Una reserva de un servicio de salud animal.</li>
                                <li>Un precio pactado con el Profesional por concepto alguno.</li>
                            </ul>
                            <p>
                                En virtud de lo anterior, el Cargo se entiende devengado y percibido por Brofy en el momento en que los servicios digitales descritos son provistos al Usuario, con independencia de que el Usuario concurra o no a la cita agendada y con independencia del resultado del Acto Médico.
                            </p>
                            <p>
                                Los honorarios del Profesional por el Acto Médico son pactados y cobrados directamente entre el Usuario y el Profesional, sin intervención de Brofy. Brofy no actúa como agente de cobro de honorarios profesionales.
                            </p>
                        </div>
                    </section>

                    <hr className="border-slate-100" />

                    {/* 6 */}
                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-slate-900">6. Comisiones a Profesionales</h2>
                        <div className="space-y-2 text-sm text-slate-700 leading-relaxed">
                            <p>
                                Los Profesionales que utilicen la funcionalidad de Ficha Rápida Manual (ingreso de atención para clientes sin cuenta registrada) asumen una comisión de <strong>S/ 6.00 (seis soles con 00/100)</strong> por cada registro generado a través de dicha funcionalidad. Esta comisión retribuye el mayor coste operativo de la intermediación sin cuenta digital verificada.
                            </p>
                            <p>
                                Las comisiones son acumuladas en el panel financiero del Profesional bajo la categoría Deuda con Brofy y deberán ser liquidadas periódicamente a través de la pasarela de pago habilitada en la Plataforma. El Profesional acepta expresamente este mecanismo como condición para el uso de dicha funcionalidad.
                            </p>
                        </div>
                    </section>

                    <hr className="border-slate-100" />

                    {/* 7 */}
                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-slate-900">7. Historial Médico Digital y Datos Personales</h2>
                        <div className="space-y-2 text-sm text-slate-700 leading-relaxed">
                            <p>
                                La información clínica de las mascotas registrada en la Plataforma es propiedad del Usuario. Brofy actúa como encargado del tratamiento de dicha información de conformidad con la Ley N.º 29733, Ley de Protección de Datos Personales, y su reglamento.
                            </p>
                            <p>
                                Brofy implementa medidas técnicas y organizativas adecuadas para garantizar la seguridad, integridad y confidencialidad de la información almacenada. El Profesional que ingresa información clínica declara hacerlo bajo su responsabilidad ética y legal como profesional habilitado.
                            </p>
                            <p>
                                La información no será compartida con terceros sin consentimiento del Usuario, salvo mandato judicial expreso o requerimiento de autoridad competente.
                            </p>
                        </div>
                    </section>

                    <hr className="border-slate-100" />

                    {/* 8 */}
                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-slate-900">8. Sistema de Valoraciones</h2>
                        <div className="space-y-2 text-sm text-slate-700 leading-relaxed">
                            <p>
                                Los Usuarios que hayan completado una atención registrada en la Plataforma podrán publicar una valoración del Profesional o establecimiento. Las valoraciones deben reflejar la experiencia personal y veraz del Usuario. Brofy se reserva el derecho de eliminar valoraciones que contengan lenguaje ofensivo, información falsa o que incumplan los presentes T&C.
                            </p>
                            <p>
                                Las valoraciones son visibles públicamente en el perfil del establecimiento. El promedio de valoraciones se calcula automáticamente y refleja el promedio aritmético de todas las valoraciones recibidas.
                            </p>
                        </div>
                    </section>

                    <hr className="border-slate-100" />

                    {/* 9 */}
                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-slate-900">9. Limitación de Responsabilidad</h2>
                        <div className="space-y-2 text-sm text-slate-700 leading-relaxed">
                            <p>En la máxima extensión permitida por la legislación peruana vigente, Brofy no será responsable por daños directos, indirectos, incidentales, especiales o consecuentes derivados de: (i) el uso o imposibilidad de uso de la Plataforma; (ii) el resultado del Acto Médico; (iii) conducta de los Profesionales o Usuarios; (iv) errores u omisiones en el contenido de la Plataforma; o (v) interrupciones del servicio por causas ajenas a Brofy.</p>
                            <p>La responsabilidad máxima de Brofy frente al Usuario, por cualquier concepto, no excederá el monto del Cargo abonado en la transacción que originó el reclamo.</p>
                        </div>
                    </section>

                    <hr className="border-slate-100" />

                    {/* 7a — No Show */}
                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-slate-900">7.A. No-Show e Inasistencia del Usuario</h2>
                        <div className="space-y-2 text-sm text-slate-700 leading-relaxed">
                            <p>
                                El Cargo por Uso de Infraestructura Digital definido en la Cláusula 5 se entiende <strong>íntegramente devengado y percibido</strong> por Brofy en el momento en que los servicios digitales son efectivamente prestados al Usuario, lo que ocurre al generarse el código de atención y confirmarse la agenda en la Plataforma.
                            </p>
                            <p>
                                En consecuencia, la <strong>inasistencia del Usuario</strong> a la cita agendada (no-show) o su decisión voluntaria de no concurrir al local del Profesional <strong>no genera derecho a reembolso, compensación ni devolución</strong> del Cargo, dado que los servicios digitales para los que fue abonado ya fueron íntegramente prestados.
                            </p>
                            <p>
                                Esto no aplica en caso de cancelación del servicio por parte del Profesional, supuesto en el cual Brofy analizará cada caso individualmente y podrá ofrecer un crédito equivalente para una futura reserva.
                            </p>
                        </div>
                    </section>

                    <hr className="border-slate-100" />

                    {/* 9 */}
                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-slate-900">9. Resolución de Disputas y Jurisdicción</h2>
                        <div className="space-y-2 text-sm text-slate-700 leading-relaxed">
                            <p>
                                Cualquier controversia derivada de los presentes T&C será sometida, en primera instancia, a un mecanismo de negociación directa. Si no se alcanza acuerdo en un plazo de 15 días hábiles, la controversia será resuelta por un árbitro único del Centro de Arbitraje de la Cámara de Comercio de Lima, aplicándose el derecho peruano.
                            </p>
                            <p>
                                El Usuario conserva en todo momento su derecho a presentar reclamos ante el INDECOPI de conformidad con el Código de Protección y Defensa del Consumidor (Ley N.º 29571). Para ello, la Plataforma pone a disposición el Libro de Reclamaciones electrónico, accesible en todo momento desde{' '}
                                <Link href="/libro-de-reclamaciones" className="text-primary-600 underline">
                                    brofy.pe/libro-de-reclamaciones
                                </Link>
                                .
                            </p>
                        </div>
                    </section>

                    <hr className="border-slate-100" />

                    {/* 10 */}
                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-slate-900">10. Modificaciones a los Términos</h2>
                        <p className="text-sm text-slate-700 leading-relaxed">
                            Brofy se reserva el derecho de modificar los presentes T&C en cualquier momento. Las modificaciones serán notificadas al Usuario con al menos 15 días de anticipación a través del correo electrónico registrado y/o mediante aviso destacado en la Plataforma. El uso continuado de la Plataforma tras la fecha de vigencia de los T&C modificados constituye aceptación de los nuevos términos.
                        </p>
                    </section>

                    <hr className="border-slate-100" />

                    {/* 11 */}
                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-slate-900">11. Contacto</h2>
                        <p className="text-sm text-slate-700 leading-relaxed">
                            Para consultas sobre los presentes T&C, puede contactarnos en: <strong>legal@brofy.pe</strong>. Para reclamos sobre el servicio, utilice el{' '}
                            <Link href="/libro-de-reclamaciones" className="text-primary-600 underline">
                                Libro de Reclamaciones
                            </Link>
                            .
                        </p>
                    </section>

                    <div className="flex flex-wrap gap-4 pt-4 text-xs text-slate-400 justify-between items-center">
                        <span>© 2026 Brofy S.A.C. — Todos los derechos reservados. Lima, Perú.</span>
                        <div className="flex gap-4">
                            <Link href="/privacidad" className="hover:text-primary-600 transition-colors">Política de Privacidad</Link>
                            <Link href="/libro-de-reclamaciones" className="hover:text-primary-600 transition-colors">Libro de Reclamaciones</Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
