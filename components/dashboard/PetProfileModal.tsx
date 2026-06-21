"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getPetClinicalHistory } from "@/lib/actions";
import { PawPrint, Calendar, Weight, User, Phone, FileText, Loader2, AlertCircle, ShieldAlert, Sparkles, Heart } from "lucide-react";
import SafeImage from "@/components/ui/SafeImage";
import { SPECIES_LABELS } from "@/lib/types";

interface PetProfileModalProps {
    pet: any;
    isOpen: boolean;
    onClose: () => void;
}

export function PetProfileModal({ pet, isOpen, onClose }: PetProfileModalProps) {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && pet?.id) {
            loadHistory();
        } else if (!isOpen) {
            setRecords([]);
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, pet]);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const data = await getPetClinicalHistory(pet.id);
            setRecords(data);
        } catch (err) {
            console.error("Error al cargar historial clínico", err);
        } finally {
            setLoading(false);
        }
    };

    // Helper to calculate pet age
    const getAge = (dobString?: string | null) => {
        if (!dobString) return "Desconocida";
        try {
            const dob = new Date(dobString);
            const diffMs = Date.now() - dob.getTime();
            if (isNaN(diffMs) || diffMs < 0) return "Desconocida";
            const ageDate = new Date(diffMs);
            const years = Math.abs(ageDate.getUTCFullYear() - 1970);
            const months = ageDate.getUTCMonth();
            
            if (years === 0) {
                return `${months} ${months === 1 ? 'mes' : 'meses'}`;
            }
            return `${years} ${years === 1 ? 'año' : 'años'}${months > 0 ? ` y ${months} ${months === 1 ? 'mes' : 'meses'}` : ''}`;
        } catch {
            return "Desconocida";
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg bg-white max-h-[92vh] overflow-y-auto rounded-3xl p-6">
                {pet && (
                    <>
                        <DialogHeader className="border-b border-slate-100 pb-4">
                            <DialogTitle className="flex items-center gap-2.5 text-primary-700 text-lg">
                                <PawPrint className="w-5.5 h-5.5" />
                                <span>Ficha Técnica del Paciente</span>
                            </DialogTitle>
                        </DialogHeader>

                        <div className="py-4 space-y-5">
                            {/* Header: Pet details and image */}
                    <div className="flex items-center gap-4 bg-slate-50 border border-slate-150 p-4 rounded-2xl">
                        <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                            <SafeImage
                                src={pet.photoUrl || ''}
                                alt={pet.name}
                                className="w-full h-full object-cover"
                                fallback={
                                    <span className="text-3xl">
                                        {pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐈' : '🐾'}
                                    </span>
                                }
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-extrabold text-slate-900 text-xl tracking-tight">{pet.name}</h3>
                            <p className="text-xs font-semibold text-slate-500 capitalize mt-0.5">
                                {SPECIES_LABELS[pet.species as keyof typeof SPECIES_LABELS] || pet.species}
                                {pet.breed ? ` · ${pet.breed}` : ''}
                                {pet.sex && pet.sex !== 'unknown' ? ` · ${pet.sex === 'male' ? '♀ Macho' : '♂ Hembra'}` : ''}
                            </p>
                            {pet.cuh && (
                                <span className="inline-block text-[9px] font-mono font-bold text-primary-700 bg-primary-50/70 border border-primary-100 px-2 py-0.5 rounded-md mt-1.5">
                                    🐾 CUH: {pet.cuh}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Specifications: weight & age */}
                    <div className="grid grid-cols-2 gap-3.5">
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center gap-2.5">
                            <Weight className="w-4 h-4 text-slate-400" />
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Peso</p>
                                <p className="text-sm font-semibold text-slate-800">{pet.weight ? `${pet.weight} kg` : "No registrado"}</p>
                            </div>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center gap-2.5">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Edad / Nacimiento</p>
                                <p className="text-sm font-semibold text-slate-800" title={pet.dateOfBirth || undefined}>
                                    {getAge(pet.dateOfBirth)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Vital Alerts & Custom features */}
                    <div className="space-y-2.5">
                        {/* Allergies / Health Conditions */}
                        {pet.allergies ? (
                            <div className="bg-red-50 border border-red-200/80 rounded-2xl p-4 flex items-start gap-3 animate-in fade-in">
                                <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                <div className="text-xs">
                                    <p className="font-extrabold text-red-950">Alergias o Condiciones Crónicas:</p>
                                    <p className="mt-1 text-red-800 font-medium leading-relaxed">{pet.allergies}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-3.5 flex items-center gap-2 text-xs text-emerald-800 font-medium">
                                <Heart className="w-4 h-4 text-emerald-500 fill-emerald-100 shrink-0" />
                                Sin alergias ni condiciones de riesgo informadas.
                            </div>
                        )}

                        {/* Distinctive physical features */}
                        {pet.distinctiveFeature && (
                            <div className="bg-blue-50 border border-blue-150 rounded-2xl p-4 flex items-start gap-3 animate-in fade-in">
                                <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                <div className="text-xs">
                                    <p className="font-bold text-blue-950">Seña Particular / Rasgo Físico:</p>
                                    <p className="mt-1 text-blue-800 font-medium leading-relaxed">{pet.distinctiveFeature}</p>
                                </div>
                            </div>
                        )}

                        {/* Behavior / temperament */}
                        {pet.behavior && (
                            <div className="bg-purple-50 border border-purple-150 rounded-2xl p-4 flex items-start gap-3 animate-in fade-in">
                                <AlertCircle className="w-5 h-5 text-purple-650 shrink-0 mt-0.5" />
                                <div className="text-xs">
                                    <p className="font-bold text-purple-950">Conducta y Temperamento:</p>
                                    <p className="mt-1 text-purple-800 font-medium leading-relaxed">{pet.behavior}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Owner Details */}
                    {pet.owner && (
                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Información del Dueño</h4>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                                    <User className="w-4 h-4 text-slate-400" /> Propietario:
                                </span>
                                <span className="text-slate-800 font-semibold">{pet.owner.fullName}</span>
                            </div>
                            {pet.owner.phone && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                                        <Phone className="w-4 h-4 text-slate-400" /> Contacto:
                                    </span>
                                    <a href={`tel:${pet.owner.phone}`} className="text-primary-600 font-bold hover:underline">
                                        {pet.owner.phone}
                                    </a>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Clinical History Timeline */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Historial Clínico de Atenciones</h4>
                        <div className="min-h-[160px] flex flex-col justify-center border border-slate-100 rounded-2xl p-4 bg-slate-50/35">
                            {loading ? (
                                <div className="flex items-center justify-center py-6 text-sm text-slate-400 gap-1.5 flex-1">
                                    <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
                                    Cargando historial...
                                </div>
                            ) : records.length === 0 ? (
                                <div className="text-center py-6 text-xs text-slate-400 font-medium flex-1 flex items-center justify-center">
                                    No se registran atenciones previas en Brofy.
                                </div>
                            ) : (
                                <div className="space-y-3.5 pr-1 flex-1">
                                    {records.map((rec: any) => (
                                        <div key={rec.id} className="border border-slate-200 bg-white rounded-2xl p-3.5 space-y-2 hover:bg-slate-50 transition-colors">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="font-bold text-slate-800 text-xs truncate max-w-[200px]">{rec.appointment.serviceType}</p>
                                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                                        {rec.appointment.establishment?.name || "Establecimiento"}
                                                    </p>
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                    {new Date(rec.createdAt).toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" })}
                                                </span>
                                            </div>
                                            <div className="text-[11px] text-slate-650 leading-relaxed grid grid-cols-2 gap-x-2 gap-y-1">
                                                {rec.weight && <p><strong>Peso:</strong> {rec.weight} kg</p>}
                                                {rec.temperature && <p><strong>Temp:</strong> {rec.temperature}°C</p>}
                                                {rec.diagnosis && <p className="col-span-2"><strong>Diagnóstico:</strong> {rec.diagnosis}</p>}
                                                {rec.treatment && <p className="col-span-2"><strong>Tratamiento:</strong> {rec.treatment}</p>}
                                                {rec.prescription && <p className="col-span-2"><strong>Receta:</strong> {rec.prescription}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                </>
            )}
        </DialogContent>
    </Dialog>
    );
}
