'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Calendar, Briefcase } from 'lucide-react'

const LIMA_DISTRICTS = [
    "Miraflores", "San Isidro", "Santiago de Surco", "San Borja", "Barranco",
    "La Molina", "Jesús María", "Lince", "Magdalena del Mar", "San Miguel",
    "Pueblo Libre", "Surquillo", "San Luis", "La Victoria", "Cercado de Lima",
    "Rímac", "Breña", "Chorrillos", "San Juan de Miraflores", "Villa María del Triunfo",
    "Villa El Salvador", "Ate", "Santa Anita", "El Agustino", "San Juan de Lurigancho",
    "Comas", "Los Olivos", "San Martín de Porres", "Independencia", "Carabayllo",
    "Puente Piedra", "Ancón", "Santa Rosa", "Chaclacayo", "Lurigancho-Chosica",
    "Lurín", "Pachacámac", "San Bartolo", "Punta Hermosa", "Punta Negra",
    "Santa María del Mar", "Pucusana", "Callao", "Bellavista", "Carmen de la Legua",
    "La Perla", "La Punta", "Ventanilla", "Mi Perú"
];

function normalizeString(str: string): string {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function getLevenshteinDistance(a: string, b: string): number {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b[i - 1] === a[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

export default function LandingSearchBar() {
    const router = useRouter()
    const [district, setDistrict] = useState('')
    const [serviceType, setServiceType] = useState('all')
    const [date, setDate] = useState('')
    const [showSuggestions, setShowSuggestions] = useState(false)

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
            <div className="flex-1 px-5 py-2 w-full flex items-center gap-3 relative">
                <MapPin className="w-5 h-5 text-primary-500 shrink-0" />
                <div className="flex-1 min-w-0">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dónde</label>
                    <input 
                        type="text" 
                        value={district}
                        onChange={(e) => {
                            setDistrict(e.target.value);
                            setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        placeholder="Ej. Miraflores, San Isidro, Surco..." 
                        className="w-full text-sm font-semibold text-slate-700 placeholder-slate-400 focus:outline-none bg-transparent mt-0.5"
                    />
                    {showSuggestions && district.trim().length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 max-h-48 overflow-y-auto py-1.5 w-full">
                            {(() => {
                                const normQuery = normalizeString(district);
                                const matches = LIMA_DISTRICTS.filter(dist => {
                                    const normDist = normalizeString(dist);
                                    if (normDist.startsWith(normQuery) || normDist.includes(normQuery)) {
                                        return true;
                                    }
                                    const distance = getLevenshteinDistance(normQuery, normDist);
                                    if (distance <= 2 && normQuery.length >= 4) {
                                        return true;
                                    }
                                    return false;
                                });

                                if (matches.length === 0) {
                                    return (
                                        <div className="px-4 py-2 text-xs text-slate-400 text-center font-medium italic">
                                            Sin sugerencias. Busca libremente.
                                        </div>
                                    );
                                }

                                return matches.map(dist => (
                                    <button
                                        key={dist}
                                        type="button"
                                        onMouseDown={() => {
                                            setDistrict(dist);
                                            setShowSuggestions(false);
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1.5"
                                    >
                                        📍 <span>{dist}</span>
                                    </button>
                                ));
                            })()}
                        </div>
                    )}
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
                        <option value="all">Cualquier local / servicio</option>
                        <option value="clinic">Veterinarias</option>
                        <option value="groomer">Spas & Grooming</option>
                        <option value="walker">Paseadores</option>
                        <option value="lodging">Hospedajes</option>
                        <option value="trainer">Adiestradores</option>
                        <option value="other">Otros locales</option>
                        <option value="emergency">Urgencias 24/7</option>
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
