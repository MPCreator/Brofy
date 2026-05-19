-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'client',
    "cmvp_id" TEXT,
    "phone" TEXT,
    "avatar_url" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "pets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "owner_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "breed" TEXT,
    "date_of_birth" TEXT,
    "weight" REAL,
    "sex" TEXT,
    "microchip_id" TEXT,
    "photo_url" TEXT,
    "medical_history" TEXT NOT NULL DEFAULT '[]',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "pets_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "establishments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "owner_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "district" TEXT,
    "city" TEXT NOT NULL DEFAULT 'Lima',
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'clinic',
    "qr_code_token" TEXT NOT NULL,
    "phone" TEXT,
    "description" TEXT,
    "photo_url" TEXT,
    "rating" REAL NOT NULL DEFAULT 0.0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "operating_hours" TEXT NOT NULL DEFAULT '{}',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "establishments_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "client_id" TEXT NOT NULL,
    "pet_id" TEXT NOT NULL,
    "establishment_id" TEXT NOT NULL,
    "provider_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "service_type" TEXT NOT NULL DEFAULT 'consultation',
    "commission_amount" REAL NOT NULL DEFAULT 5.00,
    "commission_type" TEXT NOT NULL DEFAULT 'booking',
    "otp_validation_code" TEXT,
    "otp_expires_at" DATETIME,
    "payment_id" TEXT,
    "notes" TEXT,
    "scheduled_at" DATETIME,
    "completed_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "appointments_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "profiles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "appointments_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "pets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "appointments_establishment_id_fkey" FOREIGN KEY ("establishment_id") REFERENCES "establishments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "appointments_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "profiles" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "medical_records" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appointment_id" TEXT NOT NULL,
    "vet_id" TEXT NOT NULL,
    "weight" REAL,
    "temperature" REAL,
    "heart_rate" INTEGER,
    "symptoms" TEXT NOT NULL DEFAULT '[]',
    "diagnosis" TEXT,
    "prescription" TEXT,
    "treatment" TEXT,
    "next_visit" TEXT,
    "attachments" TEXT NOT NULL DEFAULT '[]',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "medical_records_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "medical_records_vet_id_fkey" FOREIGN KEY ("vet_id") REFERENCES "profiles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_email_key" ON "profiles"("email");

-- CreateIndex
CREATE UNIQUE INDEX "establishments_qr_code_token_key" ON "establishments"("qr_code_token");

-- CreateIndex
CREATE UNIQUE INDEX "medical_records_appointment_id_key" ON "medical_records"("appointment_id");
