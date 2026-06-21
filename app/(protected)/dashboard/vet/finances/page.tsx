'use client'

import { useState, useEffect } from 'react'
import { getTransactions, addTransaction, deleteTransaction, getFinanceSummary } from '@/lib/actions'
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/lib/types'
import { formatPEN } from '@/lib/utils'
import {
    TrendingUp, TrendingDown, DollarSign, Plus, Trash2, Loader2, ArrowUpCircle, ArrowDownCircle, BarChart3
} from 'lucide-react'
import { IzipayMock } from '@/components/ui/izipay-mock'
import { LoadingState } from '@/components/ui/loading-state'

export default function FinancesPage() {
    const [transactions, setTransactions] = useState<any[]>([])
    const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 })
    const [debt, setDebt] = useState(0)
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [formType, setFormType] = useState<'income' | 'expense'>('income')
    const [saving, setSaving] = useState(false)
    const [payingDebt, setPayingDebt] = useState(false)

    useEffect(() => { loadData() }, [])

    async function loadData() {
        setLoading(true)
        const { getVetDebt } = await import('@/lib/actions')
        const txns = await getTransactions()
        const sum = await getFinanceSummary()
        const vetDebt = await getVetDebt()
        setTransactions(txns)
        setSummary(sum)
        setDebt(vetDebt)
        setLoading(false)
    }

    async function handlePayDebt() {
        if (!confirm(`¿Pagar deuda pendiente de ${formatPEN(debt)} a Brofy? (Simulación)`)) return
        setPayingDebt(true)
        const { payVetDebt, addTransaction } = await import('@/lib/actions')
        await payVetDebt()
        
        // Registrar el pago en transacciones para cuadrar finanzas
        const formData = new FormData()
        formData.append('type', 'expense')
        formData.append('amount', debt.toString())
        formData.append('category', 'brofy_commission')
        formData.append('description', 'Pago de deuda de comisiones a Brofy')
        formData.append('date', new Date().toISOString().split('T')[0])
        await addTransaction(formData)

        setPayingDebt(false)
        loadData()
    }

    async function handleAdd(formData: FormData) {
        setSaving(true)
        formData.set('type', formType)
        await addTransaction(formData)
        setSaving(false)
        setShowForm(false)
        loadData()
    }

    async function handleDelete(id: string) {
        if (!confirm('¿Eliminar esta transacción?')) return
        await deleteTransaction(id)
        loadData()
    }

    if (loading) return <LoadingState message="Cargando finanzas..." description="Calculando balances, ingresos y egresos" />

    const categories = formType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Finanzas</h1>
                    <p className="text-sm text-slate-500 mt-1">Ingresos y gastos del mes</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-full text-sm font-medium hover:bg-primary-700 shadow-md">
                    <Plus className="w-4 h-4" /> Registrar
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-2">
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                        <ArrowUpCircle className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-medium text-emerald-700">Ingresos</span>
                    </div>
                    <p className="text-lg font-bold text-emerald-800">{formatPEN(summary.totalIncome)}</p>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                        <ArrowDownCircle className="w-4 h-4 text-red-600" />
                        <span className="text-xs font-medium text-red-700">Gastos</span>
                    </div>
                    <p className="text-lg font-bold text-red-800">{formatPEN(summary.totalExpense)}</p>
                </div>
                <div className={`border rounded-xl p-3 ${summary.balance >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-amber-50 border-amber-100'}`}>
                    <div className="flex items-center gap-1.5 mb-1">
                        <BarChart3 className={`w-4 h-4 ${summary.balance >= 0 ? 'text-blue-600' : 'text-amber-600'}`} />
                        <span className={`text-xs font-medium ${summary.balance >= 0 ? 'text-blue-700' : 'text-amber-700'}`}>Balance</span>
                    </div>
                    <p className={`text-lg font-bold ${summary.balance >= 0 ? 'text-blue-800' : 'text-amber-800'}`}>{formatPEN(summary.balance)}</p>
                </div>
            </div>

            {/* Deuda Brofy */}
            {debt > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="text-rose-900 font-bold flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-rose-600" />
                            Deuda Pendiente con Brofy
                        </h3>
                        <p className="text-sm text-rose-700 mt-1">
                            Comisiones acumuladas por uso de Fichas Rápidas Manuales.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-2xl font-black text-rose-800">{formatPEN(debt)}</span>
                        <button 
                            onClick={() => setPayingDebt(true)}
                            className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md transition-all flex items-center gap-2 whitespace-nowrap"
                        >
                            <DollarSign className="w-5 h-5" />
                            Pagar Ahora
                        </button>
                    </div>
                </div>
            )}

            {/* Izipay Mockup para Deuda */}
            {payingDebt && debt > 0 && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-sm">
                        <IzipayMock
                            amount={debt}
                            description="Pago de comisiones acumuladas"
                            onSuccess={handlePayDebt}
                            onCancel={() => setPayingDebt(false)}
                        />
                    </div>
                </div>
            )}

            {/* Add Form */}
            {showForm && (
                <form action={handleAdd} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 animate-in">
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setFormType('income')} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${formType === 'income' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-600'}`}>
                            <TrendingUp className="w-4 h-4 inline mr-1" /> Ingreso
                        </button>
                        <button type="button" onClick={() => setFormType('expense')} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${formType === 'expense' ? 'bg-red-600 text-white shadow-md' : 'bg-slate-100 text-slate-600'}`}>
                            <TrendingDown className="w-4 h-4 inline mr-1" /> Gasto
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <input name="amount" type="number" step="0.5" required placeholder="Monto (S/)" className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        <input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        <select name="category" className="col-span-2 px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                            {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                        <input name="description" placeholder="Descripción (opcional)" className="col-span-2 px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-3 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">Cancelar</button>
                        <button type="submit" disabled={saving} className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-white text-sm font-medium rounded-lg disabled:opacity-50 ${formType === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Agregar
                        </button>
                    </div>
                </form>
            )}

            {/* Transactions List */}
            <div className="space-y-2">
                {transactions.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
                        <DollarSign className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                        <p className="text-sm text-slate-500">Sin transacciones este mes</p>
                    </div>
                ) : (
                    transactions.map(txn => (
                        <div key={txn.id} className="bg-white rounded-xl border border-slate-100 p-3 flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${txn.type === 'income' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                                {txn.type === 'income' ? <TrendingUp className="w-4 h-4 text-emerald-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">{txn.description || txn.category}</p>
                                <p className="text-xs text-slate-400">{txn.date}</p>
                            </div>
                            <span className={`text-sm font-bold ${txn.type === 'income' ? 'text-emerald-700' : 'text-red-700'}`}>
                                {txn.type === 'income' ? '+' : '-'}{formatPEN(txn.amount)}
                            </span>
                            <button onClick={() => handleDelete(txn.id)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
