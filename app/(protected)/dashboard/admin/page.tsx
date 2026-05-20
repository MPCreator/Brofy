export const dynamic = 'force-dynamic'
import { getAllUsers, getAllClaims } from '@/lib/actions'
import { requireRole } from '@/lib/auth'
import { Shield, Users, BookOpen } from 'lucide-react'
import { AdminUserList } from './AdminUserList'
import { AdminClaimsList } from './AdminClaimsList'

export default async function AdminDashboard() {
    await requireRole(['admin'])
    const users = await getAllUsers()
    const claims = await getAllClaims()

    const adminUsers = users.filter(u => u.role !== 'admin')

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
