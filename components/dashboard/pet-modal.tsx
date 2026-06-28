"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { addPet, updatePet, deletePet } from "@/lib/actions"; // Assuming updatePet exists in actions
import { Trash } from "lucide-react";

interface PetModalProps {
    isOpen: boolean;
    onClose: () => void;
    petToEdit?: any; // If present, mode is EDIT
}

export function PetModal({ isOpen, onClose, petToEdit }: PetModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedSpecies, setSelectedSpecies] = useState("DOG");
    const [customSpecies, setCustomSpecies] = useState("");

    useEffect(() => {
        if (petToEdit?.species) {
            const isKnown = ["DOG", "CAT", "BIRD"].includes(petToEdit.species);
            setSelectedSpecies(isKnown ? petToEdit.species : "OTHER");
            setCustomSpecies(isKnown ? "" : petToEdit.species);
        } else {
            setSelectedSpecies("DOG");
            setCustomSpecies("");
        }
    }, [petToEdit]);

    // Form handling
    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);
        try {
            if (petToEdit) {
                formData.append('id', petToEdit.id);
                await updatePet(formData);
            } else {
                await addPet(formData);
            }
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!petToEdit) return;
        if (confirm(`¿Eliminar a ${petToEdit.name}?`)) {
            setIsLoading(true);
            await deletePet(petToEdit.id);
            setIsLoading(false);
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-white">
                <DialogHeader>
                    <DialogTitle>{petToEdit ? 'Editar Mascota' : 'Agregar Mascota'}</DialogTitle>
                    <DialogDescription>
                        {petToEdit ? 'Modifica los datos de tu mascota aquí.' : 'Ingresa los datos de tu nueva mascota.'}
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                        <input id="name" name="name" defaultValue={petToEdit?.name} className="w-full p-2 border rounded-md" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="species" className="block text-sm font-medium text-slate-700 mb-1">Especie</label>
                            <select id="species" name="species" value={selectedSpecies} onChange={(e) => setSelectedSpecies(e.target.value)} className="w-full p-2 border rounded-md bg-white">
                                <option value="DOG">Perro</option>
                                <option value="CAT">Gato</option>
                                <option value="BIRD">Ave</option>
                                <option value="OTHER">Otro</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="age" className="block text-sm font-medium text-slate-700 mb-1">Edad</label>
                            <input id="age" name="age" type="number" defaultValue={petToEdit?.age} className="w-full p-2 border rounded-md" required min="0" />
                        </div>
                    </div>

                    {selectedSpecies === 'OTHER' && (
                        <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                            <label htmlFor="customSpecies" className="block text-sm font-medium text-slate-700 mb-1">Especie Personalizada</label>
                            <input id="customSpecies" name="customSpecies" value={customSpecies} onChange={(e) => setCustomSpecies(e.target.value)} className="w-full p-2 border rounded-md" required placeholder="Ej. Loro, Hámster..." />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="breed" className="block text-sm font-medium text-slate-700 mb-1">Raza</label>
                            <input id="breed" name="breed" defaultValue={petToEdit?.breed} className="w-full p-2 border rounded-md" placeholder="Opcional" />
                        </div>
                        <div>
                            <label htmlFor="weight" className="block text-sm font-medium text-slate-700 mb-1">Peso (kg)</label>
                            <input id="weight" name="weight" type="number" step="0.1" defaultValue={petToEdit?.weight} className="w-full p-2 border rounded-md" placeholder="Opcional" min="0" />
                        </div>
                    </div>

                    <DialogFooter className="flex justify-between sm:justify-between pt-2">
                        {petToEdit && (
                            <button type="button" onClick={handleDelete} className="text-red-500 hover:bg-red-50 p-2 rounded-md">
                                <Trash className="w-5 h-5" />
                            </button>
                        )}
                        <div className="flex gap-2 ml-auto">
                            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md hover:bg-slate-50">Cancelar</button>
                            <button type="submit" disabled={isLoading} className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50">Guardar</button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
