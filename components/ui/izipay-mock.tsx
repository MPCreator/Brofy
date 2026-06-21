import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { formatPEN } from "@/lib/utils";

interface IzipayMockProps {
    amount: number;
    description: string;
    buttonText?: string;
    onSuccess: () => Promise<void>;
    onCancel?: () => void;
}

export function IzipayMock({ amount, description, buttonText = "Pagar", onSuccess, onCancel }: IzipayMockProps) {
    const [loading, setLoading] = useState(false);

    const handlePay = async () => {
        setLoading(true);
        try {
            await onSuccess();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-in fade-in zoom-in-95">
            {/* Header Izipay */}
            <div className="bg-red-600 px-5 py-4 text-white flex items-center justify-between">
                <span className="font-bold tracking-wider">izipay</span>
                <span className="text-sm">Pago Seguro</span>
            </div>
            
            <div className="p-5 space-y-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between gap-4 items-start">
                    <span className="text-sm text-slate-600 break-words max-w-[70%]">{description}</span>
                    <span className="font-bold text-lg text-slate-900 shrink-0">{formatPEN(amount)}</span>
                </div>

                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase">Número de Tarjeta</label>
                        <div className="relative mt-1">
                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="text" placeholder="0000 0000 0000 0000" className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase">Vencimiento</label>
                            <input type="text" placeholder="MM/YY" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm mt-1" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase">CVV</label>
                            <input type="password" placeholder="123" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm mt-1" />
                        </div>
                    </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            disabled={loading}
                            className="px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-50 disabled:opacity-50 transition-colors"
                        >
                            Cancelar
                        </button>
                    )}
                    <button
                        onClick={handlePay}
                        disabled={loading}
                        className="flex-1 flex justify-center items-center gap-2 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors shadow-md hover:shadow-lg"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `${buttonText} ${formatPEN(amount)}`}
                    </button>
                </div>
            </div>
        </div>
    );
}
