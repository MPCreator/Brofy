"use client";

import { AlertCircle, Phone, MapPin, X } from "lucide-react";
import { useState, useEffect } from "react";

// Mock data for providers
const MOCK_EMERGENCY_PROVIDERS = [
    {
        id: 1,
        name: "Clínica Veterinaria 24h",
        distance: "0.8 km",
        status: "available",
        phone: "999-999-999",
        address: "Av. Principal 123",
    },
    {
        id: 2,
        name: "PetCare Urgencias",
        distance: "1.5 km",
        status: "busy",
        phone: "888-888-888",
        address: "Calle Secundaria 456",
    },
];

export function EmergencyLauncher() {
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Only show on protected pages (check for session cookie client-side)
    useEffect(() => {
        const hasCookie = document.cookie.includes('session=');
        setIsVisible(hasCookie);
    }, []);

    if (!isVisible) return null;

    return (
        <>
            {/* Floating Action Button — positioned above mobile nav */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 flex items-center gap-2 px-5 py-3.5 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-500 transition-all hover:scale-105 active:scale-95"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                    <div className="relative flex items-center justify-center">
                        <AlertCircle className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-sm tracking-wide">Emergencia</span>
                </button>
            )}

            {/* Emergency Modal — Safari-safe */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

                    {/* Panel */}
                    <div className="relative w-full max-w-md mx-auto bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl animate-in max-h-[80vh] overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                        <div className="sticky top-0 bg-white border-b border-slate-100 p-4 flex items-center justify-between rounded-t-2xl z-10">
                            <h2 className="text-lg font-bold text-slate-900">¿Emergencia Médica?</h2>
                            <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            <div className="bg-red-50 border border-red-100 p-3 rounded-xl text-red-800 text-sm flex gap-3">
                                <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
                                <p>Mantén la calma. Estos especialistas están disponibles para atenderte ahora mismo.</p>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cerca de ti</h3>
                                {MOCK_EMERGENCY_PROVIDERS.map((provider) => (
                                    <div key={provider.id} className="border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:border-red-300 transition-colors">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className="font-bold text-slate-900 text-sm">{provider.name}</h4>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                    provider.status === 'available' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                                }`}>
                                                    {provider.status === 'available' ? 'Disponible' : 'Cupos limitados'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                                <span className="truncate">{provider.distance} · {provider.address}</span>
                                            </div>
                                        </div>
                                        <a
                                            href={`tel:${provider.phone}`}
                                            className="ml-3 w-10 h-10 flex items-center justify-center bg-red-600 text-white rounded-full shadow-md hover:bg-red-500 transition-colors flex-shrink-0"
                                        >
                                            <Phone className="w-4 h-4" />
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
