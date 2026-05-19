import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

/**
 * Dashboard index — redirects to role-specific dashboard
 */
export default async function DashboardPage() {
    const session = await getSession()

    if (!session) {
        redirect('/login')
    }

    if (session.role === 'client') {
        redirect('/dashboard/client')
    } else if (session.role === 'admin') {
        redirect('/dashboard/admin')
    } else {
        redirect('/dashboard/vet')
    }
}
