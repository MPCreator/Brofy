import { getAllUsers, getAllClaims, getAllRemindersAdmin, getAllDisputedAppointments } from '@/lib/actions'
import { requireRole } from '@/lib/auth'
import { Shield, Users, BookOpen, Bell, AlertTriangle } from 'lucide-react'
import { AdminUserList } from './AdminUserList'
import { AdminClaimsList } from './AdminClaimsList'
import { AdminRemindersList } from './AdminRemindersList'
import { AdminDisputesList } from './AdminDisputesList'
import Link from 'next/link'

export default async function AdminDashboard({
    searchParams
}: {
    searchParams?: { tab?: string }
}) {
    const activeTab = searchParams?.tab || 'auditoria'
    await requireRole(['admin'])
    const [users, claims, reminders, disputes] = await Promise.all([
        getAllUsers(),
        getAllClaims(),
        getAllRemindersAdmin(),
        getAllDisputedAppointments(),
    ])

   const adminUsers = users.filter((u: any) => u.role !== 'admin')
    const pendingCmvpVets = adminUsers.filter((u: any) => u.role === 'vet' && u.cmvpId && !u.cmvpValidated)

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

            {/* Tabs Selector */}
            <div className="flex gap-2 border-b border-slate-200">
                <Link
                    href="?tab=auditoria"
                    className={`pb-2.5 px-4 text-sm font-bold border-b-2 transition-colors ${
                        activeTab === 'auditoria'
                            ? 'border-primary-600 text-primary-700'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Auditorías y Disputas ⚖️
                </Link>
                <Link
                    href="?tab=usuarios"
                    className={`pb-2.5 px-4 text-sm font-bold border-b-2 transition-colors ${
                        activeTab === 'usuarios'
                            ? 'border-primary-600 text-primary-700'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Usuarios y Reclamaciones 👥
                </Link>
                <Link
                    href="?tab=campanas"
                    className={`pb-2.5 px-4 text-sm font-bold border-b-2 transition-colors ${
                        activeTab === 'campanas'
                            ? 'border-primary-600 text-primary-700'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Campañas y Alertas 📢
                </Link>
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
                        <AdminClaimsList claims={claims} />
                    </section>
                </div>
            )}

            {/* TAB CONTENT: CAMPANAS Y ALERTAS */}
            {activeTab === 'campanas' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                    {/* Reminders & Global Alerts Section */}
                    <section className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Bell className="w-5 h-5 text-slate-550" /> Recordatorios y Campañas Globales (Push / Anuncios)
                        </h2>
                        <AdminRemindersList initialReminders={reminders} />
                    </section>
                </div>
            )}
        </div>
    )
}
