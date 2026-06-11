# BalanZen — Frontend

Marketplace de alimentos por vencer. Consumidores reservan productos con descuento; comercios reducen pérdidas.

**Stack:** React Native · Expo SDK 54 · Expo Router · React Query · NativeWind · Zustand

---

## Requisitos

| Herramienta    | Versión   | Notas                  |
| -------------- | --------- | ---------------------- |
| Node.js        | ≥ 20      |                        |
| npm            | ≥ 10      | incluido con Node      |
| Java JDK       | 17        | ver instalación abajo  |
| Android Studio | última estable | incluye SDK y emulador |

---

## Instalación

```bash
npm install
```

---

## Variables de entorno

Copiá `.env.local` y completá tus valores:

```env
# Puerto del backend local
API_LOCAL_PORT=3001

# Entorno: local | testing | production (default: local)
APP_ENV=local

# Google Maps API Key — necesaria para el mapa en Android
# Conseguila en: https://console.cloud.google.com/ → Maps SDK for Android
GOOGLE_MAPS_API_KEY=

# Solo necesario si usás un dispositivo físico (no emulador)
# Obtené tu IP: ip route get 1.1.1.1 (Linux/Mac) / ipconfig (Windows)
# API_LOCAL_DEVICE_URL=http://192.168.x.x:3001/api/v1
```

> **Emulador Android:** el backend local se resuelve automáticamente como `http://10.0.2.2:3001/api/v1`.
>
> **Dispositivo físico:** descomentá `API_LOCAL_DEVICE_URL` con tu IP local. El dispositivo y la PC deben estar en la misma red.

Después de editar `.env.local`, reiniciá Metro con `--clear`:

```bash
npx expo start --clear
```

---

## Java JDK 17

### Linux

```bash
# Ubuntu/Debian
sudo apt install openjdk-17-jdk

# Fedora/RHEL
sudo dnf install java-17-openjdk-devel

# Verificar
java -version
```

### macOS

```bash
# Con Homebrew
brew install --cask zulu@17

# Agregar a ~/.zshrc o ~/.bashrc
export JAVA_HOME=/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home

# Verificar
java -version
```

> Si ya tenés Android Studio instalado podés usar su JDK:
> `export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"`

### Windows

```powershell
winget install EclipseAdoptium.Temurin.17.JDK
```

> El instalador configura `JAVA_HOME` automáticamente. Verificar con `java -version` en PowerShell.

---

## Android Studio y emulador

1. Descargar e instalar [Android Studio](https://developer.android.com/studio)
2. En el Setup Wizard elegir **Standard Installation**
3. En **Settings → Android SDK** verificar que estén instalados:
   - Android SDK Platform (API 35+)
   - Android SDK Platform-Tools
   - Android Emulator
4. Crear un AVD en **Device Manager** (Device: Pixel 9, System Image: **Google Play**)
5. Iniciar el emulador antes de correr la app

### Variables de entorno del SDK (si Expo no lo detecta)

**Linux/macOS** — agregar a `~/.bashrc` o `~/.zshrc`:

```bash
export ANDROID_HOME=$HOME/Android/Sdk          # Linux
# export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
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

### Uso diario

```bash
npm run start
```

Presionás `a` para abrir en el emulador Android. Usá `--clear` si hay problemas de caché:

```bash
npx expo start --clear
```

### Primera vez o al agregar módulos nativos

```bash
npx expo run:android
```

Compila la app nativa e instala el dev client en el emulador. **Tarda 5–15 minutos la primera vez.** Después, `npm run start` ya no usa Expo Go sino el dev client instalado.

#### ¿Cuándo recompilar?

| Situación | ¿Recompilar? |
| --------- | ------------ |
| Cambié una pantalla, componente o lógica JS | ❌ No |
| Instalé un nuevo paquete con módulo nativo | ✅ Sí |
| Cambié plugins o permisos en `app.json` | ✅ Sí |
| Actualicé la versión de Expo SDK | ✅ Sí |

---

## Scripts

| Comando                | Descripción                                   |
| ---------------------- | --------------------------------------------- |
| `npm run start`        | Levanta Metro (Expo Go o dev client)          |
| `npx expo run:android` | Compilación nativa + instala dev client       |
| `npm test`             | Tests unitarios                               |
| `npm run test:coverage`| Tests con reporte de cobertura               |
| `npm run lint`         | ESLint                                        |
| `npm run format`       | Prettier sobre todo el proyecto               |
