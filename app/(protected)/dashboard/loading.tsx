'use client'

import { LoadingState } from '@/components/ui/loading-state'

export default function DashboardLoading() {
    return (
        <LoadingState 
            message="Cargando información..." 
            description="Conectando con la base de datos de Brofy"
            minHeight="min-h-[60vh]"
        />
    )
}
