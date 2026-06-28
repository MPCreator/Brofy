# Documentación: Sistema de Marcha Blanca y Optimización del Panel de Finanzas de Admin

Este documento recopila de manera detallada las especificaciones técnicas y operativas de las últimas implementaciones realizadas en Brofy referentes a la fase global de **Marcha Blanca** (gratuidad) y la **Optimización/Rediseño de Finanzas en el Panel de Administración**.

---

## 1. Sistema de Marcha Blanca (Fase de Pruebas Gratis)

El sistema de **Marcha Blanca** permite configurar un período durante el cual la plataforma Brofy no cobrará comisiones a los proveedores ni forzará cobros a los clientes finales.

### A. Persistencia en Base de Datos
Se añadió la tabla `SystemSetting` (`system_settings`) en el esquema de Prisma:
```prisma
model SystemSetting {
  key       String   @id
  value     String   @map("value")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("system_settings")
}
```
La configuración de marcha blanca se guarda bajo la clave `marcha_blanca` como un JSON serializado con los campos:
* `active`: Booleano que indica si está activa.
* `startDate`: Fecha de inicio.
* `endDate`: Fecha de finalización.

### B. Lógica en Reservas y Pasarela (Bypass de Cobros)
* **Citas Online (Reservas vía Web)**:
  * Si la marcha blanca está activa, la comisión (`commissionAmount`) se establece en `0.00` al crear la cita.
  * Al procesar el pago (`processPayment` en [actions.ts](file:///Users/luisl/Desktop/Apps/Brofy%20copia/lib/actions.ts)), se detecta el estado de marcha blanca. En lugar de generar una pasarela de pago o redireccionar al simulador de Izipay, la cita se aprueba inmediatamente (`status: 'paid'`, `paymentId: 'FREE-MARCHABLANCA'`), se autogenera el código OTP y se retorna una redirección exitosa.
* **Citas Presenciales (Walk-in / Ficha Rápida)**:
  * El veterinario puede registrar consultas presenciales de forma ilimitada sin acumular deuda. Se guarda la cita con comisión `0.00` y `paymentId: 'FREE-MARCHABLANCA'`.

### C. Alertas y Banners Globales Estandarizados (Evitando Confusión de Cobros)
* **Landing Page**: Si la marcha blanca está activa, se muestra un banner superior general: *"🎉 ¡Estamos en marcha blanca! Disfruta de Brofy 100% gratis para dueños de mascotas y veterinarias hasta el DD/MM/YYYY."*
* **Dashboard del Cliente (Dueño de mascota)**:
  * *Activa*: *"🎉 ¡Estamos en marcha blanca! Disfruta de Brofy 100% gratis hasta el DD/MM/YYYY. Luego, la tarifa regular será de S/ 5.00 por reserva web."*
  * *Inactiva*: *"📢 La marcha blanca ha finalizado. Se aplica la tarifa de S/ 5.00 por reserva web."*
* **Dashboard del Proveedor (Veterinaria)**:
  * *Activa*: *"🎉 ¡Estamos en marcha blanca! Disfruta de Brofy 100% gratis hasta el DD/MM/YYYY. Luego, la comisión por Ficha Rápida (registro manual) será de S/ 6.00."*
  * *Inactiva*: *"📢 La marcha blanca ha finalizado. Se aplica la comisión de S/ 6.00 por Ficha Rápida (registro manual)."*

---

## 2. Rediseño del Panel de Finanzas de Administración

Se implementó un rediseño completo de la interfaz de finanzas para evitar la saturación visual que causaban los múltiples botones alineados de forma horizontal y vertical.

### A. Botón Desplegable Unificado (Dropdown)
En [AdminFinanceRow.tsx](file:///Users/luisl/Desktop/Apps/Brofy%20copia/app/(protected)/dashboard/admin/AdminFinanceRow.tsx) se reemplazaron los botones por un dropdown flotante:
* **Activador único**: Botón **"Cobrar/Facturar ⚙️"** con ícono de flecha rotativa.
* **Posicionamiento Anti-Recorte**: La tarjeta absoluta se posiciona hacia arriba (`bottom-full mb-1`) por defecto. Esto evita que el contenedor scrollable de la tabla (`overflow-x: auto`) recorte el menú.
* **Cierre Automático**: Se incluye una capa invisible trasera (Backdrop) que cierra el menú interactivo con un clic en cualquier parte fuera de él.

### B. Categorización de Acciones de Cobro
Las opciones se agrupan en el menú de la siguiente manera:
1. **Contacto y Alertas**:
   * *Enviar Notificación Web* 🔔: Abre un diálogo modal responsivo para redactar un aviso que se insertará directamente en el dashboard del proveedor.
   * *Enviar WhatsApp* 💬: Redirecciona al chat de WhatsApp oficial pre-escribiendo un mensaje de cobro (sólo si tiene deuda `pendingDebt > 0`).
   * *Copiar Recordatorio* 📋: Copia al portapapeles la plantilla de texto de cobro (sólo si tiene deuda).
2. **Facturación y Comprobantes** (Sólo visible si tiene comisiones cobradas por facturar, `toBillDebt > 0`):
   * *Copiar Plantilla Boleta* 📄: Plantilla de agradecimiento y adjunto de boleta de venta.
   * *Copiar Plantilla Factura* 📊: Plantilla formal de agradecimiento y adjunto de factura comercial.
   * *Marcar Facturado* ✅: Acción masiva para registrar el envío del comprobante y mover el saldo a "Facturado (Enviado)".
3. **Estado y Control**:
   * *Penalizar / Habilitar Cuenta* 🚫/✅: Permite vetar/desvetar manualmente al proveedor por impago de comisiones (el veto deshabilita la creación de fichas clínicas rápidas).

---

## 3. Optimizaciones de Rendimiento y Consultas a la BD

Se realizaron mejoras clave para mitigar la latencia y carga de memoria en el servidor al interactuar con el panel administrativo.

### A. Carga Condicional de Pestañas
Anteriormente, al entrar al panel administrativo o cambiar de pestaña en Next.js, se ejecutaban 6 consultas pesadas a la base de datos de manera simultánea. Ahora, en [page.tsx (admin)](file:///Users/luisl/Desktop/Apps/Brofy%20copia/app/(protected)/dashboard/admin/page.tsx), se consulta la data en base al tab activo (`searchParams.tab`):
* **Auditoría**: Carga de disputas y veterinarios pendientes.
* **Usuarios**: Carga de todos los perfiles de usuario y el libro de reclamaciones.
* **Campañas**: Carga de configuración de Marcha Blanca y alertas.
* **Finanzas**: Carga del panel financiero optimizado.
* **Bitácora**: Carga de logs de auditoría.

### B. Consulta de Auditorías CMVP Optimizada
Se creó la función `getPendingCmvpVets` en [actions.ts](file:///Users/luisl/Desktop/Apps/Brofy%20copia/lib/actions.ts):
```typescript
export async function getPendingCmvpVets() {
    await requireRole(['admin'])
    return prisma.profile.findMany({
        where: {
            role: 'vet',
            NOT: [
                { cmvpId: null },
                { cmvpId: "" }
            ],
            cmvpValidated: false
        },
        orderBy: { createdAt: 'desc' }
    })
}
```
Esto evita descargar la tabla completa de usuarios registrados y filtrarlos en JavaScript.

### C. Optimización del Dashboard de Finanzas
1. **Límite de Bitácora**: En `getAdminFinanceData`, la bitácora de agendamientos históricos del sistema se limitó a las **100 citas más recientes** mediante `take: 100`.
2. **Estadísticas por Agregados**: La cantidad de reservas en línea (S/ 5.00) y manuales (S/ 6.00) se realiza mediante consultas de conteo directas (`prisma.appointment.count`), eliminando la necesidad de procesar miles de citas en memoria mediante JavaScript.
3. **Filtro de Relaciones de Proveedores**: Se añadió un filtro `some` a la consulta de veterinarios, descargando de la base de datos únicamente a aquellos que registren movimientos de comisiones (`DEBT` o `PAID-`). Se seleccionan de manera estricta los campos de local y montos para minimizar el tráfico de red.

---

## 4. Estandarización de Símbolos de Carga (Loaders)

Para homogenizar la experiencia de usuario y evitar animaciones/círculos de carga inconsistentes a lo largo del sistema, se estandarizaron los siguientes puntos:

### A. Reemplazo de Loaders CSS Ad-Hoc
* Modificamos los componentes de visualización y precarga de imágenes `SafeImage` y `PhotoCarousel` para remover los círculos de carga manuales que usaban bordes con transiciones CSS (`border-t-transparent` y clases Tailwind manuales).
* Ahora emplean el spinner oficial `Loader2` de Lucide con las clases de animación rotativas y el color de marca estandarizado: `<Loader2 className="animate-spin text-primary-600 ... animate-in fade-in" />`.

### B. Unificación de Suspensión de Componentes (Suspense Fallbacks)
* Las pantallas y vistas pesadas que cargan datos de forma asíncrona mediante el cliente, tales como:
  * **Ficha Clínica Rápida** (`fast-entry/page.tsx`)
  * **Verificador y Validador de Códigos OTP** (`validate/page.tsx`)
  * **Agenda de Creación de Turnos** (`create-turn/page.tsx`)
* Ahora utilizan de manera homogénea el componente centralizado `<LoadingState size="lg" message="..." description="..." />`. Este muestra un círculo de carga con pista de marca y el isotipo/paw-print de Brofy en animación rebote, dándole una estética premium e idéntica a todos los fallbacks de carga principales.

