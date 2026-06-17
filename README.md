# SlideWatch Mobile

App móvil (React Native + Expo) para el monitoreo en tiempo real de sensores IoT de deslizamiento de tierra, construida a partir de los mocks de diseño de Google Stitch.

## Estructura del repositorio

- `mocks/` — Diseños exportados de Google Stitch (HTML/CSS de referencia + `DESIGN.md` con los tokens de diseño: colores, tipografía, spacing).
- `mobile/` — App móvil en Expo + TypeScript.

## Backend

Esta app consume la API de [`BackIOT_Sensores`](https://github.com/DilanMamani/BackIOT_Sensores) (Express + PostgreSQL/Neon + Socket.IO). Ese backend corre en un repositorio separado y debe estar levantado (`npm run dev`) para que la app funcione.

## App móvil (`mobile/`)

### Stack

- Expo + TypeScript
- NativeWind (Tailwind para React Native) con los tokens de `mocks/terraguard_mobile/DESIGN.md`
- React Navigation (stack de auth + tabs principales)
- Socket.IO client para alertas en tiempo real
- `expo-notifications` para notificaciones locales cuando llega una alerta por socket
- `expo-secure-store` para persistir la sesión (JWT)

### Pantallas

- **Login / Registro**
- **Monitor de Alertas** — feed en vivo de alertas abiertas (descartar / silenciar)
- **Estado de Sensores** — dispositivos y sus lecturas actuales
- **Historial** — alertas pasadas con filtro por categoría
- **Configuración** — canales de notificación + creación/eliminación de reglas de alerta (umbral, operador, urgencia)

### Variables de entorno

Copiar `mobile/.env.example` a `mobile/.env` y completar con la URL del backend:

```
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_SOCKET_URL=http://localhost:3000
```

- **Simulador iOS / emulador en la misma máquina que el backend:** `localhost` funciona (Android emulator: usar `10.0.2.2` en su lugar).
- **Celular físico con Expo Go:** usar la IP LAN de la máquina que corre el backend (ej. `192.168.x.x`), no `localhost`.

### Cómo correrla

```bash
cd mobile
npm install
npx expo start
```

Con el backend corriendo en paralelo, abrir la app en un simulador o en Expo Go.

### Limitaciones conocidas

- Las notificaciones son **locales**, disparadas por eventos de Socket.IO mientras la app está abierta o en background activo. No hay push real (con la app cerrada) porque el backend no registra tokens de push todavía.
- Los toggles de "Canales Activos" en Configuración son preferencias locales del dispositivo, no afectan la evaluación de alertas del backend.
