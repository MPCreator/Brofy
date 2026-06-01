import { Loader2 } from 'lucide-react'

export default function DashboardLoading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in duration-350">
            <div className="relative flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-primary-600 animate-spin" />
                <Loader2 className="w-6 h-6 text-primary-600 animate-pulse absolute" />
            </div>
            <div className="text-center space-y-1">
                <p className="text-sm font-bold text-slate-750">Cargando información...</p>
                <p className="text-xs text-slate-400">Conectando con la base de datos de Brofy</p>
            </div>
        </div>
    )
}
