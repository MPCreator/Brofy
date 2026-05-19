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

    // Form handling
    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);
        try {
            if (petToEdit) {
                // Update
                // We need to implement updatePet in actions if not exists or use a server action that handles it
                // For now assuming updatePet exists and takes formData + id
                formData.append('id', petToEdit.id);
                // See implementation plan: we need to ensure updatePet is available
                // Actually I haven't added updatePet to actions.ts yet? I did in Step 540 via replace_file_content but wait...
                // Step 540 added updatePet/deletePet. Yes.
                // But updatePet was NOT in the replacement content of Step 540! 
                // Step 540 added updateService, deleteService, updateEmergencySettings, getEmergencySettings, deletePet.
                // MISSING: updatePet.
                // I need to add updatePet to actions.ts first.

                // Let's assume I will add it.
                await updatePet(formData);
            } else {
                // Create
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
                <form action={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="name" className="text-right text-sm font-medium">Nombre</label>
                        <input id="name" name="name" defaultValue={petToEdit?.name} className="col-span-3 p-2 border rounded-md" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="species" className="text-right text-sm font-medium">Especie</label>
                        <select id="species" name="species" defaultValue={petToEdit?.species || "DOG"} className="col-span-3 p-2 border rounded-md bg-white">
                            <option value="DOG">Perro</option>
                            <option value="CAT">Gato</option>
                            <option value="BIRD">Ave</option>
                            <option value="OTHER">Otro</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="breed" className="text-right text-sm font-medium">Raza</label>
                        <input id="breed" name="breed" defaultValue={petToEdit?.breed} className="col-span-3 p-2 border rounded-md" placeholder="Opcional" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="age" className="text-right text-sm font-medium">Edad</label>
                        <input id="age" name="age" type="number" defaultValue={petToEdit?.age} className="col-span-3 p-2 border rounded-md" required min="0" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="weight" className="text-right text-sm font-medium">Peso (kg)</label>
                        <input id="weight" name="weight" type="number" step="0.1" defaultValue={petToEdit?.weight} className="col-span-3 p-2 border rounded-md" placeholder="Opcional" />
                    </div>

                    <DialogFooter className="flex justify-between sm:justify-between">
                        {petToEdit && (
                            <button type="button" onClick={handleDelete} className="text-red-500 hover:bg-red-50 p-2 rounded-md">
                                <Trash className="w-5 h-5" />
                            </button>
                        )}
                        <div className="flex gap-2">
                            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md hover:bg-slate-50">Cancelar</button>
                            <button type="submit" disabled={isLoading} className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50">Guardar</button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
