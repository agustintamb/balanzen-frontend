# BalanZen — Mapeo de API: Controladores, Endpoints y Modelos de Datos

**Versión:** 1.3.1
**Fecha:** 30/04/2026  
**Grupo:** 7 — Desarrollo de Aplicaciones I  
**Stack:** Node.js + Express + MongoDB (Mongoose) + Cloudinary

---

## Convenciones

- Base URL: `/api/v1`
- Autenticación: Bearer Token (JWT) en header `Authorization`
- Roles: `CONSUMIDOR` | `COMERCIO` | `ADMIN`
- IDs: UUID v4 (string) en todos los documentos
- Respuestas estándar: `200 OK`, `201 Created`, `204 No Content`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`
- Imágenes: Cloudinary. El frontend envía la imagen como multipart al backend, el backend la sube a Cloudinary y almacena la URL base. El frontend aplica transformaciones dinámicas sobre la URL.
- Paginación: Todos los listados soportan `page` (default 1) y `limit` (default 20). Response incluye objeto `pagination`.
- Timestamps: `created_at` en todos los modelos. `updated_at` solo en User, Address, Category, Publication y Order. Message, Notification y Favorite no tienen `updated_at`.
- Nombres de campos en **inglés**.
- Soft delete: Todos los modelos incluyen `deleted_at` (ver sección Soft Delete).
- Direcciones: Ambos roles usan el modelo Address. Ambos pueden tener múltiples. Ambos tienen una seleccionada (`is_selected: true`).

---

## Rol ADMIN

No existe un backoffice ni frontend de administración. El admin opera via Postman/Swagger.

### Cómo funciona

- Los controladores de negocio (1-11) son **exclusivos** para `CONSUMIDOR` y `COMERCIO`. El admin **no accede** a estos endpoints.
- Todo lo que el admin necesita se resuelve desde el **Admin Controller** (controlador 12), que tiene sus propios endpoints de lectura y gestión.
- Si a futuro se necesita una operación admin que no existe, se agrega como endpoint nuevo en el Admin Controller. No se tocan los controladores de negocio.
- No se expone registro de admin por API. Se crea directamente en la base de datos (seed o manual).

### Ejemplo de uso

```
# Todo pasa por el admin controller
GET /api/v1/admin/users                    ← todos los usuarios
GET /api/v1/admin/users/uuid              ← perfil completo de cualquier usuario
GET /api/v1/admin/publications             ← todas las publicaciones
GET /api/v1/admin/orders                   ← todas las órdenes
```

---

## Soft Delete

Todas las entidades implementan borrado lógico. Ningún documento se elimina físicamente de la base de datos.

### Implementación

- Cada modelo tiene un campo `deleted_at: Date (default null)`.
- `deleted_at === null` → documento activo.
- `deleted_at === Date` → documento borrado lógicamente.
- Se configura un middleware global de Mongoose (`pre('find')`, `pre('findOne')`, etc.) que agrega automáticamente `{ deleted_at: null }` a todas las queries.
- Para que el admin pueda ver documentos borrados, se agrega un query param `include_deleted=true` que desactiva el filtro.
- La operación de "borrar" es un `PATCH` interno que setea `deleted_at: new Date()`.

### Campos en cada modelo

```
deleted_at:  Date (default null)
```

> **Nota:** En los schemas de abajo, `deleted_at` se incluye implícitamente en todos los modelos. No se repite en cada uno para no ser redundante.

---

# PARTE 1 — MODELOS DE DATOS

---

## Modelo: User

Documento único para los tres roles. Los campos exclusivos de comercio se almacenan solo cuando `role === 'COMERCIO'`. La dirección no se embebe; se usa el modelo Address para ambos roles.

```
{
  _id:              String (UUID v4, PK)
  email:            String (unique, required, max 100, lowercase, trim)
  password:         String (required, hashed con bcrypt, min original 8 chars alfanuméricos)
  role:             String (required, enum: ['CONSUMIDOR', 'COMERCIO', 'ADMIN'])

  first_name:       String (required, max 50, trim)
  last_name:        String (required, max 50, trim)
  phone:            String (required, max 20, trim)
  dni:              String (required, max 15, trim)
  photo_url:        String (default null — URL de Cloudinary)

  // --- Solo COMERCIO ---
  business_name:    String (max 100, trim — nombre del comercio, string libre)
  cuit:             String (max 15, trim)
  description:      String (max 500, default null — descripción del negocio, opcional)

  deleted_at:       Date (default null)
  created_at:       Date (auto)
  updated_at:       Date (auto)
}
```

**Índices:** `email` (unique), `role`  
**Nota:** La dirección (tanto de comercio como de consumidor) se almacena en el modelo Address. `GET /users/me` popula la `selected_address` desde Address.

---

## Modelo: Address

Direcciones de cualquier usuario. Mismo modelo para consumidores y comercios.

- **Consumidor:** Puede tener múltiples. Debe tener al menos una. Una marcada como `is_selected`.
- **Comercio:** Puede tener múltiples. Debe tener al menos una. Una marcada como `is_selected`.

```
{
  _id:                String (UUID v4, PK)
  user_id:            String (UUID, ref: User, required)

  formatted_address:  String (required, max 200)
  street:             String (required, max 100)
  number:             String (required, max 10)
  city:               String (required, max 100)
  province:           String (required, max 100)
  lat:                Number (required)
  lng:                Number (required)
  is_selected:        Boolean (default false)

  deleted_at:         Date (default null)
  created_at:         Date (auto)
  updated_at:         Date (auto)
}
```

**Índices:** `user_id`, compound `{ user_id, is_selected }`

---

## Modelo: Category

```
{
  _id:       String (UUID v4, PK)
  name:      String (required, unique, max 100, trim)
  icon_url:  String (default null)
  active:    Boolean (default true)

  deleted_at: Date (default null)
  created_at: Date (auto)
  updated_at: Date (auto)
}
```

**Índices:** `name` (unique)  
**Validación:** No se pueden crear dos categorías con el mismo `name` (case-insensitive).

---

## Modelo: Publication

Entidad padre. Cada publicación = 1 unidad de venta.

```
{
  _id:              String (UUID v4, PK)
  commerce_id:      String (UUID, ref: User, required)

  title:            String (required, max 100, trim)
  description:      String (required, max 500, trim)
  original_price:   Number (required, min 0 — precio de lista)
  final_price:      Number (required, min 0 — precio con descuento)
  expiry_date:      Date (required — fecha de vencimiento del producto)
  category_id:      String (UUID, ref: Category, required)
  photos:           [String] (array de URLs de Cloudinary, max 5 items)

  status:           String (required, enum: ['ACTIVE','RESERVED','DELIVERED','CANCELLED','EXPIRED'], default 'ACTIVE')
  is_donation:      Boolean (default false — se calcula: original_price === final_price)

  deleted_at:       Date (default null)
  created_at:       Date (auto)
  updated_at:       Date (auto)
}
```

**Índices:** `commerce_id`, `status`, `category_id`, `expiry_date`  
**Virtual (calculado):** `discount_pct` → `Math.round((1 - final_price / original_price) * 100)`

---

## Modelo: Order

Entidad hija de Publication. Solo una activa (RESERVED) por publicación a la vez.

```
{
  _id:              String (UUID v4, PK)
  publication_id:   String (UUID, ref: Publication, required)
  consumer_id:      String (UUID, ref: User, required)
  commerce_id:      String (UUID, ref: User, required — se copia de la publicación para queries rápidas)

  status:           String (required, enum: ['RESERVED','DELIVERED','CANCELLED'], default 'RESERVED')

  deleted_at:       Date (default null)
  created_at:       Date (auto)
  updated_at:       Date (auto)
}
```

**Índices:** `publication_id`, `consumer_id`, `commerce_id`, `status`, compound `{ publication_id, status }`

---

## Modelo: Message

Mensajes de chat, asociados a un pedido.

```
{
  _id:          String (UUID v4, PK)
  order_id:     String (UUID, ref: Order, required)
  sender_id:    String (UUID, ref: User, required)
  content:      String (required, max 1000, trim)

  deleted_at:   Date (default null)
  created_at:   Date (auto)
}
```

**Índices:** `order_id`, compound `{ order_id, created_at }`

---

## Modelo: Notification

```
{
  _id:              String (UUID v4, PK)
  user_id:          String (UUID, ref: User, required — destinatario)

  type:             String (required, enum: [
                      'NEW_RESERVATION',
                      'RESERVATION_CANCELLED_BY_CONSUMER',
                      'RESERVATION_CANCELLED_BY_COMMERCE',
                      'ORDER_DELIVERED',
                      'NEW_MESSAGE',
                      'PUBLICATION_EXPIRING',
                      'PUBLICATION_EXPIRED'
                    ])
  title:            String (required, max 100)
  message:          String (required, max 300)
  reference_id:     String (UUID — id de la publicación u order relacionada)
  reference_type:   String (enum: ['PUBLICATION', 'ORDER'])
  read:             Boolean (default false)

  deleted_at:       Date (default null)
  created_at:       Date (auto)
}
```

**Índices:** `user_id`, compound `{ user_id, read }`, `created_at`

---

## Modelo: Favorite

```
{
  _id:              String (UUID v4, PK)
  user_id:          String (UUID, ref: User, required)
  publication_id:   String (UUID, ref: Publication, required)

  deleted_at:       Date (default null)
  created_at:       Date (auto)
}
```

**Índices:** compound `{ user_id, publication_id }` (unique — evita duplicados)

---

# PARTE 2 — CONTROLADORES Y ENDPOINTS

> **Nota sobre la columna "Rol":** Indica qué roles pueden usar el endpoint. Los controladores 1-11 son exclusivos para `CONSUMIDOR` y `COMERCIO`. El `ADMIN` opera únicamente a través del controlador 12.

---

## 1. Auth Controller (`/auth`)

Registro, login, cierre de sesión y cambio de contraseña. Sin verificación por email. Sin "olvidé mi contraseña".

### Registro por rol

**Consumidor (1 paso):** first_name, last_name, email, password, confirm_password, phone, dni. No se pide dirección en el registro; se fuerza a cargar al menos una dirección tras el primer login.

**Comercio (1 request):** first_name, last_name, email, password, confirm_password, phone, dni, business_name, cuit. El campo `description` es opcional.

> **Flujo interno para comercio:** Solo crea el documento User. La dirección NO se crea durante el registro. Se debe cargar después del primer login via `POST /addresses`.  
> **Flujo interno para consumidor:** Solo crea el documento User. La dirección se carga después del primer login (pantalla forzada).

### Endpoints

| Método | Endpoint         | Descripción                                              | Auth | Rol   |
| ------ | ---------------- | -------------------------------------------------------- | ---- | ----- |
| POST   | `/auth/register` | Registra usuario. Body según rol.                        | No   | —     |
| POST   | `/auth/login`    | Login. Retorna tokens + perfil básico con `has_address`. | No   | —     |
| POST   | `/auth/refresh`  | Renueva access token con refresh token.                  | Sí   | Ambos |
| POST   | `/auth/logout`   | Invalida tokens.                                         | Sí   | Ambos |
| PUT    | `/auth/password` | Cambia contraseña.                                       | Sí   | Ambos |

### Request / Response

**POST `/auth/register`** (consumidor)
```json
// Request
{
  "role": "CONSUMIDOR",
  "first_name": "Juan",
  "last_name": "Pérez",
  "email": "juan@mail.com",
  "password": "miPass123",
  "confirm_password": "miPass123",
  "phone": "1155667788",
  "dni": "35123456"
}

// Response 201
{
  "id": "uuid-...",
  "email": "juan@mail.com",
  "role": "CONSUMIDOR",
  "first_name": "Juan",
  "last_name": "Pérez",
  "access_token": "eyJ...",
  "refresh_token": "eyJ..."
}
```

**POST `/auth/register`** (comercio)
```json
// Request
{
  "role": "COMERCIO",
  "first_name": "María",
  "last_name": "López",
  "email": "maria@comercio.com",
  "password": "miPass123",
  "confirm_password": "miPass123",
  "phone": "1144556677",
  "dni": "30987654",
  "business_name": "Verdulería Don Mario",
  "cuit": "20309876543",
  "description": "Frutas y verduras frescas todos los días"
}

// Response 201
{
  "id": "uuid-...",
  "email": "maria@comercio.com",
  "role": "COMERCIO",
  "first_name": "María",
  "last_name": "López",
  "business_name": "Verdulería Don Mario",
  "access_token": "eyJ...",
  "refresh_token": "eyJ..."
}
```

**POST `/auth/login`**
```json
// Request
{
  "email": "juan@mail.com",
  "password": "miPass123"
}

// Response 200
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "user": {
    "id": "uuid-...",
    "email": "juan@mail.com",
    "role": "CONSUMIDOR",
    "first_name": "Juan",
    "last_name": "Pérez",
    "photo_url": null,
    "has_address": false
  }
}
```

**PUT `/auth/password`**
```json
// Request
{
  "current_password": "miPass123",
  "new_password": "nuevoPass456",
  "confirm_password": "nuevoPass456"
}

// Response 200
{ "message": "Contraseña actualizada correctamente" }
```

---

## 2. Users Controller (`/users`)

Gestión del perfil. `selected_address` se devuelve con la misma key para ambos roles.

### Campos editables por rol

**Consumidor:** first_name, last_name, email, phone, photo_url.  
**Comercio:** first_name, last_name, email, phone, photo_url, business_name, description.

> La dirección se gestiona desde el Addresses Controller, no desde el perfil.

### Endpoints

| Método | Endpoint             | Descripción                                                  | Auth | Rol   |
| ------ | -------------------- | ------------------------------------------------------------ | ---- | ----- |
| GET    | `/users/me`          | Perfil completo del autenticado. Incluye `selected_address`. | Sí   | Ambos |
| PUT    | `/users/me`          | Actualiza perfil (campos según rol).                         | Sí   | Ambos |
| GET    | `/users/{id}/public` | Datos públicos de otro usuario.                              | Sí   | Ambos |

### Request / Response

**GET `/users/me`** (consumidor)
```json
{
  "id": "uuid-...",
  "email": "juan@mail.com",
  "role": "CONSUMIDOR",
  "first_name": "Juan",
  "last_name": "Pérez",
  "phone": "1155667788",
  "dni": "35123456",
  "photo_url": "https://res.cloudinary.com/xxx/image/upload/v123/foto.jpg",
  "has_address": true,
  "selected_address": {
    "id": "uuid-addr-...",
    "formatted_address": "Av. Santa Fe 2000, CABA",
    "street": "Av. Santa Fe",
    "number": "2000",
    "city": "CABA",
    "province": "Buenos Aires",
    "lat": -34.5955,
    "lng": -58.3977
  },
  "created_at": "2026-04-20T10:00:00Z"
}
```

**GET `/users/me`** (comercio)
```json
{
  "id": "uuid-...",
  "email": "maria@comercio.com",
  "role": "COMERCIO",
  "first_name": "María",
  "last_name": "López",
  "phone": "1144556677",
  "dni": "30987654",
  "photo_url": null,
  "business_name": "Verdulería Don Mario",
  "cuit": "20309876543",
  "description": null,
  "has_address": true,
  "selected_address": {
    "id": "uuid-addr-...",
    "formatted_address": "Av. Corrientes 1234, CABA, Buenos Aires",
    "street": "Av. Corrientes",
    "number": "1234",
    "city": "CABA",
    "province": "Buenos Aires",
    "lat": -34.6037,
    "lng": -58.3816
  },
  "created_at": "2026-04-20T10:00:00Z"
}
```

**PUT `/users/me`** (campos opcionales, solo se envían los que cambian)
```json
// Request ejemplo consumidor
{
  "first_name": "Juan Carlos",
  "phone": "1199887766",
  "photo_url": "https://res.cloudinary.com/xxx/image/upload/v456/nueva.jpg"
}

// Request ejemplo comercio
{
  "business_name": "Verdulería Don Mario - Sucursal Centro",
  "description": "Frutas y verduras frescas todos los días"
}
```

**GET `/users/{id}/public`**
```json
// Comercio visto por consumidor
{
  "id": "uuid-...",
  "first_name": "María",
  "last_name": "López",
  "photo_url": "https://...",
  "business_name": "Verdulería Don Mario",
  "selected_address": {
    "formatted_address": "Av. Corrientes 1234, CABA, Buenos Aires",
    "lat": -34.6037,
    "lng": -58.3816
  }
}

// Consumidor visto por comercio
{
  "id": "uuid-...",
  "first_name": "Juan",
  "last_name": "Pérez",
  "photo_url": "https://..."
}
```

---

## 3. Addresses Controller (`/addresses`)

Búsqueda geocodificada + CRUD de direcciones.

- **Consumidor:** CRUD completo, múltiples direcciones, una seleccionada. Obligatoria al menos una post-login.
- **Comercio:** CRUD completo, múltiples direcciones, una seleccionada. Obligatoria al menos una post-login. La dirección NO se crea durante el registro.
- **Admin:** Usa el Admin Controller para listar direcciones de cualquier usuario.

### Endpoints

| Método | Endpoint                      | Descripción                                                 | Auth | Rol   |
| ------ | ----------------------------- | ----------------------------------------------------------- | ---- | ----- |
| GET    | `/addresses/search?q={query}` | Busca direcciones via geocoding externo.                    | Sí   | Ambos |
| GET    | `/addresses`                  | Lista direcciones del usuario autenticado.                  | Sí   | Ambos |
| POST   | `/addresses`                  | Crea nueva dirección. Siempre con `is_selected: false`.     | Sí   | Ambos |
| PUT    | `/addresses/{id}`             | Actualiza dirección propia.                                 | Sí   | Ambos |
| DELETE | `/addresses/{id}`             | Soft delete. No permitido si es la única o la seleccionada. | Sí   | Ambos |
| PUT    | `/addresses/{id}/select`      | Marca como seleccionada/activa.                             | Sí   | Ambos |

### Request / Response

**GET `/addresses/search?q=corrientes 1234`**
```json
// Response 200
{
  "results": [
    {
      "formatted_address": "Av. Corrientes 1234, CABA, Buenos Aires, Argentina",
      "street": "Av. Corrientes",
      "number": "1234",
      "city": "CABA",
      "province": "Buenos Aires",
      "lat": -34.6037,
      "lng": -58.3816
    }
  ]
}
```

**POST `/addresses`**
```json
// Request
{
  "formatted_address": "Av. Corrientes 1234, CABA, Buenos Aires, Argentina",
  "street": "Av. Corrientes",
  "number": "1234",
  "city": "CABA",
  "province": "Buenos Aires",
  "lat": -34.6037,
  "lng": -58.3816
}

// Response 201
{
  "id": "uuid-...",
  "formatted_address": "Av. Corrientes 1234, CABA, Buenos Aires, Argentina",
  "street": "Av. Corrientes",
  "number": "1234",
  "city": "CABA",
  "province": "Buenos Aires",
  "lat": -34.6037,
  "lng": -58.3816,
  "is_selected": false
}
```

> **Nota:** `is_selected` es siempre `false` al crear. Usar `PUT /addresses/{id}/select` para activarla.

**GET `/addresses`**
```json
// Response 200
{
  "addresses": [
    {
      "id": "uuid-1",
      "formatted_address": "Av. Corrientes 1234, CABA",
      "street": "Av. Corrientes",
      "number": "1234",
      "city": "CABA",
      "province": "Buenos Aires",
      "lat": -34.6037,
      "lng": -58.3816,
      "is_selected": true
    },
    {
      "id": "uuid-2",
      "formatted_address": "Av. Santa Fe 2000, CABA",
      "street": "Av. Santa Fe",
      "number": "2000",
      "city": "CABA",
      "province": "Buenos Aires",
      "lat": -34.5955,
      "lng": -58.3977,
      "is_selected": false
    }
  ]
}
```

---

## 4. Categories Controller (`/categories`)

Catálogo dinámico de categorías. La gestión (crear, editar, eliminar) se realiza desde el Admin Controller.

| Método | Endpoint      | Descripción                                    | Auth | Rol   |
| ------ | ------------- | ---------------------------------------------- | ---- | ----- |
| GET    | `/categories` | Lista categorías activas. Retorna id y nombre. | Sí   | Ambos |

### Response

**GET `/categories`**
```json
{
  "categories": [
    { "id": "uuid-...", "name": "Verduras" },
    { "id": "uuid-...", "name": "Frutas" },
    { "id": "uuid-...", "name": "Panificados" },
    { "id": "uuid-...", "name": "Lácteos" },
    { "id": "uuid-...", "name": "Carnes" },
    { "id": "uuid-...", "name": "Bebidas" },
    { "id": "uuid-...", "name": "Otros" }
  ]
}
```

> **Nota:** La carga inicial de categorías se hace por seed. El CRUD completo está en el Admin Controller.

---

## 5. Uploads Controller (`/uploads`)

### Endpoints

| Método | Endpoint         | Descripción                   | Auth | Rol   |
| ------ | ---------------- | ----------------------------- | ---- | ----- |
| POST   | `/uploads/image` | Sube imagen a Cloudinary.     | Sí   | Ambos |
| DELETE | `/uploads/image` | Elimina imagen de Cloudinary. | Sí   | Ambos |

### POST `/uploads/image`

El request se envía como **`multipart/form-data`**, no como JSON. El archivo va en un campo llamado `image`.

```
POST /api/v1/uploads/image
Authorization: Bearer <token>
Content-Type: multipart/form-data

------boundary
Content-Disposition: form-data; name="image"; filename="foto.jpg"
Content-Type: image/jpeg

<bytes del archivo>
------boundary--
```

```json
// Response 201
{
  "url": "https://res.cloudinary.com/xxx/image/upload/v123/abc123.jpg"
}
```

> **Desde el frontend (React Native / Expo):** Se envía usando `FormData`:
> ```javascript
> const formData = new FormData();
> formData.append('image', {
>   uri: imageUri,
>   type: 'image/jpeg',
>   name: 'photo.jpg'
> });
> fetch('/api/v1/uploads/image', {
>   method: 'POST',
>   headers: { Authorization: `Bearer ${token}` },
>   body: formData
> });
> ```

### DELETE `/uploads/image`

```json
// Request (JSON)
{
  "url": "https://res.cloudinary.com/xxx/image/upload/v123/abc123.jpg"
}

// Response 200
{ "message": "Imagen eliminada correctamente" }
```

### Transformaciones en el upload (backend → Cloudinary)

| Transformación | Valor     | Descripción                     |
| -------------- | --------- | ------------------------------- |
| `quality`      | `auto`    | Calidad óptima automática.      |
| `format`       | `auto`    | WebP/AVIF según dispositivo.    |
| `width`        | `800` max | Redimensiona proporcionalmente. |
| `crop`         | `limit`   | Solo reduce, nunca agranda.     |

### Transformaciones dinámicas (frontend, sobre la URL base)

| Contexto          | Params insertados en URL           | Tamaño    |
| ----------------- | ---------------------------------- | --------- |
| Thumbnail en card | `w_400,h_400,c_fill,q_auto,f_auto` | 400×400   |
| Full en detalle   | `w_800,q_auto,f_auto`              | 800×prop. |
| Avatar en chat    | `w_100,h_100,c_fill,q_auto,f_auto` | 100×100   |
| Foto en perfil    | `w_200,h_200,c_fill,q_auto,f_auto` | 200×200   |

---

## 6. Publications Controller (`/publications`)

Sin valoraciones/estrellas. Sin horarios de comercio. Retiro siempre "en local", coordinación por chat.

### Estados

```
ACTIVE  →  RESERVED  →  DELIVERED
  │            │
  │            └──→ ACTIVE (cancelación de reserva, si no venció)
  │
  └──→ CANCELLED (baja manual del comercio)
  └──→ EXPIRED (cron job)
```

### Endpoints

| Método | Endpoint             | Descripción                               | Auth | Rol        |
| ------ | -------------------- | ----------------------------------------- | ---- | ---------- |
| POST   | `/publications`      | Crea publicación.                         | Sí   | COMERCIO   |
| GET    | `/publications`      | Lista activas con filtros.                | Sí   | CONSUMIDOR |
| GET    | `/publications/{id}` | Detalle completo.                         | Sí   | Ambos      |
| PUT    | `/publications/{id}` | Edita (solo si ACTIVE).                   | Sí   | COMERCIO   |
| DELETE | `/publications/{id}` | Soft delete (solo si ACTIVE → CANCELLED). | Sí   | COMERCIO   |
| GET    | `/publications/me`   | Mis publicaciones (todos los estados). Filtros: `status`, `date_from`, `date_to`. Incluye `unread_count` y `order_id` por publicación (ver abajo). | Sí   | COMERCIO   |

### Query params para `GET /publications`

| Param          | Tipo    | Descripción                                                            |
| -------------- | ------- | ---------------------------------------------------------------------- |
| `category_id`  | string  | UUID de categoría.                                                     |
| `min_discount` | number  | % mínimo de descuento.                                                 |
| `max_price`    | number  | Precio final máximo.                                                   |
| `sort_by`      | string  | `created_at`, `discount_pct`, `expiry_date`, `final_price`, `distance` |
| `sort_order`   | string  | `asc` o `desc`                                                         |
| `lat`          | number  | Latitud consumidor (de su dirección seleccionada).                     |
| `lng`          | number  | Longitud consumidor.                                                   |
| `radius_km`    | number  | Radio máximo km.                                                       |
| `donation`     | boolean | Tri-estado: ausente → todas; `true` → solo donaciones; `false` → excluye donaciones (afecta resultados y `pagination.total`). |
| `search`       | string  | Búsqueda en título/descripción.                                        |
| `page`         | number  | Default 1.                                                             |
| `limit`        | number  | Default 20.                                                            |

### Request / Response

**POST `/publications`**
```json
// Request
{
  "title": "Mix de verduras del día",
  "description": "Tomate, lechuga, zanahoria y cebolla. Vence hoy.",
  "original_price": 3000,
  "final_price": 1500,
  "expiry_date": "2026-04-23T23:59:00Z",
  "category_id": "uuid-cat-verduras",
  "photos": [
    "https://res.cloudinary.com/xxx/image/upload/v1/foto1.jpg",
    "https://res.cloudinary.com/xxx/image/upload/v1/foto2.jpg"
  ]
}

// Response 201
{
  "id": "uuid-pub-...",
  "title": "Mix de verduras del día",
  "description": "Tomate, lechuga, zanahoria y cebolla. Vence hoy.",
  "original_price": 3000,
  "final_price": 1500,
  "discount_pct": 50,
  "expiry_date": "2026-04-23T23:59:00Z",
  "category": { "id": "uuid-cat-verduras", "name": "Verduras" },
  "photos": ["https://...", "https://..."],
  "status": "ACTIVE",
  "is_donation": false,
  "commerce": {
    "id": "uuid-commerce",
    "business_name": "Verdulería Don Mario",
    "first_name": "María",
    "last_name": "López",
    "phone": "1144556677",
    "selected_address": { "formatted_address": "Av. Corrientes 1234, CABA", "lat": -34.6037, "lng": -58.3816 }
  },
  "created_at": "2026-04-22T14:30:00Z"
}
```

> El objeto `commerce` (en **todas** las respuestas de publicación: `POST /publications`,
> `GET /publications`, `GET /publications/{id}`, `GET /publications/me` y
> `GET /orders/{id}.publication.commerce`) incluye los datos de contacto del dueño:
> `first_name`, `last_name` y `phone`.

**GET `/publications`** (listado para consumidor)
```json
// Response 200
{
  "publications": [
    {
      "id": "uuid-pub-...",
      "title": "Mix de verduras del día",
      "original_price": 3000,
      "final_price": 1500,
      "discount_pct": 50,
      "expiry_date": "2026-04-23T23:59:00Z",
      "category": { "id": "uuid-...", "name": "Verduras" },
      "photos": ["https://..."],
      "status": "ACTIVE",
      "is_donation": false,
      "commerce": {
        "id": "uuid-...",
        "business_name": "Verdulería Don Mario",
        "selected_address": { "formatted_address": "Av. Corrientes 1234, CABA", "lat": -34.6037, "lng": -58.3816 }
      },
      "distance_km": 1.2,
      "created_at": "2026-04-22T14:30:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 45, "total_pages": 3 }
}
```

**GET `/publications/me`** (listado del comercio — todos los estados)

Cada item tiene la misma forma que en `GET /publications` más dos campos extra:

```json
{
  "id": "uuid-pub-...",
  "title": "Mix de verduras del día",
  "...": "resto de campos de publicación (igual que GET /publications)",
  "status": "RESERVED",
  "unread_count": 2,
  "order_id": "uuid-order-..."
}
```

> `order_id`: id de la reserva activa cuando `status === "RESERVED"`; `null` en
> cualquier otro estado. Permite al comercio navegar directo a `GET /orders/{order_id}`
> desde su home.

**GET `/publications/{id}`** (detalle)

Misma forma que un item de `GET /publications`. Además, cuando
`status === "RESERVED"`, incluye `order_id` (string) con el id de la order activa
de esa reserva — el mismo dato que `GET /publications/me`. En cualquier otro
estado (`ACTIVE`, `DELIVERED`, `CANCELLED`, `EXPIRED`) el campo se **omite** del
JSON, así que tratarlo como opcional. El frontend lo usa para redirigir al
comercio desde el detalle de su publicación al detalle de la orden apenas se la
reservan (refrescando con `new_notification` tipo `NEW_RESERVATION`).

> Devuelve también las publicaciones **soft-deleted / canceladas** (200 con su
> `status` real `"CANCELLED"`), igual que `GET /orders/{id}` con `findWithDeleted`;
> no tira 404 para ellas. El frontend decide el modo de la pantalla por el campo
> `status`: editable solo para `ACTIVE`; read-only / finalizada para `CANCELLED`,
> `EXPIRED` y `DELIVERED`. Editar (`PUT`) y eliminar (`DELETE`) siguen restringidos
> a `ACTIVE` (409 si no lo está).

---

## 7. Orders Controller (`/orders`)

### Reglas de negocio

- 1 reserva activa por publicación.
- Cancelar → publicación vuelve a ACTIVE (si no venció).
- Nueva reserva = nuevo ID.
- Acciones sobre order disparan cambio de estado en publicación.

### Endpoints

| Método | Endpoint               | Descripción                                                 | Auth | Rol        |
| ------ | ---------------------- | ----------------------------------------------------------- | ---- | ---------- |
| POST   | `/orders`              | Crea reserva.                                               | Sí   | CONSUMIDOR |
| GET    | `/orders`              | Lista pedidos del usuario autenticado. Filtros: `status`, `date_from`, `date_to`. | Sí   | Ambos      |
| GET    | `/orders/{id}`         | Detalle del pedido.                                         | Sí   | Ambos      |
| PUT    | `/orders/{id}/cancel`  | Cancela reserva.                                            | Sí   | Ambos      |
| PUT    | `/orders/{id}/deliver` | Marca entregado.                                            | Sí   | COMERCIO   |

### Request / Response

**POST `/orders`**
```json
// Request
{ "publication_id": "uuid-pub-..." }

// Response 201
{
  "id": "uuid-order-...",
  "publication": {
    "id": "uuid-pub-...",
    "title": "Mix de verduras del día",
    "final_price": 1500,
    "photos": ["https://..."]
  },
  "consumer": { "id": "uuid-...", "first_name": "Juan", "last_name": "Pérez" },
  "commerce": {
    "id": "uuid-...",
    "business_name": "Verdulería Don Mario",
    "selected_address": { "formatted_address": "Av. Corrientes 1234, CABA" }
  },
  "status": "RESERVED",
  "created_at": "2026-04-22T15:00:00Z",
  "updated_at": "2026-04-22T15:00:00Z"
}
```

**GET `/orders`** — parámetros opcionales

| Param       | Tipo     | Descripción                                          |
| ----------- | -------- | ---------------------------------------------------- |
| `status`    | string   | `RESERVED`, `DELIVERED` o `CANCELLED`                |
| `date_from` | ISO 8601 | Filtra `created_at >= date_from`                     |
| `date_to`   | ISO 8601 | Filtra `created_at <= date_to`                       |
| `page`      | integer  | default `1`                                          |
| `limit`     | integer  | default `20`                                         |

> Si se pasan ambos, se valida que `date_from <= date_to` (400 si no se cumple).

Ejemplo: `GET /orders?status=RESERVED&date_from=2026-06-13T00:00:00.000Z&date_to=2026-06-13T23:59:59.999Z`

(consumidor)
```json
{
  "orders": [
    {
      "id": "uuid-order-...",
      "publication": {
        "id": "uuid-pub-...",
        "title": "Mix de verduras del día",
        "final_price": 1500,
        "photos": ["https://..."]
      },
      "commerce": {
        "id": "uuid-...",
        "business_name": "Verdulería Don Mario",
        "selected_address": { "formatted_address": "Av. Corrientes 1234, CABA" }
      },
      "status": "RESERVED",
      "created_at": "2026-04-22T15:00:00Z",
      "updated_at": "2026-04-22T15:00:00Z",
      "unread_count": 2
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 3, "total_pages": 1 }
}
```

> `unread_count`: mensajes del otro participante no leídos para esa orden. Se resetea al abrir el chat (`GET /chats/:orderId/messages`) o al enviar un mensaje.

**GET `/orders/{id}`** (detalle)

A diferencia del listado y de `POST /orders` (que embeben la publicación
**resumida**), el detalle embebe la publicación **completa** (misma forma que
`GET /publications/{id}`) y el `consumer` con `photo_url`. Un solo request alcanza
para pintar la pantalla de detalle. El backend resuelve la publicación con
`findWithDeleted`, así que sigue disponible aunque haya sido soft-deleteada.

```json
{
  "id": "uuid-order-...",
  "publication": {
    "id": "uuid-pub-...",
    "title": "Mix de verduras del día",
    "description": "Tomate, lechuga, zanahoria y cebolla.",
    "original_price": 3000,
    "final_price": 1500,
    "discount_pct": 50,
    "expiry_date": "2026-04-23T23:59:00Z",
    "category": { "id": "uuid-cat-...", "name": "Verduras" },
    "photos": ["https://..."],
    "status": "RESERVED",
    "is_donation": false,
    "commerce": {
      "id": "uuid-commerce",
      "business_name": "Verdulería Don Mario",
      "first_name": "María",
      "last_name": "López",
      "phone": "1144556677",
      "selected_address": { "formatted_address": "Av. Corrientes 1234, CABA", "lat": -34.6, "lng": -58.4 }
    },
    "created_at": "2026-04-22T14:30:00Z"
  },
  "consumer": { "id": "uuid-...", "first_name": "Juan", "last_name": "Pérez", "phone": "1155667788", "photo_url": null },
  "commerce": {
    "id": "uuid-...",
    "business_name": "Verdulería Don Mario",
    "selected_address": { "formatted_address": "Av. Corrientes 1234, CABA" }
  },
  "status": "RESERVED",
  "created_at": "2026-04-22T15:00:00Z",
  "updated_at": "2026-04-22T15:00:00Z"
}
```

> Hay **dos** `commerce`: el de nivel superior (`order.commerce`) solo trae
> `{ id, business_name, selected_address.formatted_address }`; el de adentro de la
> publicación (`order.publication.commerce`) trae los datos de contacto del dueño
> (`first_name`, `last_name`, `phone`) y `lat`/`lng`. Para el mapa y la card de
> datos, usar el de la publicación. `selected_address` puede ser `null`.
> El `consumer` incluye `phone` (puede ser `null`).

---

## 8. Chat Controller (`/chats`)

### Reglas

- Chat habilitado solo con pedido en RESERVED.
- Cada order tiene su chat aislado.
- Post entrega/cancelación → solo lectura.
- Coordinación de día/horario de retiro por chat.

### Endpoints REST

| Método | Endpoint                    | Descripción                                   | Auth | Rol   |
| ------ | --------------------------- | --------------------------------------------- | ---- | ----- |
| GET    | `/chats`                    | Lista conversaciones del usuario autenticado. | Sí   | Ambos |
| GET    | `/chats/{orderId}/messages` | Mensajes de un chat. Paginado.                | Sí   | Ambos |
| POST   | `/chats/{orderId}/messages` | Envía mensaje (solo si RESERVED).             | Sí   | Ambos |

### WebSocket — Conexión General (`/ws`)

Una sola conexión WebSocket por usuario para toda la app. Se establece al abrir la app y maneja tanto **chat** como **notificaciones**.

> **Conexión:** `/ws` es el **`path`** de socket.io (namespace default `/`), no un
> namespace. Cliente: `io("<host>", { path: "/ws" })` (no `io("<host>/ws")`).
> El token **no** va en el handshake: el cliente emite `authenticate { token }`
> tras `connect` y debe esperar `authenticated` antes de `join_chat`/`typing`
> (esos handlers ignoran al socket sin autenticar). El JWT debe tener `id`.

**Eventos de chat:**

| Evento        | Dirección        | Payload                                       |
| ------------- | ---------------- | --------------------------------------------- |
| `join_chat`   | Cliente → Server | `{ order_id }`                                |
| `leave_chat`  | Cliente → Server | `{ order_id }`                                |
| `new_message` | Server → Cliente | `{ order_id, sender_id, content, timestamp }` |
| `typing`      | Cliente → Server | `{ order_id, is_typing }`                     |
| `user_typing` | Server → Cliente | `{ order_id, user_id, is_typing }`            |
| `user_online` | Server → Cliente | `{ user_id, is_online }`                      |

**Eventos de notificaciones:**

| Evento             | Dirección        | Payload                                                                  |
| ------------------ | ---------------- | ------------------------------------------------------------------------ |
| `new_notification` | Server → Cliente | `{ id, type, title, message, reference_id, reference_type, created_at }` |

> `new_notification` es **1-a-1**: se emite solo al usuario destinatario. `type`,
> `reference_type` y `reference_id` vienen siempre poblados (ver tabla en la sección
> Notifications). El cliente usa este evento para refrescar el detalle/listados del
> destinatario, badge de la campanita y badge de chat sin leer.

**Eventos de sincronización (broadcast):**

| Evento                | Dirección        | Payload                              |
| --------------------- | ---------------- | ------------------------------------ |
| `publication_changed` | Server → Cliente | `{ publication_id, status? }`        |

> `publication_changed` es un **broadcast global**: lo reciben todos los sockets
> conectados (no es 1-a-1). Se emite cada vez que cambia el set de publicaciones
> visibles: alta (`ACTIVE`), reserva (`RESERVED`), cancelación de reserva (`ACTIVE`),
> vencimiento (`EXPIRED`) y baja del comercio (`CANCELLED`). **No** se emite al
> entregar (`DELIVERED`), porque esa publicación ya estaba reservada y no figuraba en
> los listados de disponibles. `status` es **opcional y orientativo** — el cliente lo
> trata solo como señal e invalida la caché de `["publications"]` para resincronizar
> los listados de todos (ej. el home del consumidor cuando un comercio da de baja una
> publicación). `publication_id` siempre viene.

**Conexión y autenticación:**

| Evento          | Dirección        | Payload             |
| --------------- | ---------------- | ------------------- |
| `authenticate`  | Cliente → Server | `{ token }`         |
| `authenticated` | Server → Cliente | `{ user_id }`       |
| `error`         | Server → Cliente | `{ code, message }` |

> **Flujo:** El cliente abre la app → conecta a `/ws` → envía `authenticate` con el JWT → recibe `authenticated` → queda escuchando `new_notification` globalmente. Si entra a un chat, envía `join_chat` y empieza a recibir `new_message`, `user_typing`, etc. Al salir del chat, envía `leave_chat`.  
> **Notificaciones:** Cada vez que el backend genera una notificación (nueva reserva, mensaje, entrega, etc.), emite `new_notification` al usuario destinatario si está conectado. El cliente puede mostrar un toast, actualizar el badge de la campanita, o refrescar el listado.

### Request / Response

**GET `/chats`**
```json
{
  "chats": [
    {
      "order_id": "uuid-order-...",
      "counterpart": {
        "id": "uuid-...",
        "first_name": "María",
        "last_name": "López",
        "photo_url": "https://...",
        "business_name": "Verdulería Don Mario"
      },
      "publication_title": "Mix de verduras del día",
      "last_message": {
        "content": "Paso a las 18hs, te parece?",
        "sender_id": "uuid-...",
        "created_at": "2026-04-22T16:30:00Z"
      },
      "unread_count": 2,
      "order_status": "RESERVED"
    }
  ]
}
```

**GET `/chats/{orderId}/messages`**
```json
{
  "messages": [
    {
      "id": "uuid-msg-...",
      "sender_id": "uuid-...",
      "content": "Hola, paso a retirar a las 18hs",
      "created_at": "2026-04-22T16:30:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 50, "total": 12, "total_pages": 1 }
}
```

**POST `/chats/{orderId}/messages`**
```json
// Request
{ "content": "Hola, paso a retirar a las 18hs" }

// Response 201
{
  "id": "uuid-msg-...",
  "order_id": "uuid-order-...",
  "sender_id": "uuid-...",
  "content": "Hola, paso a retirar a las 18hs",
  "created_at": "2026-04-22T16:30:00Z"
}
```

---

## 9. Notifications Controller (`/notifications`)

### Endpoints

| Método | Endpoint                   | Descripción                                                                                                        | Auth | Rol   |
| ------ | -------------------------- | ------------------------------------------------------------------------------------------------------------------ | ---- | ----- |
| GET    | `/notifications`           | Lista notificaciones del usuario autenticado. Filtro por `read`. Incluye `unread_count` en la respuesta. Paginado. | Sí   | Ambos |
| PUT    | `/notifications/{id}/read` | Marca como leída.                                                                                                  | Sí   | Ambos |
| PUT    | `/notifications/read-all`  | Marca todas como leídas.                                                                                           | Sí   | Ambos |

### Tipos de notificación (generadas automáticamente por el backend)

| Tipo                                | Disparador                 | Destinatario |
| ----------------------------------- | -------------------------- | ------------ |
| `NEW_RESERVATION`                   | Consumidor reserva.        | Comercio     |
| `RESERVATION_CANCELLED_BY_CONSUMER` | Consumidor cancela.        | Comercio     |
| `RESERVATION_CANCELLED_BY_COMMERCE` | Comercio cancela.          | Consumidor   |
| `ORDER_DELIVERED`                   | Comercio entrega.          | Consumidor   |
| `NEW_MESSAGE`                       | Nuevo mensaje en chat.     | Contraparte  |
| `PUBLICATION_EXPIRING`              | Publicación vence en 24hs. | Comercio     |
| `PUBLICATION_EXPIRED`               | Publicación venció (cron). | Comercio     |

### Notificaciones en tiempo real

Las notificaciones se emiten por WebSocket (ver sección WebSocket general). Cuando el backend genera una notificación, emite un evento `new_notification` al usuario destinatario. El cliente recibe la notificación y puede mostrar un toast, actualizar el badge de la campanita, o refrescar la lista.

### Response

**GET `/notifications`**
```json
{
  "unread_count": 3,
  "notifications": [
    {
      "id": "uuid-notif-...",
      "type": "NEW_RESERVATION",
      "title": "Nueva reserva",
      "message": "Tu publicación Mix de verduras fue reservada.",
      "reference_id": "uuid-order-...",
      "reference_type": "ORDER",
      "read": false,
      "created_at": "2026-04-22T15:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 5, "total_pages": 1 }
}
```

---

## 10. Favorites Controller (`/favorites`)

| Método | Endpoint                     | Descripción                                        | Auth | Rol        |
| ------ | ---------------------------- | -------------------------------------------------- | ---- | ---------- |
| POST   | `/favorites/{publicationId}` | Agrega a favoritos.                                | Sí   | CONSUMIDOR |
| DELETE | `/favorites/{publicationId}` | Quita de favoritos (soft delete).                  | Sí   | CONSUMIDOR |
| GET    | `/favorites`                 | Lista favoritos del usuario autenticado. Paginado. | Sí   | CONSUMIDOR |

> **Toggle:** el `DELETE` hace soft delete (no borra físicamente). Un `POST`
> posterior sobre la misma publicación **reactiva** el documento existente
> (no crea uno nuevo ni devuelve 409). Es seguro hacer agregar → quitar → agregar.

```json
// GET /favorites → Response 200
{
  "favorites": [
    {
      "id": "uuid-fav-...",
      "publication": {
        "id": "uuid-pub-...",
        "title": "Mix de verduras del día",
        "original_price": 3000,
        "final_price": 1500,
        "discount_pct": 50,
        "photos": ["https://..."],
        "status": "ACTIVE",
        "commerce": {
          "business_name": "Verdulería Don Mario",
          "selected_address": { "formatted_address": "Av. Corrientes 1234, CABA" }
        }
      },
      "created_at": "2026-04-22T10:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 2, "total_pages": 1 }
}
```

---

## 11. Metrics Controller (`/metrics`)

| Método | Endpoint           | Descripción                                  | Auth | Rol      |
| ------ | ------------------ | -------------------------------------------- | ---- | -------- |
| GET    | `/metrics/summary` | Métricas generales del comercio autenticado. | Sí   | COMERCIO |

```json
// Response 200
{
  "total_publications": 25,
  "active_publications": 8,
  "total_reservations": 18,
  "total_delivered": 14,
  "total_cancelled": 4,
  "conversion_rate": 77.8
}
```

---

## 12. Admin Controller (`/admin`)

Endpoints exclusivos para el rol ADMIN. Los controladores de negocio (1-11) son inaccesibles para el admin. Todo lo que el admin necesita se resuelve desde acá. Si a futuro se requiere una operación nueva, se agrega como endpoint en este controlador.

### Listados globales

| Método | Endpoint              | Descripción                                                                                                                  | Auth | Rol   |
| ------ | --------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---- | ----- |
| GET    | `/admin/users`        | Lista todos los usuarios. Filtros: `role`, `search` (por nombre o email). Paginado.                                          | Sí   | ADMIN |
| GET    | `/admin/users/{id}`   | Perfil completo de cualquier usuario, incluyendo sus direcciones.                                                            | Sí   | ADMIN |
| GET    | `/admin/publications` | Todas las publicaciones (todos los estados, todos los comercios). Filtros: `status`, `commerce_id`, `category_id`. Paginado. | Sí   | ADMIN |
| GET    | `/admin/orders`       | Todas las órdenes. Filtros: `status`, `consumer_id`, `commerce_id`, `date_from`, `date_to`. Paginado.                        | Sí   | ADMIN |

### Gestión de categorías

| Método | Endpoint                 | Descripción                                             | Auth | Rol   |
| ------ | ------------------------ | ------------------------------------------------------- | ---- | ----- |
| POST   | `/admin/categories`      | Crea categoría. Valida nombre único (case-insensitive). | Sí   | ADMIN |
| PUT    | `/admin/categories/{id}` | Edita categoría. Valida nombre único.                   | Sí   | ADMIN |
| DELETE | `/admin/categories/{id}` | Soft delete de categoría.                               | Sí   | ADMIN |

### Request / Response

**GET `/admin/users?role=COMERCIO&search=mario`**
```json
{
  "users": [
    {
      "id": "uuid-...",
      "email": "maria@comercio.com",
      "role": "COMERCIO",
      "first_name": "María",
      "last_name": "López",
      "phone": "1144556677",
      "dni": "30987654",
      "business_name": "Verdulería Don Mario",
      "cuit": "20309876543",
      "photo_url": null,
      "has_address": true,
      "selected_address": {
        "formatted_address": "Av. Corrientes 1234, CABA",
        "lat": -34.6037,
        "lng": -58.3816
      },
      "created_at": "2026-04-20T10:00:00Z",
      "deleted_at": null
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 1, "total_pages": 1 }
}
```

**GET `/admin/users/{id}`**
```json
{
  "id": "uuid-...",
  "email": "juan@mail.com",
  "role": "CONSUMIDOR",
  "first_name": "Juan",
  "last_name": "Pérez",
  "phone": "1155667788",
  "dni": "35123456",
  "photo_url": "https://...",
  "addresses": [
    {
      "id": "uuid-addr-1",
      "formatted_address": "Av. Santa Fe 2000, CABA",
      "is_selected": true
    },
    {
      "id": "uuid-addr-2",
      "formatted_address": "Av. Rivadavia 5000, CABA",
      "is_selected": false
    }
  ],
  "created_at": "2026-04-20T10:00:00Z",
  "deleted_at": null
}
```

> **Nota:** El admin puede usar `?include_deleted=true` en estos endpoints para ver documentos borrados lógicamente.

### Categorías — Request / Response

**POST `/admin/categories`**
```json
// Request
{ "name": "Congelados" }

// Response 201
{ "id": "uuid-...", "name": "Congelados", "active": true }
```

**PUT `/admin/categories/{id}`**
```json
// Request
{ "name": "Productos Congelados" }

// Response 200
{ "id": "uuid-...", "name": "Productos Congelados", "active": true }
```

---

## Resumen

| #   | Controlador   | Base Path        | Endpoints   | Descripción                                  |
| --- | ------------- | ---------------- | ----------- | -------------------------------------------- |
| 1   | Auth          | `/auth`          | 5           | Registro, login, refresh, logout, password   |
| 2   | Users         | `/users`         | 3           | Perfil propio, edición, datos públicos       |
| 3   | Addresses     | `/addresses`     | 6           | Geocoding + CRUD direcciones                 |
| 4   | Categories    | `/categories`    | 1           | Listado de categorías (lectura)              |
| 5   | Uploads       | `/uploads`       | 2           | Imágenes via Cloudinary                      |
| 6   | Publications  | `/publications`  | 6           | CRUD publicaciones, filtros                  |
| 7   | Orders        | `/orders`        | 5           | Reservas, cancelación, entrega               |
| 8   | Chat          | `/chats`         | 3           | Mensajería por pedido (REST)                 |
| —   | WebSocket     | `/ws`            | WS          | Conexión general: chat + notificaciones      |
| 9   | Notifications | `/notifications` | 3           | Alertas persistentes (unread_count incluido) |
| 10  | Favorites     | `/favorites`     | 3           | Guardado de publicaciones                    |
| 11  | Metrics       | `/metrics`       | 1           | Dashboard comercio                           |
| 12  | Admin         | `/admin`         | 7           | Listados globales, CRUD categorías           |
|     | **Total**     |                  | **45 + WS** |                                              |

---

## Estructura del Perfil por Rol

### Consumidor

**MI CUENTA:** Editar perfil, Editar direcciones, Cambiar contraseña  
**ACTIVIDAD:** Mis Notificaciones, Mis Favoritos

### Comercio

**MI CUENTA:** Editar perfil (incluye nombre comercio y descripción), Cambiar contraseña  
**ACTIVIDAD:** Mis Notificaciones

> La dirección se gestiona desde Addresses Controller para ambos roles.

---

## Notas Técnicas

- **1 publicación = 1 reserva.** No hay stock.
- **Soft delete global.** `deleted_at: null` = activo. Middleware de Mongoose filtra automáticamente. Admin puede ver borrados con `?include_deleted=true`.
- **Rol ADMIN — Separación total.** El admin no accede a los controladores de negocio (1-11). Tiene su propio controlador (12) con listados globales, stats y CRUD de categorías. Si se necesita una operación admin nueva, se agrega ahí. Se crea por seed/manual, sin registro por API.
- **Imágenes en Cloudinary.** Upload via backend (multipart), una URL base, transformaciones dinámicas en el front.
- **Donaciones:** `is_donation` es un campo Boolean almacenado (no calculado). Se establece en `true` cuando `original_price === final_price` al crear/editar la publicación.
- **Publicaciones vencidas:** Cron job + notificación.
- **Proximidad:** Coordenadas de la `selected_address` del comercio vs `selected_address` del consumidor.
- **Chat aislado por reserva.** Cada orderId = chat independiente.
- **Notificaciones extensibles.** Nuevos tipos no requieren nuevos endpoints.
- **Sin valoraciones, sin horarios, sin recuperación de contraseña.**
- **Dirección obligatoria post-login.** `has_address === false` → frontend fuerza pantalla de carga de dirección.
- **Direcciones.** Ambos roles usan el mismo modelo Address. Ambos pueden tener múltiples. La dirección NO se crea durante el registro — se carga post-login via `POST /addresses`.
