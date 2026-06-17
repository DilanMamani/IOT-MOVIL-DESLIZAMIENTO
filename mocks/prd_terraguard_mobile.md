# PRD: TerraGuard Mobile - Sistema de Monitoreo IoT

## 1. Visión General
TerraGuard Mobile es una extensión móvil de la plataforma de monitoreo de sensores IoT, diseñada específicamente para usuarios que necesitan vigilancia en tiempo real de riesgos geológicos y ambientales (movimiento de tierra, deslizamientos, humedad y temperatura). La aplicación prioriza la entrega inmediata de alertas críticas y la gestión personalizada de umbrales de seguridad.

## 2. Objetivos del Producto
*   Proporcionar una interfaz móvil de alta seguridad para el monitoreo de sensores remotos.
*   Notificar a los usuarios en tiempo real sobre desviaciones críticas en la telemetría.
*   Permitir a los usuarios configurar sus propias reglas de alerta basadas en los datos de los sensores.
*   Ofrecer un historial auditable de eventos y estados del sistema.

## 3. Público Objetivo
*   Personal de seguridad y mantenimiento industrial.
*   Geólogos y técnicos de monitoreo ambiental.
*   Administradores de infraestructuras en zonas de riesgo.

## 4. Especificaciones Funcionales

### 4.1. Gestión de Acceso
*   **Registro:** Creación de cuenta con validación de datos.
*   **Autenticación:** Inicio de sesión seguro con cifrado de grado militar.

### 4.2. Monitoreo en Tiempo Real
*   **Monitor de Alertas:** Vista principal con el "feed" en vivo de incidentes.
    *   Tarjetas de alerta con ubicación, lectura y hora exacta.
    *   Acciones de descarte, silencio o investigación.
*   **Estado de Sensores:** Listado detallado de todos los nodos activos.
    *   Lecturas de vibración terrestre (g), deslizamiento (mm), caudal (m³/s), gas (ppm), humedad (%) y temperatura (°C).
    *   Indicadores visuales de estado (Online, Alert, Critical, Offline).

### 4.3. Configuración de Reglas
*   Permitir la creación de reglas personalizadas (ej. "Si Temp > 32°C -> Notificar").
*   Selección de tipo de telemetría, umbral numérico y lógica (mayor/menor que).
*   Asignación de niveles de urgencia (Baja, Media, Alta, Crítica).

### 4.4. Notificaciones Push
*   Alertas visuales detalladas en pantalla de bloqueo.
*   Jerarquía visual basada en la severidad del evento.
*   Acciones rápidas directamente desde la notificación.

### 4.5. Historial y Auditoría
*   Registro histórico de todos los eventos pasados.
*   Filtros por categoría (Críticos, Sistema, Sensores).
*   Estado de resolución de cada alerta (Auto-resuelto, Manual, Cerrado).

## 5. Diseño y UX
*   **Tema:** Modo oscuro (TerraGuard Dark) para reducir la fatiga visual y resaltar indicadores de alerta.
*   **Color de Acento:** Naranja vibrante (#FF6B00) para llamadas a la acción y estados de advertencia.
*   **Tipografía:** DM Sans para máxima legibilidad en dispositivos móviles.
*   **Iconografía:** Técnica y funcional, enfocada en la claridad del sensor.

## 6. Stack Tecnológico (Referencia)
*   **Frontend:** React Native.
*   **Backend API:** Integración con la estructura de sensores existente (referencia GitHub: TaniaPerezD/sensores-iot).
*   **Seguridad:** Protocolos de encriptación end-to-end.
