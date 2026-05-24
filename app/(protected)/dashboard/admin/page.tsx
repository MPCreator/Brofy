import { getAllUsers, getAllClaims, getAllRemindersAdmin } from '@/lib/actions'
import { requireRole } from '@/lib/auth'
import { Shield, Users, BookOpen, Bell } from 'lucide-react'
import { AdminUserList } from './AdminUserList'
import { AdminClaimsList } from './AdminClaimsList'
import { AdminRemindersList } from './AdminRemindersList'

export default async function AdminDashboard() {
    await requireRole(['admin'])
    const [users, claims, reminders] = await Promise.all([
        getAllUsers(),
        getAllClaims(),
        getAllRemindersAdmin(),
    ])

   const adminUsers = users.filter((u: any) => u.role !== 'admin')
    const pendingCmvpVets = adminUsers.filter((u: any) => u.role === 'vet' && u.cmvpId && !u.cmvpValidated)

    return (
        <div className="space-y-8 pb-20 lg:pb-0 max-w-5xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-primary-600" />
                    Panel de Administración
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Gestiona usuarios, valida profesionales y atiende reclamos.
                </p>
            </div>

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
                        <p className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">Profesionales por Auditar:</p>
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

            {/* Reminders & Global Alerts Section */}
            <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-slate-500" /> Recordatorios y Campañas Globales
                </h2>
                <AdminRemindersList initialReminders={reminders} />
            </section>

            {/* Users Section */}
            <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-slate-500" /> Todos los Usuarios
                </h2>
                <AdminUserList users={adminUsers} />
            </section>

            {/* Claims Section */}
            <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-slate-500" /> Libro de Sugerencias y Reclamaciones
                </h2>
                <AdminClaimsList claims={claims} />
            </section>
        </div>
    )
}
