# BalanZen — Frontend

Marketplace de alimentos por vencer. Consumidores reservan productos con descuento; comercios reducen pérdidas.

**Stack:** React Native · Expo SDK 54 · Expo Router · React Query · NativeWind · Zustand

---

## Requisitos

| Herramienta    | Versión        | Notas                  |
| -------------- | -------------- | ---------------------- |
| Node.js        | ≥ 20           |                        |
| npm            | ≥ 10           | incluido con Node      |
| Java JDK       | 17             | ver instalación abajo  |
| Android Studio | última estable | incluye SDK y emulador |

---

## Instalación

```bash
npm install
```

---

## Variables de entorno

Editá `.env.local` con tus valores locales:

```env
# Puerto del backend local
API_LOCAL_PORT=3001

# Google Maps API Key — necesaria para el mapa en Android (nativa build)
# Conseguila en: https://console.cloud.google.com/
# Habilitá: Maps SDK for Android → crear credencial tipo API Key
GOOGLE_MAPS_API_KEY=

# Solo necesario en dispositivo físico (no emulador)
# API_LOCAL_DEVICE_URL=http://192.168.x.x:3001/api/v1
```

> En emulador Android, el backend local se accede como `http://10.0.2.2:PUERTO/api/v1` (configurado automáticamente).

---

## Java JDK 17

Necesario para compilar el proyecto Android nativo.

### macOS

```bash
# Instalar con Homebrew (recomendado)
brew install --cask zulu@17

# Agregar JAVA_HOME a ~/.zshrc (o ~/.bashrc)
echo 'export JAVA_HOME=/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home' >> ~/.zshrc
source ~/.zshrc

# Verificar
java -version   # debe mostrar openjdk version "17.x.x"
```

> Si ya tenés Android Studio instalado, podés usar su JDK integrado:
>
> ```bash
> echo 'export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"' >> ~/.zshrc
> source ~/.zshrc
> ```

### Windows

```powershell
# Opción 1: winget (recomendado)
winget install EclipseAdoptium.Temurin.17.JDK

# Opción 2: descargar instalador desde https://www.azul.com/downloads/?package=jdk
# Seleccionar Java 17, Windows, .msi → instalar con opciones por defecto
# El instalador configura JAVA_HOME automáticamente
```

Verificar en PowerShell:

```powershell
java -version   # debe mostrar openjdk version "17.x.x"
```

---

## Android Studio y emulador

1. Descargar e instalar [Android Studio](https://developer.android.com/studio)
2. En el Setup Wizard elegir **Standard Installation**
3. Ir a **Settings → Android SDK** y verificar que estén instalados:
   - Android SDK Platform (API 35 o superior)
   - Android SDK Platform-Tools
   - Android Emulator
4. Crear un AVD en **Device Manager**:
   - Device: **Pixel 9**
   - System Image: elegir una con **"Google APIs"** o **"Google Play"** (necesario para Google Maps)
5. Iniciar el emulador y dejarlo corriendo

### Variables de entorno del SDK (si Expo no lo detecta)

**macOS** — agregar a `~/.zshrc`:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

**Windows** — agregar a Variables de entorno del sistema:

```
ANDROID_HOME = %LOCALAPPDATA%\Android\Sdk
PATH += %LOCALAPPDATA%\Android\Sdk\emulator
PATH += %LOCALAPPDATA%\Android\Sdk\platform-tools
```

---

## Levantar la app

### Uso diario (solo JS — sin módulos nativos)

```bash
npm run start
# o
npx expo start
```

Presionás `a` para abrir en Android. Usa **Expo Go** — rápido, pero **no incluye módulos nativos** (react-native-maps, expo-location, etc.).

### Primera vez o al agregar módulos nativos (native build)

```bash
npx expo run:android
```

Esto compila la app con todos los módulos nativos y la instala en el emulador. **Tarda 5-15 minutos** la primera vez.

Después de esta compilación, `npm run start` / `npx expo start` ya no usa Expo Go sino el **dev client** instalado, que incluye todos los módulos nativos. Los cambios de JS siguen viéndose al instante.

#### ¿Cuándo hay que volver a correr `expo run:android`?

| Situación                                                                 | ¿Recompilar?                 |
| ------------------------------------------------------------------------- | ---------------------------- |
| Cambié una pantalla, componente o lógica JS                               | ❌ No — `expo start` alcanza |
| Instalé un nuevo módulo nativo (`expo-camera`, `react-native-maps`, etc.) | ✅ Sí                        |
| Cambié plugins, permisos o `android.config` en `app.json`                 | ✅ Sí                        |
| El mapa u otro módulo nativo no funciona / aparece fallback               | ✅ Sí                        |
| Actualicé la versión de Expo SDK                                          | ✅ Sí                        |

---

## Módulos que requieren build nativa

Estos módulos **no funcionan en Expo Go** y necesitan haber corrido `expo run:android` al menos una vez:

- `react-native-maps` (mapa)
- `expo-location` (GPS)
- `expo-dev-client` (el dev client mismo)

---

## Scripts disponibles

| Comando                | Descripción                             |
| ---------------------- | --------------------------------------- |
| `npm run start`        | Metro/Expo (Expo Go o dev client)       |
| `npm run android`      | Igual a `expo start --android`          |
| `npx expo run:android` | Compilación nativa + instala dev client |
| `npm test`             | Tests unitarios                         |
| `npm run lint`         | ESLint                                  |
| `npm run format`       | Prettier                                |
