'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getEstablishmentByQr, getUserPets, createAppointment, processPayment } from '@/lib/actions'
import { formatPEN } from '@/lib/utils'
import { SPECIES_LABELS } from '@/lib/types'
import {
    MapPin,
    Shield,
    CreditCard,
    Key,
    Loader2,
    CheckCircle2,
    PawPrint,
    AlertCircle,
    Copy,
    Check,
} from 'lucide-react'
import { LoadingState } from '@/components/ui/loading-state'

type Step = 'loading' | 'info' | 'select-pet' | 'payment' | 'otp-display'

export default function CheckinPage() {
    const params = useParams()
    const router = useRouter()
    const establishmentToken = params.establishmentId as string

    const [step, setStep] = useState<Step>('loading')
    const [establishment, setEstablishment] = useState<Awaited<ReturnType<typeof getEstablishmentByQr>>>(null)
    const [pets, setPets] = useState<Awaited<ReturnType<typeof getUserPets>>>([])
    const [selectedPetId, setSelectedPetId] = useState('')
    const [serviceType, setServiceType] = useState('consultation')
    const [commissionType] = useState<'walkin'>('walkin') // Presencial since they scanned QR
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [appointmentId, setAppointmentId] = useState('')
    const [otp, setOtp] = useState('')
    const [otpCopied, setOtpCopied] = useState(false)

    useEffect(() => {
        async function loadData() {
            try {
                const est = await getEstablishmentByQr(establishmentToken)
                const userPets = await getUserPets()
                setEstablishment(est)
                setPets(userPets)
                setStep(est ? 'info' : 'loading')
                if (!est) setError('Establecimiento no encontrado')
            } catch {
                setError('Error al cargar datos')
            }
        }
        loadData()
    }, [establishmentToken])

    async function handleCreateAndPay() {
        if (!selectedPetId || !establishment) return
        setLoading(true)
        setError('')

        try {
            // Step 1: Create appointment
            const aptResult = await createAppointment({
                petId: selectedPetId,
                establishmentId: establishment.id,
                providerId: establishment.ownerId,
                serviceType,
                commissionType,
            })

            if (!aptResult.success || !aptResult.appointmentId) {
                setError('Error al crear la cita')
                setLoading(false)
                return
            }

            setAppointmentId(aptResult.appointmentId)

            // Step 2: Process payment (Izipay Redirection)
            const payResult = await processPayment(aptResult.appointmentId)

            if (!payResult.success) {
                setError(payResult.message || 'Error en el pago')
                setLoading(false)
                return
            }

            if (payResult.redirectUrl) {
                window.location.href = payResult.redirectUrl
                return
            }
        } catch {
            setError('Error de conexión')
        } finally {
            setLoading(false)
        }
    }

    function copyOtp() {
        navigator.clipboard.writeText(otp)
        setOtpCopied(true)
        setTimeout(() => setOtpCopied(false), 2000)
    }

    // --- LOADING ---
    if (step === 'loading' && !error) {
        return (
            <LoadingState 
                message="Verificando establecimiento..." 
                description="Por favor espera un momento mientras validamos el código QR"
                minHeight="min-h-[60vh]"
                size="lg"
            />
        )
    }

    // --- ERROR (establishment not found) ---
    if (!establishment) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
                <h2 className="text-lg font-bold text-slate-900">Establecimiento no encontrado</h2>
                <p className="text-sm text-slate-500 mt-1">El código QR podría ser inválido o el local ya no está activo.</p>
                <button
                    onClick={() => router.push('/dashboard/discover')}
                    className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-full text-sm font-medium hover:bg-primary-700"
                >
                    Buscar servicios
                </button>
            </div>
        )
    }

    // --- OTP DISPLAY ---
    if (step === 'otp-display') {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 space-y-6">
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>

                <div>
                    <h2 className="text-xl font-bold text-slate-900">¡Tu turno está confirmado en Brofy! 🐾</h2>
                    <p className="text-sm text-slate-500 mt-1">Presenta este código al especialista de <strong>{establishment?.name}</strong> para iniciar tu atención.</p>
                </div>

                {/* OTP Code */}
                <div className="bg-white rounded-3xl border-2 border-primary-200 p-8 shadow-floating w-full max-w-sm">
                    <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider font-medium">Código de validación</p>
                    <p className="text-5xl font-mono font-bold text-slate-900 tracking-[0.3em]">
                        {otp}
                    </p>
                    <button
                        onClick={copyOtp}
                        className="mt-4 flex items-center gap-2 mx-auto px-4 py-2 bg-slate-50 rounded-full text-sm text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        {otpCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        {otpCopied ? 'Copiado!' : 'Copiar código'}
                    </button>
                </div>

                <div className="bg-amber-100/50 p-4 rounded-xl text-sm text-amber-900 border border-amber-200">
                    <p className="font-semibold mb-1">⏱️ Válido hasta finalizar la consulta</p>
                    <p className="opacity-90">No cierres esta pantalla o asegúrate de anotar el código.</p>
                </div>

                <button
                    onClick={() => router.push('/dashboard/client')}
                    className="text-sm text-primary-600 font-medium hover:underline"
                >
                    Ir a mi dashboard →
                </button>
            </div>
        )
    }

    // --- ESTABLISHMENT INFO + PET SELECTION + PAYMENT ---
    return (
        <div className="space-y-6 pb-20 lg:pb-0 max-w-lg mx-auto">
            {/* Check-in Header */}
            <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-3 text-3xl">
                    {establishment.type ? establishment.type.split(',').map((t: string) => {
                        const c = t.trim();
                        if (c === 'clinic' || c === 'hospital') return '🏥';
                        if (c === 'groomer') return '✂️';
                        if (c === 'walker') return '🦮';
                        if (c === 'lodging') return '🏨';
                        if (c === 'trainer') return '🎓';
                        if (c === 'other') return '🐾';
                        return '🏠';
                    })[0] : '🏠'}
                </div>
                <h1 className="text-xl font-bold text-slate-900">Check-in</h1>
                <p className="text-sm text-slate-500 mt-1">{establishment.name}</p>
            </div>

            {/* Establishment Info */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4">
                <h3 className="font-semibold text-slate-900">{establishment.name}</h3>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {establishment.address}
                </p>
                {establishment.owner && (
                    <p className="text-xs text-slate-500 mt-1">
                        Dr. {establishment.owner.fullName}
                        {establishment.owner.cmvpId && ` · CMVP ${establishment.owner.cmvpId}`}
                    </p>
                )}
            </div>

            {/* Step Indicator */}
            <div className="flex items-center gap-2 justify-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    step === 'info' || step === 'select-pet'
                        ? 'bg-primary-600 text-white'
                        : 'bg-primary-100 text-primary-600'
                }`}>1</div>
                <div className="w-8 h-0.5 bg-slate-200" />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    step === 'payment'
                        ? 'bg-primary-600 text-white'
                        : 'bg-slate-100 text-slate-400'
                }`}>2</div>
                <div className="w-8 h-0.5 bg-slate-200" />
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-slate-100 text-slate-400">3</div>
            </div>

            {/* Select Pet */}
            {(step === 'info' || step === 'select-pet') && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-slate-900">Selecciona tu mascota</h2>

                    {pets.length === 0 ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                            No tienes mascotas registradas. Agrega una primero.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {pets.map(pet => (
                                <button
                                    key={pet.id}
                                    type="button"
                                    onClick={() => {
                                        setSelectedPetId(pet.id)
                                        setStep('select-pet')
                                    }}
                                    className={`w-full text-left flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                                        selectedPetId === pet.id
                                            ? 'border-primary-500 bg-primary-50'
                                            : 'border-slate-100 bg-white hover:border-slate-200'
                                    }`}
                                >
                                    <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-xl">
                                        {pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐈' : '🐾'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">{pet.name}</p>
                                        <p className="text-xs text-slate-500 capitalize">{SPECIES_LABELS[pet.species as keyof typeof SPECIES_LABELS] || pet.species}</p>
                                    </div>
                                    {selectedPetId === pet.id && (
                                        <CheckCircle2 className="w-5 h-5 text-primary-600 ml-auto" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Service type */}
                    <div>
                        <label className="text-sm font-medium text-slate-700 mb-1.5 block">Tipo de servicio</label>
                        <select
                            value={serviceType}
                            onChange={e => setServiceType(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="consultation">Consulta</option>
                            <option value="vaccination">Vacunación</option>
                            <option value="grooming">Grooming</option>
                            <option value="surgery">Cirugía</option>
                            <option value="deworming">Desparasitación</option>
                            <option value="test">Exámenes</option>
                        </select>
                    </div>

                    {selectedPetId && (
                        <button
                            onClick={() => setStep('payment')}
                            className="w-full px-6 py-4 bg-primary-600 text-white rounded-2xl font-semibold text-lg hover:bg-primary-700 transition-all shadow-lg"
                        >
                            Continuar al pago →
                        </button>
                    )}
                </div>
            )}

            {/* Payment Wall */}
            {step === 'payment' && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary-600" />
                        Muro de Pago
                    </h2>

                    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Comisión de plataforma</span>
                            <span className="font-bold text-slate-900">
                                {formatPEN(5.00)}
                            </span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>Tipo</span>
                            <span>Atención Presencial (En establecimiento)</span>
                        </div>
                        <hr className="border-slate-100" />
                        <div className="flex justify-between font-semibold">
                            <span className="text-slate-900">Total</span>
                            <span className="text-primary-600 text-lg">{formatPEN(5.00)}</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                        {/* Header Izipay */}
                        <div className="bg-red-600 px-5 py-4 text-white flex items-center justify-between">
                            <span className="font-bold tracking-wider">izipay</span>
                            <span className="text-sm">Pago Seguro</span>
                        </div>
                        
                        <div className="p-5 space-y-4">
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
                                        <input type="text" placeholder="123" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm mt-1" />
                                    </div>
                                </div>
                            </div>
                            
                            <button
                                onClick={handleCreateAndPay}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-red-600 text-white rounded-xl font-bold text-base hover:bg-red-700 disabled:opacity-50 transition-all shadow-md mt-2"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Shield className="w-5 h-5" />
                                )}
                                {loading ? 'Procesando con Izipay...' : `Pagar ${formatPEN(5.00)}`}
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => setStep('select-pet')}
                        className="w-full text-sm text-slate-500 hover:text-slate-700 py-2"
                    >
                        ← Cancelar pago
                    </button>
                </div>
            )}
        </div>
    )
}
