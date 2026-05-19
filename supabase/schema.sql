-- ============================================================================
-- BROFY — Plataforma Veterinaria Perú
-- Schema SQL para Supabase (PostgreSQL + PostGIS + RLS)
-- Ejecutar en Supabase SQL Editor cuando migres de SQLite
-- ============================================================================

-- 0. Extensiones
-- PostGIS ya viene habilitado en Supabase por defecto
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- 1. TIPOS ENUMERADOS
-- ============================================================================

CREATE TYPE user_role AS ENUM ('vet', 'client', 'provider');
CREATE TYPE establishment_type AS ENUM ('clinic', 'groomer', 'walker', 'hospital', 'pet_shop');
CREATE TYPE appointment_status AS ENUM ('pending', 'paid', 'validated', 'completed', 'cancelled');

-- ============================================================================
-- 2. TABLAS PRINCIPALES
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 2.1 PROFILES
-- Extiende auth.users de Supabase. Se crea automáticamente via trigger.
-- ---------------------------------------------------------------------------
CREATE TABLE profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email       TEXT UNIQUE NOT NULL,
    full_name   TEXT NOT NULL,
    role        user_role NOT NULL DEFAULT 'client',
    cmvp_id     TEXT,                                       -- Solo para vets, validación manual
    phone       TEXT,
    avatar_url  TEXT,
    location    GEOGRAPHY(POINT, 4326),                     -- Coordenadas del usuario (WGS84)
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON COLUMN profiles.cmvp_id IS 'Número de colegiatura del Colegio Médico Veterinario del Perú. Almacenado como texto, validación manual.';
COMMENT ON COLUMN profiles.location IS 'Ubicación del usuario como punto geográfico WGS84 para cálculos de distancia.';

-- ---------------------------------------------------------------------------
-- 2.2 PETS
-- Mascotas del cliente con historial médico en JSONB (HL7 básico)
-- ---------------------------------------------------------------------------
CREATE TABLE pets (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name              TEXT NOT NULL,
    species           TEXT NOT NULL,                         -- 'dog', 'cat', 'bird', 'rabbit', etc.
    breed             TEXT,
    date_of_birth     DATE,
    weight            DECIMAL(5,2),                          -- kg, hasta 999.99
    sex               TEXT CHECK (sex IN ('male', 'female', 'unknown')),
    microchip_id      TEXT,
    photo_url         TEXT,
    medical_history   JSONB NOT NULL DEFAULT '[]'::jsonb,    -- Estructura HL7 básica
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Estructura esperada de medical_history (JSONB):
-- [
--   {
--     "date": "2025-03-15",
--     "type": "vaccination",                          -- vaccination | consultation | surgery | deworming | test
--     "code": "J07BM01",                              -- Código ATC/HL7 opcional
--     "description": "Vacuna antirrábica",
--     "provider": "Dr. García",
--     "provider_cmvp": "12345",
--     "notes": "Próxima dosis en 1 año",
--     "attachments": []
--   }
-- ]

COMMENT ON COLUMN pets.medical_history IS 'Historial médico en formato JSONB compatible con HL7 básico. Array de eventos médicos.';

-- ---------------------------------------------------------------------------
-- 2.3 ESTABLISHMENTS
-- Locales de servicio con coordenadas y QR token
-- ---------------------------------------------------------------------------
CREATE TABLE establishments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    address         TEXT NOT NULL,
    district        TEXT,                                    -- Distrito (Lima, Miraflores, etc.)
    city            TEXT DEFAULT 'Lima',
    coordinates     GEOGRAPHY(POINT, 4326) NOT NULL,         -- Ubicación exacta
    type            establishment_type NOT NULL DEFAULT 'clinic',
    qr_code_token   UUID NOT NULL DEFAULT gen_random_uuid(), -- Token único para QR de check-in
    phone           TEXT,
    description     TEXT,
    photo_url       TEXT,
    rating          DECIMAL(2,1) DEFAULT 0.0,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    operating_hours JSONB DEFAULT '{}'::jsonb,               -- {"mon": {"open": "08:00", "close": "18:00"}, ...}
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_establishments_qr ON establishments(qr_code_token);

COMMENT ON COLUMN establishments.qr_code_token IS 'Token UUID único. El QR del local codifica la URL /checkin/{qr_code_token}.';

-- ---------------------------------------------------------------------------
-- 2.4 APPOINTMENTS
-- Citas con flujo de validación anti-desintermediación
-- ---------------------------------------------------------------------------
CREATE TABLE appointments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id           UUID NOT NULL REFERENCES profiles(id),
    pet_id              UUID NOT NULL REFERENCES pets(id),
    establishment_id    UUID NOT NULL REFERENCES establishments(id),
    provider_id         UUID REFERENCES profiles(id),        -- Vet/proveedor asignado
    status              appointment_status NOT NULL DEFAULT 'pending',
    service_type        TEXT NOT NULL DEFAULT 'consultation', -- consultation, vaccination, grooming, walk, surgery
    commission_amount   DECIMAL(6,2) NOT NULL DEFAULT 5.00,  -- S/ 5 reserva, S/ 6 presencial
    commission_type     TEXT NOT NULL DEFAULT 'booking' CHECK (commission_type IN ('booking', 'walkin')),
    otp_validation_code TEXT,                                -- Código OTP de 6 dígitos, generado post-pago
    otp_expires_at      TIMESTAMPTZ,                         -- Expiración del OTP (30 min)
    payment_id          TEXT,                                -- ID de transacción de pasarela (Izipay/MercadoPago)
    notes               TEXT,
    scheduled_at        TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_appointments_client ON appointments(client_id);
CREATE INDEX idx_appointments_provider ON appointments(provider_id);
CREATE INDEX idx_appointments_establishment ON appointments(establishment_id);
CREATE INDEX idx_appointments_status ON appointments(status);

COMMENT ON COLUMN appointments.commission_amount IS 'Comisión de la plataforma: S/ 5.00 para reservas online, S/ 6.00 para walk-in presencial.';
COMMENT ON COLUMN appointments.otp_validation_code IS 'Código OTP de 6 dígitos. Generado después del pago. El vet debe ingresarlo para desbloquear la ficha médica.';

-- ---------------------------------------------------------------------------
-- 2.5 MEDICAL_RECORDS
-- Fichas médicas creadas por veterinarios post-validación OTP
-- ---------------------------------------------------------------------------
CREATE TABLE medical_records (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id  UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    vet_id          UUID NOT NULL REFERENCES profiles(id),
    weight          DECIMAL(5,2),                            -- Peso actual en kg
    temperature     DECIMAL(4,1),                            -- Temperatura en °C
    heart_rate      INTEGER,                                 -- bpm
    symptoms        TEXT[] DEFAULT '{}',                      -- Array de síntomas
    diagnosis       TEXT,
    prescription    TEXT,
    treatment       TEXT,
    next_visit      DATE,
    attachments     JSONB DEFAULT '[]'::jsonb,               -- URLs de archivos adjuntos
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_medical_records_appointment ON medical_records(appointment_id);
CREATE INDEX idx_medical_records_vet ON medical_records(vet_id);

-- ============================================================================
-- 3. FUNCIONES PL/pgSQL
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 3.1 Trigger: Auto-crear profile cuando se registra un usuario en Supabase Auth
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'client')
    );
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 3.2 Generar OTP de 6 dígitos para una cita (post-pago)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.generate_otp(p_appointment_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_otp TEXT;
BEGIN
    -- Generar código de 6 dígitos
    v_otp := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');

    -- Actualizar la cita con el OTP y expiración (30 minutos)
    UPDATE appointments
    SET
        otp_validation_code = v_otp,
        otp_expires_at = now() + INTERVAL '30 minutes',
        status = 'paid',
        updated_at = now()
    WHERE id = p_appointment_id
      AND status = 'pending';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Cita no encontrada o no está en estado pendiente';
    END IF;

    RETURN v_otp;
END;
$$;

-- ---------------------------------------------------------------------------
-- 3.3 Validar OTP — El veterinario ingresa el código para desbloquear la ficha
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.validate_otp(p_appointment_id UUID, p_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_valid BOOLEAN := FALSE;
BEGIN
    UPDATE appointments
    SET
        status = 'validated',
        updated_at = now()
    WHERE id = p_appointment_id
      AND otp_validation_code = p_code
      AND otp_expires_at > now()
      AND status = 'paid';

    IF FOUND THEN
        v_valid := TRUE;
    END IF;

    RETURN v_valid;
END;
$$;

-- ---------------------------------------------------------------------------
-- 3.4 Calcular distancia — Retorna establecimientos ordenados por cercanía
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_nearby_establishments(
    p_lat DOUBLE PRECISION,
    p_lng DOUBLE PRECISION,
    p_radius_km DOUBLE PRECISION DEFAULT 50.0,
    p_type establishment_type DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    address TEXT,
    district TEXT,
    type establishment_type,
    phone TEXT,
    description TEXT,
    photo_url TEXT,
    rating DECIMAL,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    distance_km DOUBLE PRECISION,
    qr_code_token UUID
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id,
        e.name,
        e.address,
        e.district,
        e.type,
        e.phone,
        e.description,
        e.photo_url,
        e.rating,
        ST_Y(e.coordinates::geometry) AS lat,
        ST_X(e.coordinates::geometry) AS lng,
        ROUND((ST_Distance(
            e.coordinates,
            ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
        ) / 1000.0)::numeric, 2) AS distance_km,
        e.qr_code_token
    FROM establishments e
    WHERE e.is_active = true
      AND (p_type IS NULL OR e.type = p_type)
      AND ST_DWithin(
            e.coordinates,
            ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
            p_radius_km * 1000  -- metros
          )
    ORDER BY distance_km ASC;
END;
$$;

-- ---------------------------------------------------------------------------
-- 3.5 Trigger: Actualizar updated_at automáticamente
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated    BEFORE UPDATE ON profiles        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_pets_updated        BEFORE UPDATE ON pets            FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_establishments_upd  BEFORE UPDATE ON establishments  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_appointments_upd    BEFORE UPDATE ON appointments    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_medical_records_upd BEFORE UPDATE ON medical_records FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 4.1 PROFILES
-- ---------------------------------------------------------------------------

-- Cualquier usuario autenticado puede ver perfiles básicos (nombre, rol)
CREATE POLICY "profiles_select_public"
    ON profiles FOR SELECT
    USING (true);

-- Solo el usuario puede actualizar su propio perfil
CREATE POLICY "profiles_update_own"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- 4.2 PETS
-- ---------------------------------------------------------------------------

-- El dueño puede ver sus mascotas
CREATE POLICY "pets_select_owner"
    ON pets FOR SELECT
    USING (owner_id = auth.uid());

-- Los vets pueden ver mascotas de citas validadas
CREATE POLICY "pets_select_vet"
    ON pets FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM appointments a
            WHERE a.pet_id = pets.id
              AND a.provider_id = auth.uid()
              AND a.status IN ('validated', 'completed')
        )
    );

-- Solo el dueño puede insertar mascotas
CREATE POLICY "pets_insert_owner"
    ON pets FOR INSERT
    WITH CHECK (owner_id = auth.uid());

-- Solo el dueño puede actualizar sus mascotas
CREATE POLICY "pets_update_owner"
    ON pets FOR UPDATE
    USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

-- Solo el dueño puede eliminar sus mascotas
CREATE POLICY "pets_delete_owner"
    ON pets FOR DELETE
    USING (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 4.3 ESTABLISHMENTS
-- ---------------------------------------------------------------------------

-- Cualquiera puede ver establecimientos activos
CREATE POLICY "establishments_select_active"
    ON establishments FOR SELECT
    USING (is_active = true);

-- El dueño puede ver todos sus establecimientos (incluso inactivos)
CREATE POLICY "establishments_select_owner"
    ON establishments FOR SELECT
    USING (owner_id = auth.uid());

-- Solo el dueño puede crear establecimientos
CREATE POLICY "establishments_insert_owner"
    ON establishments FOR INSERT
    WITH CHECK (owner_id = auth.uid());

-- Solo el dueño puede actualizar sus establecimientos
CREATE POLICY "establishments_update_owner"
    ON establishments FOR UPDATE
    USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 4.4 APPOINTMENTS
-- ---------------------------------------------------------------------------

-- El cliente puede ver sus citas
CREATE POLICY "appointments_select_client"
    ON appointments FOR SELECT
    USING (client_id = auth.uid());

-- El proveedor puede ver citas de sus establecimientos
CREATE POLICY "appointments_select_provider"
    ON appointments FOR SELECT
    USING (provider_id = auth.uid());

-- El cliente puede crear citas
CREATE POLICY "appointments_insert_client"
    ON appointments FOR INSERT
    WITH CHECK (client_id = auth.uid());

-- El proveedor puede actualizar estado de citas asignadas
CREATE POLICY "appointments_update_provider"
    ON appointments FOR UPDATE
    USING (provider_id = auth.uid());

-- El cliente puede actualizar sus propias citas (cancelar)
CREATE POLICY "appointments_update_client"
    ON appointments FOR UPDATE
    USING (client_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 4.5 MEDICAL_RECORDS
-- ---------------------------------------------------------------------------

-- El vet puede crear registros SOLO si la cita está validada
CREATE POLICY "medical_records_insert_vet"
    ON medical_records FOR INSERT
    WITH CHECK (
        vet_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM appointments a
            WHERE a.id = medical_records.appointment_id
              AND a.status = 'validated'
              AND a.provider_id = auth.uid()
        )
    );

-- El vet puede ver registros que creó
CREATE POLICY "medical_records_select_vet"
    ON medical_records FOR SELECT
    USING (vet_id = auth.uid());

-- El cliente puede ver registros de sus mascotas
CREATE POLICY "medical_records_select_client"
    ON medical_records FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM appointments a
            JOIN pets p ON p.id = a.pet_id
            WHERE a.id = medical_records.appointment_id
              AND p.owner_id = auth.uid()
        )
    );

-- El vet puede actualizar registros que creó
CREATE POLICY "medical_records_update_vet"
    ON medical_records FOR UPDATE
    USING (vet_id = auth.uid())
    WITH CHECK (vet_id = auth.uid());

-- ============================================================================
-- 5. DATOS INICIALES (SEED)
-- ============================================================================

-- Nota: Los datos de seed se manejarán desde la aplicación con Prisma
-- durante el desarrollo local con SQLite. Este script es para Supabase.

-- ============================================================================
-- FIN DEL SCHEMA
-- ============================================================================
