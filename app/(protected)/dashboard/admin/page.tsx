import { getAllUsers, getAllClaims, getAllRemindersAdmin, getAllDisputedAppointments, getAuditLogs, getAdminFinanceData, getMarchaBlancaSetting, getPendingCmvpVets } from '@/lib/actions'
import { requireRole } from '@/lib/auth'
import { AdminMarchaBlanca } from './AdminMarchaBlanca'
import { Shield, Users, BookOpen, Bell, AlertTriangle, FileSpreadsheet, Receipt, CalendarDays, Mail, Phone, MessageSquare, DollarSign, CheckCircle2 } from 'lucide-react'
import { formatPEN } from '@/lib/utils'
import { AdminUserList } from './AdminUserList'
import { AdminClaimsList } from './AdminClaimsList'
import { AdminArcoList } from './AdminArcoList'
import { AdminRemindersList } from './AdminRemindersList'
import { AdminDisputesList } from './AdminDisputesList'
import { AdminAuditLog } from './AdminAuditLog'
import Link from 'next/link'
import { AdminFinanceDashboard } from './AdminFinanceDashboard'
import { AdminFinanceRow } from './AdminFinanceRow'

export default async function AdminDashboard({
    searchParams
}: {
    searchParams?: { tab?: string }
}) {
    const activeTab = searchParams?.tab || 'auditoria'
    await requireRole(['admin'])

    let pendingCmvpVets: any[] = []
    let disputes: any[] = []
    let adminUsers: any[] = []
    let claimsLibro: any[] = []
    let arcoRequests: any[] = []
    let marchaBlancaSetting: any = null
    let reminders: any[] = []
    let auditLogs: any[] = []
    let financeData = { appointments: [] as any[], providersDebt: [] as any[], totalOnlineCount: 0, totalWalkinCount: 0 }

    if (activeTab === 'auditoria') {
        disputes = await getAllDisputedAppointments()
        pendingCmvpVets = await getPendingCmvpVets()
    } else if (activeTab === 'usuarios') {
        const users = await getAllUsers()
        adminUsers = users.filter((u: any) => u.role !== 'admin')
        const claims = await getAllClaims()
        claimsLibro = claims.filter((c: any) => c.claimType === 'queja' || c.claimType === 'reclamo')
        arcoRequests = claims.filter((c: any) => c.claimType.startsWith('arco_'))
    } else if (activeTab === 'campanas') {
        marchaBlancaSetting = await getMarchaBlancaSetting()
        reminders = await getAllRemindersAdmin()
    } else if (activeTab === 'finanzas') {
        financeData = await getAdminFinanceData()
    } else if (activeTab === 'bitacora') {
        auditLogs = await getAuditLogs()
    }

    return (
        <div className="space-y-6 pb-20 lg:pb-0 max-w-5xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-primary-600" />
                    Panel de Administración
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Gestiona usuarios, valida profesionales y atiende reclamos de inasistencia.
                </p>
            </div>

            {/* TAB CONTENT: AUDITORIAS Y DISPUTAS */}
            {activeTab === 'auditoria' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                    {/* CMVP Verification Pending Audits Alert */}
                    {pendingCmvpVets.length > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 space-y-3 shadow-sm animate-in">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-lg">
                                    🩺
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-amber-900">Auditoría Pendiente de Colegiaturas CMVP</h4>
                                    <p className="text-xs text-amber-700">Tienes {pendingCmvpVets.length} profesional(es) esperando validación de firma y colegiatura vigente.</p>
                                </div>
                            </div>
                            <div className="bg-white/80 rounded-2xl p-3 border border-amber-100/50 space-y-2">
                                <p className="text-[11px] font-semibold text-amber-805 uppercase tracking-wider">Profesionales por Auditar:</p>
                                <div className="divide-y divide-amber-100/30">
                                    {pendingCmvpVets.map((vet: any) => (
                                        <div key={vet.id} className="py-2 flex items-center justify-between text-xs">
                                            <div>
                                                <span className="font-bold text-slate-800">{vet.fullName}</span>
                                                <span className="text-slate-500 font-mono ml-2">CMVP: {vet.cmvpId}</span>
                                            </div>
                                            <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-full uppercase">
                                                Esperando Auditoría
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Disputes and Claims Validation Section */}
                    <section className="bg-slate-50 border border-slate-200/60 rounded-3xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-550" /> Auditoría de Citas en Disputa (Inasistencias)
                        </h2>
                        <AdminDisputesList initialAppointments={disputes} />
                    </section>
                </div>
            )}

            {/* TAB CONTENT: USUARIOS Y SUGERENCIAS */}
            {activeTab === 'usuarios' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                    {/* Users Section */}
                    <section className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-slate-500" /> Todos los Usuarios Registrados
                        </h2>
                        <AdminUserList users={adminUsers} />
                    </section>

                    {/* Claims Section */}
                    <section className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-slate-500" /> Libro de Sugerencias y Reclamaciones
                        </h2>
                        <AdminClaimsList claims={claimsLibro} />
                    </section>

                    {/* ARCO Requests Section */}
                    <section className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-primary-600" /> Solicitudes de Derechos ARCO (LPDP N.º 29733)
                        </h2>
                        <AdminArcoList claims={arcoRequests} />
                    </section>
                </div>
            )}

            {/* TAB CONTENT: CAMPANAS Y ALERTAS */}
            {activeTab === 'campanas' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                    {/* Marcha Blanca Config Card */}
                    <AdminMarchaBlanca initialSetting={marchaBlancaSetting} />

                    {/* Reminders & Global Alerts Section */}
                    <section className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Bell className="w-5 h-5 text-slate-550" /> Recordatorios y Campañas Globales (Push / Anuncios)
                        </h2>
                        <AdminRemindersList initialReminders={reminders} />
                    </section>
                </div>
            )}

            {/* TAB CONTENT: FINANZAS Y LIQUIDACION */}
            {activeTab === 'finanzas' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Comisiones Pendientes</span>
                            <p className="text-2xl font-black text-rose-600">
                                {formatPEN(financeData.providersDebt.reduce((sum, p) => sum + p.pendingDebt, 0))}
                            </p>
                            <span className="text-[10px] text-rose-500 font-medium">Por cobrar a proveedores</span>
                        </div>
                        <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Comisiones Cobradas</span>
                            <p className="text-2xl font-black text-emerald-600">
                                {formatPEN(financeData.providersDebt.reduce((sum, p) => sum + p.paidDebt, 0))}
                            </p>
                            <span className="text-[10px] text-emerald-500 font-medium">Pagos recibidos del mes</span>
                        </div>
                        <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Citas Online (S/ 5.00)</span>
                            <p className="text-2xl font-black text-slate-900">
                                {financeData.totalOnlineCount}
                            </p>
                            <span className="text-[10px] text-slate-500 font-medium">Reservas vía app</span>
                        </div>
                        <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Fichas Rápidas (S/ 6.00)</span>
                            <p className="text-2xl font-black text-slate-900">
                                {financeData.totalWalkinCount}
                            </p>
                            <span className="text-[10px] text-slate-500 font-medium">Registros manuales</span>
                        </div>
                    </div>

                    {/* Providers with Debt Table */}
                    <section className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Receipt className="w-5 h-5 text-primary-600" />
                                Estado de Cuentas de Proveedores
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">Contacta a los veterinarios/locales para recordar el pago de comisiones pendientes y emitir sus boletas.</p>
                        </div>

                        {financeData.providersDebt.length === 0 ? (
                            <div className="text-center py-8 text-slate-500 border border-dashed border-slate-200 rounded-2xl">
                                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                                <p className="text-sm font-semibold">Todos los proveedores están al día</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                                            <th className="pb-3">Proveedor / Establecimiento</th>
                                            <th className="pb-3">Contacto</th>
                                            <th className="pb-3 text-right text-rose-500">Deuda (Pendiente)</th>
                                            <th className="pb-3 text-right text-amber-600">Por Facturar</th>
                                            <th className="pb-3 text-right text-emerald-600">Facturado (Enviado)</th>
                                            <th className="pb-3 text-center">Acciones de Cobro</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {financeData.providersDebt.map((p) => (
                                            <AdminFinanceRow key={p.id} provider={p} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                    {/* Bookings log (Simple appointments log for billing) */}
                    <AdminFinanceDashboard appointments={financeData.appointments} />
                </div>
            )}

            {/* TAB CONTENT: BITACORA DE AUDITORIA */}
            {activeTab === 'bitacora' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                    <section className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <FileSpreadsheet className="w-5 h-5 text-slate-550" /> Bitácora de Auditoría y Control de Seguridad
                        </h2>
                        <AdminAuditLog logs={auditLogs} />
                    </section>
                </div>
            )}
        </div>
    )
}
