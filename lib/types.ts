// ============================================================================
// BROFY — TypeScript Types
// Espeja el schema de Prisma/Supabase para type-safety en la app
// ============================================================================

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export type UserRole = 'vet' | 'client' | 'provider' | 'admin';

export type EstablishmentType = 'clinic' | 'groomer' | 'walker' | 'hospital' | 'pet_shop';

export type AppointmentStatus = 'pending' | 'confirmed' | 'paid' | 'validated' | 'completed' | 'cancelled';

export type CommissionType = 'booking' | 'walkin';

export type PetSex = 'male' | 'female' | 'unknown';

export type MedicalEventType = 'vaccination' | 'consultation' | 'surgery' | 'deworming' | 'test' | 'grooming';

// ---------------------------------------------------------------------------
// Medical History (JSONB / HL7 básico)
// ---------------------------------------------------------------------------

export interface MedicalHistoryEntry {
  date: string;                  // ISO date string
  type: MedicalEventType;
  code?: string;                 // Código ATC/HL7 opcional
  description: string;
  provider?: string;             // Nombre del vet
  providerCmvp?: string;        // CMVP del vet
  notes?: string;
  attachments?: string[];        // URLs de archivos
}

// ---------------------------------------------------------------------------
// Domain Models
// ---------------------------------------------------------------------------

export interface Profile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  cmvpId?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Pet {
  id: string;
  ownerId: string;
  name: string;
  species: string;
  breed?: string | null;
  dateOfBirth?: string | null;
  weight?: number | null;
  sex?: PetSex | null;
  microchipId?: string | null;
  photoUrl?: string | null;
  medicalHistory: MedicalHistoryEntry[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Establishment {
  id: string;
  ownerId: string;
  name: string;
  address: string;
  district?: string | null;
  city: string;
  latitude: number;
  longitude: number;
  type: EstablishmentType;
  qrCodeToken: string;
  phone?: string | null;
  description?: string | null;
  photoUrl?: string | null;
  rating: number;
  isActive: boolean;
  operatingHours: Record<string, { open: string; close: string }>;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Appointment {
  id: string;
  clientId: string;
  petId: string;
  establishmentId: string;
  providerId?: string | null;
  status: AppointmentStatus;
  serviceType: string;
  commissionAmount: number;
  commissionType: CommissionType;
  otpValidationCode?: string | null;
  otpExpiresAt?: Date | string | null;
  paymentId?: string | null;
  notes?: string | null;
  scheduledAt?: Date | string | null;
  completedAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  // Joined relations (optional, populated on queries)
  client?: Profile;
  pet?: Pet;
  establishment?: Establishment;
  provider?: Profile;
  medicalRecord?: MedicalRecord;
}

export interface MedicalRecord {
  id: string;
  appointmentId: string;
  vetId: string;
  weight?: number | null;
  temperature?: number | null;
  heartRate?: number | null;
  symptoms: string[];
  diagnosis?: string | null;
  prescription?: string | null;
  treatment?: string | null;
  nextVisit?: string | null;
  attachments: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
  // Joined relations (optional)
  appointment?: Appointment;
  vet?: Profile;
}

// ---------------------------------------------------------------------------
// Establishment with distance (from geo query)
// ---------------------------------------------------------------------------

export interface EstablishmentWithDistance extends Establishment {
  distanceKm: number;
}

// ---------------------------------------------------------------------------
// OTP Result
// ---------------------------------------------------------------------------

export interface OtpResult {
  success: boolean;
  otp?: string;
  expiresAt?: string;
  message?: string;
}

// ---------------------------------------------------------------------------
// Common symptom presets for Fast-Entry form
// ---------------------------------------------------------------------------

export const COMMON_SYMPTOMS = [
  'Vómitos',
  'Diarrea',
  'Inapetencia',
  'Fiebre',
  'Tos',
  'Letargia',
  'Dolor abdominal',
  'Cojera',
  'Secreción nasal',
  'Secreción ocular',
  'Prurito (picazón)',
  'Pérdida de peso',
  'Sed excesiva',
  'Micción frecuente',
  'Dificultad para respirar',
  'Convulsiones',
  'Caída de pelo',
  'Inflamación',
  'Herida abierta',
  'Parásitos visibles',
] as const;

export const COMMON_DIAGNOSES = [
  'Gastroenteritis',
  'Dermatitis alérgica',
  'Otitis externa',
  'Infección urinaria',
  'Parásitos intestinales',
  'Parvovirus',
  'Moquillo',
  'Ehrlichiosis',
  'Fractura',
  'Luxación patelar',
  'Piometra',
  'Insuficiencia renal',
  'Diabetes mellitus',
  'Tumor/Neoplasia',
  'Control sano',
] as const;

export const SPECIES_OPTIONS = [
  { value: 'dog', label: 'Perro 🐕' },
  { value: 'cat', label: 'Gato 🐈' },
  { value: 'bird', label: 'Ave 🐦' },
  { value: 'rabbit', label: 'Conejo 🐰' },
  { value: 'hamster', label: 'Hámster 🐹' },
  { value: 'fish', label: 'Pez 🐠' },
  { value: 'reptile', label: 'Reptil 🦎' },
  { value: 'other', label: 'Otro' },
] as const;

export const ESTABLISHMENT_TYPE_LABELS: Record<EstablishmentType, string> = {
  clinic: 'Clínica Veterinaria',
  groomer: 'Grooming / Estética',
  walker: 'Paseador',
  hospital: 'Hospital Veterinario',
  pet_shop: 'Pet Shop',
};

export const APPOINTMENT_STATUS_LABELS = {
  pending: { label: 'Pendiente', color: 'text-slate-600 bg-slate-100' },
  confirmed: { label: 'Confirmada', color: 'text-emerald-600 bg-emerald-50' },
  paid: { label: 'Pagado', color: 'text-blue-600 bg-blue-100' },
  validated: { label: 'Validado', color: 'text-indigo-600 bg-indigo-100' },
  completed: { label: 'Completado', color: 'text-emerald-600 bg-emerald-100' },
  cancelled: { label: 'Cancelado', color: 'text-red-600 bg-red-100' },
} as const;

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export interface Service {
  id: string;
  establishmentId: string;
  name: string;
  description?: string | null;
  price: number;
  duration: number;
  category: string;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export const SERVICE_CATEGORIES = [
  { value: 'consultation', label: 'Consulta' },
  { value: 'vaccination', label: 'Vacunación' },
  { value: 'grooming', label: 'Grooming' },
  { value: 'surgery', label: 'Cirugía' },
  { value: 'deworming', label: 'Desparasitación' },
  { value: 'test', label: 'Exámenes' },
  { value: 'walk', label: 'Paseo' },
  { value: 'bath', label: 'Baño' },
  { value: 'general', label: 'General' },
] as const;

// ---------------------------------------------------------------------------
// Transaction (Ingresos / Gastos)
// ---------------------------------------------------------------------------

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  profileId: string;
  type: TransactionType;
  amount: number;
  category: string;
  description?: string | null;
  date: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export const INCOME_CATEGORIES = [
  { value: 'consultation', label: 'Consulta' },
  { value: 'surgery', label: 'Cirugía' },
  { value: 'grooming', label: 'Grooming' },
  { value: 'vaccination', label: 'Vacunación' },
  { value: 'test', label: 'Exámenes' },
  { value: 'walk', label: 'Paseo' },
  { value: 'other', label: 'Otro' },
] as const;

export const EXPENSE_CATEGORIES = [
  { value: 'supplies', label: 'Insumos' },
  { value: 'rent', label: 'Alquiler' },
  { value: 'salary', label: 'Salarios' },
  { value: 'equipment', label: 'Equipos' },
  { value: 'utilities', label: 'Servicios (luz, agua)' },
  { value: 'marketing', label: 'Publicidad' },
  { value: 'other', label: 'Otro' },
] as const;
