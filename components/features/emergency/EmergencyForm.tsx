"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle } from "lucide-react";

export function EmergencyForm({ onCancel }: { onCancel: () => void }) {
    const [submitted, setSubmitted] = useState(false);

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in-95">
                <div className="bg-green-100 p-3 rounded-full mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">¡Solicitud Enviada!</h3>
                <p className="text-slate-600 mt-2 max-w-xs text-balance">
                    Un especialista de la red Brofy ha recibido tu alerta y te contactará en unos minutos.
                </p>
                <Button onClick={onCancel} className="mt-6" variant="outline">
                    Cerrar
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-in slide-in-from-right-4">
            <div className="bg-yellow-50 text-yellow-800 text-sm p-3 rounded-md flex gap-2 items-start">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>Completa esto solo si no lograste contactar a nadie. Notificaremos a todos los doctores cercanos.</p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-4">
                <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tu Nombre</label>
                    <Input required placeholder="Ej. Ana Pérez" className="mt-1" />
                </div>
                <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Celular de contacto</label>
                    <Input required type="tel" placeholder="Ej. 999 123 456" className="mt-1" />
                </div>
                <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">¿Qué sucede?</label>
                    <Input required placeholder="Ej. Mi perro comió chocolate, está vomitando..." className="mt-1" />
                </div>

                <div className="flex gap-3 pt-2">
                    <Button type="button" variant="ghost" className="flex-1" onClick={onCancel}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="destructive" className="flex-1">
                        Pedir Ayuda
                    </Button>
                </div>
            </form>
        </div>
    );
}
