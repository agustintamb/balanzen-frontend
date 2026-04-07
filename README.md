# Balanzen Frontend

Instrucciones basicas para levantar el proyecto localmente en Android (sin iOS).

## Requisitos

- Node.js 20 o superior
- npm
- Android Studio

## Instalacion

1. Instalar dependencias:

```bash
npm install
```

2. Crear archivo local de entorno (ya incluido en el repo):

```bash
cp .env.local.example .env.local
```

## Configuracion local

El proyecto usa `APP_ENV=local` al ejecutar `npm run start` y `npm run android`.

Edita `.env.local` si necesitas cambiar la configuracion:

```env
API_LOCAL_PORT=3001
API_LOCAL_DEVICE_URL=http://TU_IP_LOCAL:3001/api/v1
```

Notas:

- En Android emulador se usa `http://10.0.2.2:PUERTO/api/v1`.

## Instalar Android Studio

1. Descargar Android Studio desde la web oficial e instalarlo.
2. Abrir Android Studio y completar el Setup Wizard con instalacion estandar.
3. Ir a Settings > Android SDK (o Preferences > Android SDK en macOS) y verificar:
	- Android SDK Platform (ultima estable)
	- Android SDK Platform-Tools
	- Android Emulator
4. Abrir SDK Manager y asegurarte de tener esas dependencias instaladas.

## Crear emulador Pixel 9

1. Abrir Android Studio > Device Manager.
2. Click en Create Device.
3. Elegir categoria Phone y seleccionar Pixel 9.
4. Seleccionar una system image recomendada (por ejemplo, Android 14 o superior).
5. Finalizar con nombre por defecto o personalizado.
6. Iniciar el emulador desde Device Manager y dejarlo abierto.

## Ejecutar proyecto

Iniciar Metro/Expo:

```bash
npm run start
```

Levantar directamente en Android (con emulador abierto):

```bash
npm run android
```

Alternativa: abrir Metro y luego presionar `a` en la terminal para lanzar Android.
