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
                            Última actualización: 28 de mayo de 2026 · Versión 1.1
                        </p>
                    </div>

                    {/* Intro */}
                    <section className="space-y-3 text-slate-700 text-sm leading-relaxed">
                        <p>
                            Bienvenido a <strong>Brofy</strong> (en adelante, la Plataforma o Brofy), un servicio de infraestructura digital desarrollado y operado por <strong>Brofy S.A.C.</strong> (empresa debidamente constituida bajo las leyes de la República del Perú) o por sus respectivas filiales, subsidiarias o empresas operadoras autorizadas en el país de registro del Establecimiento (en adelante, la &quot;Empresa Operadora&quot;). Al acceder o utilizar la Plataforma, el Usuario (en adelante, Usuario, Cliente o Profesional, según corresponda) declara haber leído, comprendido y aceptado íntegramente los presentes Términos y Condiciones de Uso (T&C). Si no está de acuerdo con alguna disposición, deberá abstenerse de utilizar la Plataforma.
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
                            <p><strong>Cargo por Infraestructura:</strong> El pago por servicio (establecido por defecto en S/ 5.00 —cinco soles con 00/100— por cada servicio reservado) que el Cliente abona a Brofy por el uso de la infraestructura digital, intermediación tecnológica y, cuando corresponda por la naturaleza del servicio, la verificación de habilitación profesional, tal como se define en la cláusula 5.</p>
                            <p><strong>Código Único de Huella (CUH):</strong> El identificador único, memorizable y alfanumérico generado por la Plataforma para cada mascota registrada (con formato <code className="font-mono bg-slate-100 px-1 rounded">CUH-XXXXXX</code> con 6 dígitos aleatorios), el cual sirve para identificación digital externa y asociación correcta del historial clínico digital.</p>
                            <p><strong>Huellitas:</strong> El sistema de puntaje de fidelización, incentivos y devoluciones de Brofy otorgado a los Clientes. Las Huellitas se acumulan mediante devoluciones, cancelaciones y reembolsos validados administrativamente conforme a los presentes T&C (incluyendo inasistencias de proveedores, desacuerdos por alza de tarifas o disputas por incumplimiento parcial). La equivalencia interna de las Huellitas es de 100 Huellitas equivalentes a S/ 1.00 (de modo que 500 Huellitas equivalen a S/ 5.00).</p>
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

                    {/* 3.A */}
                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-slate-900">3.A. Seguridad de Acceso y Política de Intentos Fallidos</h2>
                        <div className="space-y-2 text-sm text-slate-700 leading-relaxed">
                            <p>
                                La Plataforma implementa un mecanismo de protección contra accesos no autorizados. Tras <strong>cinco (5) intentos fallidos consecutivos</strong> de inicio de sesión, la cuenta del Usuario será bloqueada temporalmente por un periodo de <strong>quince (15) minutos</strong>.
                            </p>
                            <p>
                                Este mecanismo tiene como finalidad prevenir ataques de fuerza bruta y proteger la información sensible del Usuario, sus mascotas y su historial clínico. El Usuario será notificado de los intentos restantes en cada fallo de autenticación.
                            </p>
                            <p>
                                Si el Usuario olvida su contraseña, podrá utilizar el mecanismo de recuperación de contraseña disponible en la pantalla de inicio de sesión.
                            </p>
                        </div>
                    </section>

                    <hr className="border-slate-100" />

                    {/* 3.B */}
                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-slate-900">3.B. Aplicación Web Progresiva (PWA) e Instalación de Aplicación</h2>
                        <div className="space-y-2 text-sm text-slate-700 leading-relaxed">
                            <p>
                                La Plataforma provee compatibilidad de <strong>Aplicación Web Progresiva (PWA)</strong>, permitiendo al Usuario instalar Brofy directamente en la pantalla de inicio de su dispositivo móvil (iOS y Android) u ordenador (Windows y macOS) para un acceso standalone similar a una app nativa.
                            </p>
                            <p>
                                Para el óptimo funcionamiento y prestación del Servicio Digital a través del formato PWA, la aplicación requiere permisos consentidos del dispositivo, incluyendo: (i) geolocalización (a fin de localizar y mapear establecimientos cercanos en el descubrimiento), y (ii) acceso a la cámara del dispositivo (a fin de habilitar el escaneo del código QR físico para iniciar la atención). El Usuario tiene plena facultad de otorgar, denegar o revocar dichos permisos en cualquier momento desde la configuración de su navegador u sistema operativo.
                            </p>
                        </div>
                    </section>

                    <hr className="border-slate-100" />

                    {/* 3.C */}
                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-slate-900">3.C. Registro de Personal y Especialistas por los Establecimientos</h2>
                        <div className="space-y-2 text-sm text-slate-700 leading-relaxed">
                            <p>
                                Los Profesionales que administren un establecimiento (Clínica u Hospital) tienen la facultad de registrar internamente en su panel una lista de especialistas, doctores o asistentes (en adelante, los Especialistas) que forman parte de su staff, con el fin de seleccionarlos al emitir recetas y completar fichas clínicas.
                            </p>
                            <p>
                                El Profesional y el establecimiento declaran y garantizan bajo juramento que todo Especialista registrado en su panel cuenta con la habilitación legal y autorizaciones administrativas correspondientes. Específicamente, (i) para Especialistas que realicen Actos Médicos, deben contar con la colegiatura o matrícula profesional vigente de ley (como el CMVP en el caso de la República del Perú, o el registro oficial habilitante equivalente del país de prestación del servicio); y (ii) para personal de cuidado, estética, adiestramiento o paseo (como groomers, bañadores o paseadores), deben contar con la idoneidad, capacitación y permisos requeridos para dicha actividad, quedando exentos de la colegiatura profesional al no ser exigida legalmente por su especialidad.
                            </p>
                            <p className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-900 font-medium">
                                ⚖️ RESPONSABILIDAD EXCLUSIVA: La validación y verificación de la identidad, idoneidad y estatus del staff de Especialistas recae exclusivamente sobre el Profesional administrador del local. Brofy no valida individualmente a los Especialistas añadidos de forma interna por los establecimientos. Toda mala praxis, negligencia o usurpación de funciones por parte de especialistas no habilitados es de exclusiva responsabilidad civil y penal del establecimiento y del médico tratante, eximiendo a Brofy de toda responsabilidad.
                            </p>
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
                                    El pago de <strong>S/ 5.00 (cinco soles con 00/100)</strong> —o el monto total proporcional acumulado de conformidad con la cláusula 5.B en caso de reservas multi-servicio— que el Usuario abona al momento de registrar su agenda en la Plataforma constituye, en su totalidad e integridad, un <strong>Cargo por Uso de Infraestructura Digital, Intermediación Tecnológica y Verificación de Habilitación Profesional</strong> (en adelante, el Cargo).
                                </p>
                                <p>
                                    Este Cargo retribuye, de manera exclusiva y excluyente, los siguientes servicios digitales prestados por Brofy al Usuario:
                                </p>
                                <ul className="list-disc list-inside space-y-1 pl-2">
                                    <li>El uso de la infraestructura tecnológica de la Plataforma (servidores, bases de datos, API, interfaces).</li>
                                    <li>El servicio de intermediación tecnológica que conecta al Usuario con el directorio de Profesionales habilitados.</li>
                                    <li>La verificación digital del estado de habilitación profesional del titular del establecimiento seleccionado (consulta del registro público o colegiatura colegiada oficial correspondiente del país de operación, como el CMVP en el Perú, únicamente para servicios de naturaleza médica veterinaria, clínicas u hospitales veterinarios), quedando expresamente excluido de dicha verificación el personal o especialistas independientes registrados de forma interna por el propio establecimiento, conforme a lo establecido en la cláusula 3.C.</li>
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

                    {/* 5.A */}
                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-slate-900">5.A. Programa de Fidelización &quot;Huellitas&quot; y Código Único de Huella (CUH) de Mascotas</h2>
                        <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
                            <p>
                                Con el fin de recompensar la lealtad de los Usuarios y proveer un mecanismo digital eficiente de devolución, la Plataforma cuenta con el sistema de incentivos **Huellitas**.
                            </p>
                            <p>
                                Cada mascota registrada en la Plataforma recibe de manera automática y gratuita un **Código Único de Huella (CUH)**. Este identificador es ajeno e independiente del ID técnico de la base de datos de la Plataforma, y ha sido diseñado específicamente con una longitud y formato fácil de memorizar y transcribir por el Usuario. El CUH habilita la identificación digital de la mascota en establecimientos externos y la sincronización correcta de su Carnet de Vacunación e Historial Clínico.
                            </p>
                            <p className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium">
                                🆔 UNICIDAD DE IDENTIDAD: El CUH funciona como un número de identidad único e intransferible para cada mascota. Está estrictamente prohibido falsificar, clonar, simular o asociar el CUH de una mascota a otra distinta. El uso fraudulento o indebido del CUH para falsear el historial médico o evadir responsabilidades administrativas en la plataforma resultará en la suspensión permanente de la cuenta del Usuario.
                            </p>
                            <p>
                                Por su parte, la billetera digital del Cliente reflejará sus créditos en puntos **Huellitas** a una tasa de conversión de **100 Huellitas = S/ 1.00** (de esta forma, 500 Huellitas equivalen exactamente a S/ 5.00). Las Huellitas acumuladas en la cuenta del Cliente por concepto de devoluciones, reembolsos o promociones de lealtad podrán ser utilizadas libremente para el pago del Cargo por Uso de Infraestructura al agendar nuevas citas en la Plataforma.
                            </p>
                        </div>
                    </section>

                    <hr className="border-slate-100" />

                    {/* 5.B */}
                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-slate-900">5.B. Reserva Multi-Servicio y Cargos Proporcionales</h2>
                        <div className="space-y-2 text-sm text-slate-700 leading-relaxed">
                            <p>
                                La Plataforma permite al Usuario seleccionar múltiples servicios en una sola reserva. Cada servicio seleccionado incrementa el Cargo por Uso de Infraestructura Digital en <strong>S/ 5.00 (cinco soles con 00/100) adicionales</strong> por cada servicio extra agregado al turno.
                            </p>
                            <p>
                                Este incremento proporcional retribuye el mayor coste de gestión, coordinación de tiempos, validación de cruces de horarios y verificación de disponibilidad que demanda un turno multi-servicio frente a un turno simple.
                            </p>
                            <p>
                                La duración total del turno será la suma de las duraciones individuales de cada servicio seleccionado, y el sistema de prevención de solapamientos verificará que la capacidad del establecimiento pueda absorber el bloque completo.
                            </p>
                        </div>
                    </section>

                    <hr className="border-slate-100" />

                    {/* 5.C */}
                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-slate-900">5.C. Pasarelas de Pago Externas y Seguridad de Transacciones</h2>
                        <div className="space-y-2 text-sm text-slate-700 leading-relaxed">
                            <p>
                                La Plataforma Brofy delega la recaudación y procesamiento de pagos digitales a procesadores y pasarelas de pago de terceros debidamente reguladas y certificadas (como **Izipay**). 
                            </p>
                            <p>
                                Brofy no almacena, transmite ni procesa en sus servidores locales datos de tarjetas bancarias (como números de tarjeta, códigos CVV o fechas de vencimiento). Todas las transacciones se efectúan directamente a través de los entornos securizados de las pasarelas bancarias externas.
                            </p>
                            <p>
                                Por consiguiente, Brofy se exime de cualquier responsabilidad civil por caídas de sistema, fallas operativas de las pasarelas, transacciones denegadas o cargos no reconocidos surgidos en el ámbito técnico de estos procesadores de pago externos. Toda aclaración o disputa transaccional deberá gestionarse ante el emisor de la tarjeta y la pasarela emisora.
                            </p>
                        </div>
                    </section>

                    <hr className="border-slate-100" />

                    {/* 5.D */}
                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-slate-900">5.D. Incumplimiento Parcial o Reprogramación Parcial de Servicios en Reserva Multi-Servicio</h2>
                        <div className="space-y-2 text-sm text-slate-700 leading-relaxed">
                            <p>
                                En el caso de reservas multi-servicio que hayan sido validadas mediante el código OTP e iniciadas, pero en las cuales el Profesional o establecimiento **se vea imposibilitado de completar la totalidad de los servicios agendados** en dicha sesión (por ejemplo, por falta de tiempo material, fatiga de la mascota, o emergencias del establecimiento), se aplicará el siguiente procedimiento de reprogramación y protección:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-slate-650 pl-2">
                                <li><strong>Propuesta de Reprogramación Directa y Gratuita:</strong> El Profesional está obligado a coordinar directamente y proponer al Cliente un turno de reprogramación exclusivo para los servicios que quedaron pendientes de ejecución. **Esta reprogramación se realizará a coste cero para el Cliente**, quedando Brofy exenta de cobrar una nueva comisión o Cargo por Uso de Infraestructura por este nuevo turno fraccionado, al entenderse ya liquidada en la reserva original.</li>
                                <li><strong>Procedimiento de Registro por el Profesional:</strong> Para formalizar esta reprogramación de servicios pendientes sin que se apliquen cargos adicionales, el Profesional deberá registrar el nuevo turno complementario en coordinación directa con el soporte de Brofy o mediante las herramientas específicas de agenda gratuita provistas para compensación de fallos de servicio.</li>
                                <li><strong>Derecho a Disputa Parcial y Devolución Proporcional:</strong> En caso de que el Profesional no ofrezca una fecha idónea o el Cliente no preste su conformidad para la reprogramación del servicio pendiente, el Cliente podrá registrar una Denuncia Parcial dentro de las 24 horas. El Administrador de Brofy auditará el caso y reembolsará al Cliente la porción correspondiente del Cargo de Infraestructura en puntos **Huellitas** (ej: 500 Huellitas reembolsadas si el servicio principal cancelado representaba la comisión pagada), aplicando las sanciones correspondientes al Profesional por incumplimiento de agenda.</li>
                            </ul>
                        </div>
                    </section>

                    <hr className="border-slate-100" />

                    {/* 5.E */}
                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-slate-900">5.E. Política de Tarifarios de Servicios y Modificaciones de Precios</h2>
                        <div className="space-y-2 text-sm text-slate-700 leading-relaxed">
                            <p>
                                Los Profesionales y establecimientos tienen plena libertad e independencia comercial para definir, modificar y actualizar las tarifas de sus propios servicios en la Plataforma en cualquier momento. **Brofy no interviene ni impone precios sobre los servicios ofrecidos por los proveedores.**
                            </p>
                            <p>
                                En resguardo de los derechos y el consentimiento de ambas partes, cuando un Profesional actualice el precio de un servicio que ya ha sido previamente reservado por un Cliente (alza de tarifa), se aplicará el siguiente procedimiento de transparencia obligatoria:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-slate-650 pl-2">
                                <li><strong>Anuncio y Notificación de Alza:</strong> La Plataforma notificará inmediatamente al Cliente que posee una reserva activa sobre la actualización de la tarifa, indicando de forma explícita el precio anterior y el nuevo precio fijado por el establecimiento.</li>
                                <li><strong>Opción de Continuidad (Aceptación):</strong> El Cliente podrá otorgar su expreso consentimiento para continuar con el servicio aceptando la nueva tarifa fijada, lo que actualizará el costo final de la cita en su panel.</li>
                                <li><strong>Opción de Cancelación sin Penalidad (Reembolso de Comisión):</strong> En caso de no estar de acuerdo con el alza de precio, el Cliente tendrá el derecho indisputable de **cancelar la reserva a coste cero**. Al ejercer esta cancelación, Brofy reembolsará de manera inmediata el 100% del Cargo por Uso de Infraestructura en puntos **Huellitas** a la billetera digital del Cliente (S/ 5.00 acreditados como 500 Huellitas) para su uso en futuras reservas, quedando liberado de cualquier compromiso de pago de honorarios frente al proveedor.</li>
                            </ul>
                        </div>
                    </section>

                    <hr className="border-slate-100" />

                    {/* 5.F */}
                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-slate-900">5.F. Política de Reprogramación Bidireccional de Turnos Sin Costo de Plataforma</h2>
                        <div className="space-y-2 text-sm text-slate-700 leading-relaxed">
                            <p>
                                La Plataforma implementa una funcionalidad de <strong>Reprogramación Bidireccional</strong> que permite a los Usuarios (Clientes) y Profesionales proponer un cambio en la fecha y/o la hora de una cita confirmada, sin necesidad de cancelar la reserva ni abonar nuevamente el Cargo por Uso de Infraestructura.
                            </p>
                            <p>
                                Esta reprogramación está sujeta a las siguientes reglas de aceptación y consentimiento mutuo:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-slate-650 pl-2">
                                <li><strong>Propuesta de Cambio:</strong> Cualquier parte (Cliente o Profesional) puede proponer una nueva fecha u hora para el turno a través de su panel personal. La Plataforma enviará una notificación inmediata a la otra parte detallando la propuesta.</li>
                                <li><strong>Consentimiento y Activación:</strong> La reprogramación solo se formalizará y surtirá efecto en la agenda una vez que la contraparte **acepte expresamente** la propuesta de cambio en su pestaña de citas pendientes.</li>
                                <li><strong>Gratuidad de la Reprogramación:</strong> Una vez aceptado el cambio por ambas partes, la cita se actualizará en la agenda tecnológica sin ningún cobro adicional de comisión de Brofy ni para el Cliente ni para el Profesional, manteniéndose el mismo Cargo por Infraestructura liquidado en la reserva original.</li>
                                <li><strong>Rechazo o Falta de Acuerdo:</strong> En caso de que la contraparte rechace la propuesta o no responda antes de la hora original del turno, la reserva original se mantendrá vigente bajo las condiciones pactadas al inicio. Si alguna de las partes no puede concurrir y la cita se ve frustrada, se aplicarán las políticas de inasistencia (No-Show) detalladas en la cláusula 7.A.</li>
                            </ul>
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
                                La información clínica de las mascotas registrada en la Plataforma es propiedad del Usuario. Brofy actúa como encargado del tratamiento de dicha información de conformidad con la ley de protección de datos personales aplicable en el país de registro del usuario (como la Ley N.º 29733 en el Perú, la Ley Federal de Protección de Datos Personales en Posesión de los Particulares en México, o normativas equivalentes en el territorio de operación) y sus reglamentos.
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

                    {/* 7.A — No Show & Audited Dispute Flow */}
                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-slate-900">7.A. Inasistencias de Proveedores, No-Show de Usuarios y Flujo de Auditoría Administrativa de Denuncias</h2>
                        <div className="space-y-2 text-sm text-slate-700 leading-relaxed">
                            <p>
                                El Cargo por Uso de Infraestructura Digital definido en la Cláusula 5 se entiende <strong>íntegramente devengado y percibido</strong> por Brofy en el momento en que los servicios digitales son efectivamente prestados al Usuario, lo que ocurre al generarse el código de atención y confirmarse la agenda en la Plataforma.
                            </p>
                            <p>
                                En consecuencia, la <strong>inasistencia del Usuario</strong> a la cita agendada (no-show) o su decisión voluntaria de no concurrir al local del Profesional <strong>no genera derecho a reembolso, compensación ni devolución</strong> del Cargo.
                            </p>
                            <p>
                                Sin perjuicio de lo anterior, si la inasistencia o incumplimiento es responsabilidad directa del Profesional o establecimiento seleccionado, el Cliente podrá registrar una denuncia o reporte de inasistencia (&quot;Denuncia&quot;) a través de la Plataforma dentro de las 24 horas posteriores a la cita. La opción de registrar una Denuncia estará habilitada en el panel del Cliente a partir de los <strong>quince (15) minutos</strong> de tolerancia posteriores a la hora pactada de la cita, otorgando dicho periodo de gracia al establecimiento para absorber demoras menores ajenas al control operativo.
                            </p>
                            <p className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-900 font-medium">
                                ⚖️ PROCESO DE AUDITORÍA: Las denuncias por inasistencia ya no se reembolsan de manera automática. Al presentarse una Denuncia, la cita cambiará a estado &quot;En Disputa&quot; (disputed). El Administrador de Brofy auditará el caso recabando información de ambas partes y resolverá con criterio justo:
                                <br />
                                1. <strong>A favor del Cliente:</strong> Se constata el incumplimiento del Profesional. Se cancelará definitivamente la cita y se reembolsará el 100% de la comisión en puntos **Huellitas** a la cuenta del Cliente (S/ 5.00 devueltos como 500 Huellitas). Adicionalmente, Brofy se reserva el derecho de aplicar sanciones administrativas o advertencias al Profesional.
                                <br />
                                2. <strong>A favor del Proveedor:</strong> Se constata que el Profesional estuvo disponible pero el Cliente incurrió en inasistencia (no-show). Se desestimará el reclamo sin otorgar reembolsos en Huellitas.
                            </p>
                        </div>
                    </section>

                    <hr className="border-slate-100" />

                    {/* 7.B — Cloudinary Image Moderation & Ownership */}
                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-slate-900">7.B. Carga de Imágenes, Propiedad Intelectual y Moderación de Contenido</h2>
                        <div className="space-y-2 text-sm text-slate-700 leading-relaxed">
                            <p>
                                La Plataforma permite tanto a los Clientes como a los Profesionales subir imágenes (fotografías de mascotas, fotos de locales, logotipos de establecimientos, perfiles personales, entre otros). 
                            </p>
                            <p>
                                El Usuario y el Profesional declaran bajo juramento ser titulares absolutos de los derechos de propiedad intelectual y de imagen sobre las fotos que cargan en la Plataforma, o en su defecto poseer la autorización expresa del titular legítimo. 
                            </p>
                            <p>
                                Queda terminantemente prohibido subir, compartir o enlazar imágenes que contengan material ofensivo, violento, pornográfico, racista, difamatorio, que infrinjan derechos de autor de terceros o que vulneren la privacidad de las personas.
                            </p>
                            <p className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-red-950 font-medium">
                                🚫 POLÍTICA DE ELIMINACIÓN Y MODERACIÓN: Brofy utiliza servicios de almacenamiento en la nube externos (como **Cloudinary**) para la gestión e indexación de archivos. Brofy se reserva el derecho absoluto de auditar, moderar y eliminar de forma inmediata, definitiva y sin previo aviso cualquier imagen cargada que incumpla estas políticas, que sea reportada por la comunidad o que sea considerada no adecuada para la plataforma. El desacato reiterado de esta cláusula resultará en la cancelación irrevocable de la cuenta del infractor.
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

                    {/* 10 */}
                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-slate-900">10. Resolución de Disputas y Jurisdicción</h2>
                        <div className="space-y-2 text-sm text-slate-700 leading-relaxed">
                            <p>
                                Cualquier controversia derivada de los presentes T&C será sometida, en primera instancia, a un mecanismo de negociación directa. Si no se alcanza acuerdo en un plazo de 15 días hábiles, la controversia será resuelta por arbitraje o por los tribunales competentes de la ciudad sede de la Empresa Operadora en el país de registro del Establecimiento donde se contrató el servicio, aplicándose el derecho local correspondiente. En el caso específico de Perú, será resuelta por un árbitro único del Centro de Arbitraje de la Cámara de Comercio de Lima, aplicándose el derecho peruano.
                            </p>
                            <p>
                                El Usuario conserva en todo momento su derecho a presentar reclamos ante la autoridad nacional de protección al consumidor competente de su jurisdicción (como el INDECOPI de conformidad con el Código de Protección y Defensa del Consumidor en el caso de la República del Perú). Para los usuarios locales, la Plataforma pone a disposición el Libro de Reclamaciones electrónico de acuerdo a la normativa vigente, accesible en todo momento desde{' '}
                                <Link href="/libro-de-reclamaciones" className="text-primary-600 underline">
                                    brofy.pe/libro-de-reclamaciones
                                </Link>
                                .
                            </p>
                        </div>
                    </section>

                    <hr className="border-slate-100" />

                    {/* 11 */}
                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-slate-900">11. Modificaciones a los Términos</h2>
                        <p className="text-sm text-slate-700 leading-relaxed">
                            Brofy se reserva el derecho de modificar los presentes T&C en cualquier momento. Las modificaciones serán notificadas al Usuario con al menos 15 días de anticipación a través del correo electrónico registrado y/o mediante aviso destacado en la Plataforma. El uso continuado de la Plataforma tras la fecha de vigencia de los T&C modificados constituye aceptación de los nuevos términos.
                        </p>
                    </section>

                    <hr className="border-slate-100" />

                    {/* 12 */}
                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-slate-900">12. Contacto</h2>
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