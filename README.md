# SOS Responder

SOS Responder es una aplicación móvil diseñada para facilitar la respuesta a emergencias. Permite a los usuarios tener a la mano un sistema rápido y seguro para solicitar asistencia cuando más lo necesitan.

## Características Principales

* **Interfaz Intuitiva:** Diseño limpio y fácil de usar, pensado para momentos de alto estrés.
* **Historial de Llamadas:** Registro detallado del historial de alertas y emergencias pasadas.
* **Seguridad Biométrica:** Acceso protegido a la aplicación usando la huella digital o el PIN del dispositivo (Lock Screen).
* **Autenticación Persistente:** Sesiones guardadas de forma segura para evitar tener que iniciar sesión repetidamente, manteniendo una capa de seguridad con biometría.

## Tecnologías Utilizadas

Este proyecto fue construido utilizando un stack moderno para desarrollo móvil multiplataforma:

* **[React](https://reactjs.org/)**: Librería principal para construir la interfaz de usuario.
* **[Vite](https://vitejs.dev/)**: Entorno de desarrollo ultra rápido.
* **[Ionic Framework](https://ionicframework.com/)**: Componentes UI nativos para una experiencia fluida.
* **[Capacitor](https://capacitorjs.com/)**: Puente nativo para acceder a funcionalidades del dispositivo (como la biometría) y compilar para Android/iOS.
* **[Tailwind CSS](https://tailwindcss.com/)**: Framework de utilidades CSS para un estilizado rápido y consistente.
* **[Zustand](https://zustand-demo.pmnd.rs/)**: Manejo de estado global, ligero y rápido.

## Requisitos Previos

Para ejecutar y compilar este proyecto localmente, necesitas tener instalado:

* Node.js (versión 16+ recomendada)
* npm o yarn
* Android Studio (para compilar en Android)
* Xcode (para compilar en iOS, solo en macOS)

## Instalación y Ejecución Local

1. **Clona el repositorio**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd "SOS reponder"
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Ejecuta el servidor de desarrollo en la web**
   ```bash
   npm run dev
   ```

4. **Compila y sincroniza con el proyecto nativo (Android)**
   ```bash
   npm run build
   npx cap sync android
   ```

5. **Corre la aplicación en un dispositivo Android o emulador**
   ```bash
   npx cap run android
   ```

## Estructura del Proyecto

* `src/`: Código fuente de la aplicación React (Componentes, features, estado).
* `android/`: Proyecto nativo de Android generado por Capacitor.
* `public/`: Recursos públicos y assets (íconos, imágenes).
* `capacitor.config.ts`: Configuración principal de Capacitor.

## Licencia

Este proyecto está reservado para uso privado y autorizado.