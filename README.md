# 📱 SOS Responder (App Intérprete / Operador)

## 1. Nombre del Sistema y Función

**SOS Responder** es la aplicación móvil Android destinada a los **intérpretes de lengua de señas u operadores del centro de comunicaciones**. Su función principal es:

- Recibir y gestionar **llamadas de video entrantes** de personas sordas que solicitan asistencia.
- Actuar como **intermediario** entre la persona sorda y terceros (servicios de emergencia, familiares, etc.) durante una videollamada.
- Aceptar o rechazar llamadas desde la interfaz de la app, con un estado de **disponibilidad** (en espera / en llamada).
- Consultar el **historial de llamadas** atendidas, perdidas o rechazadas.
- Autenticarse de forma segura con **biometría** (huella dactilar o PIN).
- Registrar automáticamente su número telefónico en el servidor al conectarse, para que las personas sordas puedan localizarlo.

---

## 2. Programas, Librerías y Frameworks Utilizados

### Framework Principal
| Librería | Versión | Propósito |
|---|---|---|
| [React](https://react.dev/) | ^18.3.1 | Construcción de la interfaz de usuario |
| [Vite](https://vitejs.dev/) | 6.3.5 | Bundler y servidor de desarrollo |
| [TypeScript](https://www.typescriptlang.org/) | ^6.0.3 | Tipado estático del código |
| [Tailwind CSS](https://tailwindcss.com/) | 4.1.12 | Estilos utilitarios |

### Framework Móvil / Nativo
| Librería | Versión | Propósito |
|---|---|---|
| [@capacitor/core](https://capacitorjs.com/) | ^8.4.1 | Puente entre la web app y las APIs nativas de Android |
| [@capacitor/android](https://capacitorjs.com/) | ^8.4.1 | Soporte de compilación para Android |
| [@ionic/react](https://ionicframework.com/) | ^8.8.12 | Componentes UI nativos para móvil |
| [@capacitor/geolocation](https://capacitorjs.com/docs/apis/geolocation) | ^8.2.0 | Acceso al GPS del dispositivo |
| [@capacitor/camera](https://capacitorjs.com/docs/apis/camera) | ^8.2.0 | Acceso a la cámara para la videollamada |
| [@capacitor/network](https://capacitorjs.com/docs/apis/network) | ^8.0.1 | Detección de conectividad |
| [@capgo/capacitor-native-biometric](https://github.com/Cap-go/capacitor-native-biometric) | ^8.4.11 | Autenticación biométrica / huella |
| [@capacitor/preferences](https://capacitorjs.com/docs/apis/preferences) | ^8.0.1 | Almacenamiento local persistente (sesión) |

### Comunicación con el Backend
| Librería | Versión | Propósito |
|---|---|---|
| [socket.io-client](https://socket.io/) | ^4.8.3 | Conexión WebSocket en tiempo real (recepción de llamadas, señalización WebRTC) |
| Fetch API (nativa) | — | Llamadas REST al backend (login, historial de llamadas) |
| WebRTC (nativa del navegador) | — | Videollamada peer-to-peer entre operador y usuario |

### Componentes UI y Utilidades
| Librería | Versión | Propósito |
|---|---|---|
| [@radix-ui/react-*](https://www.radix-ui.com/) | Varias | Componentes accesibles (diálogos, menús, tooltips…) |
| [@mui/material](https://mui.com/) | 7.3.5 | Componentes Material Design adicionales |
| [lucide-react](https://lucide.dev/) | 0.487.0 | Iconos SVG |
| [zustand](https://zustand-demo.pmnd.rs/) | ^5.0.14 | Estado global (sesión, llamada activa) |
| [react-router-dom](https://reactrouter.com/) | ^5.3.4 | Navegación entre pantallas |
| [react-hook-form](https://react-hook-form.com/) | 7.55.0 | Manejo de formularios |
| [motion](https://motion.dev/) | 12.23.24 | Animaciones |
| [sonner](https://sonner.emilkowal.ski/) | 2.0.3 | Notificaciones toast |

---

## 3. Tipo de Lenguaje de Programación

| Lenguaje | Tipo | Uso en el proyecto |
|---|---|---|
| **TypeScript** | Fuertemente tipado, compilado a JS | Lógica de la aplicación: servicios de API, manejo del socket, gestión del store |
| **TSX** | TypeScript + JSX | Templates de los componentes React (pantallas de standby, videollamada, historial) |
| **CSS / Tailwind** | Declarativo | Estilos visuales, diseño de pantallas e interfaz del operador |
| **JSON** | Configuración | Configuración de Capacitor, Vite y dependencias |

TypeScript se usó para toda la lógica de negocio (conexión al socket, registro del operador, señalización WebRTC, autenticación) y TSX para todas las pantallas visuales (login, pantalla de espera, videollamada en curso, historial).

---

## 4. Software Necesario para Ejecutar el Proyecto

Debes tener instalado lo siguiente antes de comenzar:

| Software | Versión recomendada | Link de descarga |
|---|---|---|
| **Node.js** | LTS (v20 o superior) | [nodejs.org](https://nodejs.org/) |
| **npm** | Viene con Node.js | — |
| **Android Studio** | Hedgehog o superior | [developer.android.com/studio](https://developer.android.com/studio) |
| **Java JDK** | JDK 17 (incluido con Android Studio) | Instalar desde Android Studio SDK Manager |
| **Android SDK** | API 24 o superior | Instalar desde Android Studio SDK Manager |
| **Git** | Cualquier versión reciente | [git-scm.com](https://git-scm.com/) |

> **Nota:** El Backend debe estar corriendo antes de probar la app. Ver el README del Backend.

---

## 5. Parámetros que se Deben Cambiar para Otro Computador

### 🔴 IP del servidor Backend

La IP hardcodeada apunta al computador donde corre el backend. **Debes cambiarla por la IP local de la máquina donde ejecutas el backend** (obtenla con `ipconfig` en Windows).

**Archivo 1: `src/services/api.ts`** — Línea 8
```typescript
// ❌ Antes (IP del desarrollador original):
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (isCapacitor ? 'http://192.168.1.20:3000' : ...);

// ✅ Después (reemplaza con tu IP local):
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (isCapacitor ? 'http://TU_IP_LOCAL:3000' : ...);
```

**Archivo 2: `vite.config.ts`** — Líneas 43 y 47
```typescript
// ❌ Antes:
target: 'http://192.168.1.20:3000',

// ✅ Después:
target: 'http://TU_IP_LOCAL:3000',
```

> 💡 **Forma recomendada:** En lugar de cambiar la IP manualmente, crea un archivo `.env` en la raíz del proyecto con:
> ```env
> VITE_BACKEND_URL=http://TU_IP_LOCAL:3000
> ```
> Esto sobrescribirá la IP hardcodeada sin necesidad de editar el código.

---

## 6. Cómo Ejecutar el Proyecto

### Paso 1 — Instalar dependencias
Abre una terminal en la carpeta raíz del proyecto y ejecuta:
```bash
npm install
```

### Paso 2 — Ejecutar en el navegador (modo desarrollo web)
Para probar rápidamente en el navegador sin necesidad de Android:
```bash
npm run dev
```
La app estará disponible en `https://localhost:5173` (HTTPS requerido para acceso a la cámara).

### Paso 3 — Compilar para Android
Genera los archivos de producción y sincroniza con el proyecto Android:
```bash
npm run build
npx cap sync android
```

### Paso 4 — Abrir en Android Studio
```bash
npx cap open android
```
En Android Studio, conecta tu teléfono con USB (con **Depuración USB** activada) y presiona el botón **▶ Run** (`Shift + F10`).

### Paso 5 — Actualizar cambios en el celular
Cada vez que modifiques el código, repite:
```bash
npm run build && npx cap sync android
```
Luego presiona **▶ Run** en Android Studio.

---

## 📂 Estructura del Proyecto

```
SOS reponder/
├── src/
│   ├── features/
│   │   ├── auth/         # Pantalla de login del intérprete
│   │   ├── standby/      # Pantalla de espera (disponible para recibir llamadas)
│   │   ├── video-call/   # Pantalla de videollamada en curso
│   │   └── call-history/ # Historial de llamadas atendidas/perdidas
│   ├── services/         # Comunicación con el backend (api.ts, socket, etc.)
│   ├── store/            # Estado global con Zustand
│   ├── components/       # Componentes reutilizables
│   └── main.tsx          # Punto de entrada de la app
├── android/              # Proyecto nativo Android (generado por Capacitor)
├── capacitor.config.json # Configuración de Capacitor
├── vite.config.ts        # Configuración del servidor de desarrollo y build
└── package.json          # Dependencias y scripts
```