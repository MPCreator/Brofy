'use client'

import { useState } from 'react'

export function OperatingHoursInput({ defaultHours = '{}' }: { defaultHours?: string }) {
    let parsed = { is24h: false, openTime: '09:00', closeTime: '18:00' }
    try { 
        const p = JSON.parse(defaultHours) 
        if (p) parsed = { ...parsed, ...p }
    } catch {}

    const [is24h, setIs24h] = useState(!!parsed.is24h)

    return (
        <div className="col-span-full bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h4 className="text-sm font-medium text-slate-700 mb-3">Horario de Atención</h4>
            
            <input type="hidden" name="is24h" value={is24h.toString()} />
            
            <div className="flex items-center gap-2 mb-4">
                <input 
                    type="checkbox" 
                    id={`is24h-${defaultHours}`} 
                    checked={is24h} 
                    onChange={e => setIs24h(e.target.checked)}
                    className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4"
                />
                <label htmlFor={`is24h-${defaultHours}`} className="text-sm font-medium text-slate-700 cursor-pointer">
                    Abierto las 24 horas
                </label>
            </div>

            {!is24h && (
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-medium text-slate-500 mb-1 block">Hora de apertura</label>
                        <input 
                            type="time" 
                            name="openTime" 
                            defaultValue={parsed.openTime}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" 
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-slate-500 mb-1 block">Hora de cierre</label>
                        <input 
                            type="time" 
                            name="closeTime" 
                            defaultValue={parsed.closeTime}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" 
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
