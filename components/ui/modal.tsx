"use client";

import { X } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-4">
                    {title && <h2 className="text-xl font-bold text-slate-900">{title}</h2>}
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}
