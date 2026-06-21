'use client'

import { LoadingState } from '@/components/ui/loading-state'

export default function SignupLoading() {
    return (
        <LoadingState 
            message="Cargando registro..." 
            description="Preparando formulario de Brofy"
            minHeight="min-h-screen"
            size="lg"
        />
    )
}
