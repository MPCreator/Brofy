'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Calendar, Briefcase } from 'lucide-react'

export default function LandingSearchBar() {
    const router = useRouter()
    const [district, setDistrict] = useState('')
    const [serviceType, setServiceType] = useState('all')
    const [date, setDate] = useState('')

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        const params = new URLSearchParams()
        if (district.trim()) params.set('district', district.trim())
        if (serviceType && serviceType !== 'all') params.set('type', serviceType)
        if (date) params.set('date', date)
        
        router.push(`/discover?${params.toString()}`)
    }

    return (
        <form 
            onSubmit={handleSearch}
            className="w-full bg-white border border-slate-200/80 shadow-xl shadow-slate-100 rounded-3xl md:rounded-full p-2.5 flex flex-col md:flex-row items-center max-w-4xl mx-auto space-y-3 md:space-y-0 divide-y md:divide-y-0 md:divide-x divide-slate-100 text-left border-slate-200/60"
        >
            {/* Dónde */}
            <div className="flex-1 px-5 py-2 w-full flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary-500 shrink-0" />
                <div className="flex-1 min-w-0">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dónde</label>
                    <input 
                        type="text" 
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder="Ej. Miraflores, San Isidro, Surco..." 
                        className="w-full text-sm font-semibold text-slate-700 placeholder-slate-400 focus:outline-none bg-transparent mt-0.5"
                    />
                </div>
            </div>

            {/* Servicio */}
            <div className="flex-1 px-5 py-2 w-full flex items-center gap-3 relative">
                <Briefcase className="w-5 h-5 text-primary-500 shrink-0" />
                <div className="flex-1 min-w-0 pr-4">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">¿Qué necesita?</label>
                    <select 
                        value={serviceType}
                        onChange={(e) => setServiceType(e.target.value)}
                        className="w-full text-sm font-semibold text-slate-700 focus:outline-none bg-transparent appearance-none cursor-pointer mt-0.5 pr-2"
                    >
                        <option value="all">Cualquier servicio</option>
                        <option value="clinic">Consulta Veterinaria</option>
                        <option value="groomer">Spa y Peluquería</option>
                        <option value="walker">Paseadores de Mascotas</option>
                        <option value="hospital">Hospedaje Canino/Felino</option>
                    </select>
                </div>
                <span className="absolute right-6 bottom-4 text-xs text-slate-400 pointer-events-none">▼</span>
            </div>

            {/* Fecha */}
            <div className="flex-1 px-5 py-2 w-full flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary-500 shrink-0" />
                <div className="flex-1 min-w-0">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">¿Cuándo?</label>
                    <input 
                        type="date" 
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full text-sm font-semibold text-slate-700 focus:outline-none bg-transparent mt-0.5 cursor-pointer text-slate-500"
                    />
                </div>
            </div>

            {/* Botón Buscar */}
            <div className="pl-2 pr-2 py-1 w-full md:w-auto flex justify-end">
                <button 
                    type="submit"
                    className="w-full md:w-auto bg-primary-600 text-white font-bold text-sm px-8 py-4 rounded-2xl md:rounded-full hover:bg-primary-700 hover:shadow-lg active:scale-95 transition-all flex items-center justify-center space-x-2 shrink-0 shadow-md shadow-primary-200"
                >
                    <Search className="w-4 h-4 shrink-0" />
                    <span>Descubrir</span>
                </button>
            </div>
        </form>
    )
}
