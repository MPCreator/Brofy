'use client'

import { LoadingState } from '@/components/ui/loading-state'

export default function LoginLoading() {
    return (
        <LoadingState 
            message="Cargando ingreso..." 
            description="Preparando inicio de sesión de Brofy"
            minHeight="min-h-screen"
            size="lg"
        />
    )
}
