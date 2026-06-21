'use client'

import { LoadingState } from '@/components/ui/loading-state'

export default function RootLoading() {
    return (
        <LoadingState 
            message="Cargando..." 
            description="Preparando tu experiencia en Brofy"
            minHeight="min-h-[75vh]"
            size="lg"
        />
    )
}
