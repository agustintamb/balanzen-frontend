# Guía de Setup — BalanZen Frontend

Pasos para levantar el frontend limpio desde cero.

---

## 1. Obtener la última versión

```bash
git checkout develop
git pull origin develop
```

---

## 2. Limpiar e instalar dependencias

```bash
rm -rf node_modules
npm install
```

---

## 3. Configurar variables de entorno

Copiar el archivo de ejemplo:

```bash
cp .env.local.example .env.local
```

Editar `.env.local` y completar los valores:

```env
API_LOCAL_PORT=3001

GOOGLE_MAPS_API_KEY=AIzaSyCKTPafXKApquSpILgeenTE4s3OyksbwFo

API_LOCAL_DEVICE_URL=http://<TU_IP>:3001/api/v1
```

> La API key de Google Maps ya está incluida arriba — copiala tal cual.

### Obtener tu IP

```bash
# Linux
hostname -I | awk '{print $1}'

# macOS
ipconfig getifaddr en0

# Windows
ipconfig | findstr IPv4
```

Reemplazar `<TU_IP>` en `API_LOCAL_DEVICE_URL` con el valor obtenido.

---

## 4. Levantar la app

```bash
npm start
```

Desde la terminal de Expo podés presionar:
- `a` — abrir en emulador Android
- Escanear el QR con **Expo Go** para dispositivo físico

---

## Verificación rápida

```bash
npm test   # corre todos los tests unitarios
```
