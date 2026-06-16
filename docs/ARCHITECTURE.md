# Arquitectura — Guía

Cómo fluye un dato desde la API hasta el pixel, y qué responsabilidad tiene cada capa.

---

## El diagrama de capas

```
┌─────────────────────────────────────────────────────────────┐
│ Screen (index.tsx)          JSX puro — solo presentación      │
│   └─ useXxxScreen()         TODA la lógica, estado, handlers   │
│        ├─ hooks/useDomain   React Query (queries + mutations)  │
│        │     └─ api/service llamadas axios → apiClient         │
│        ├─ stores/ (Zustand) estado global (auth, ui, registro) │
│        ├─ lib/{rol}/{feat}  constants + types + utils del feat │
│        └─ utils/            funciones puras transversales       │
└─────────────────────────────────────────────────────────────┘
```

**La regla de oro:** un componente (incluida la screen) nunca tiene lógica. Si ves `useState`, `useEffect`, una llamada a React Query, navegación o transformación de datos dentro de un `.tsx`, está mal ubicado → va al hook.

---

## Responsabilidad de cada capa

### 1. Screen — `app/**/index.tsx`
- JSX puro. Importa **un** hook `useXxxScreen()` y desestructura todo lo que necesita.
- Único lugar donde se decide *cómo se ve*. Nada de *cómo funciona*.
- Helpers de render triviales (`renderItem`, `ItemSeparator`, `getEmptyText`) pueden vivir arriba del componente, sin estado.
- Ver `docs/SCREENS.md`.

### 2. Hook de screen — `app/**/useXxxScreen.ts`
- Concentra estado (`useState`), efectos (`useEffect`, `useFocusEffect`), handlers, navegación y composición de datos derivados.
- Llama a los hooks de React Query (`hooks/useDomain`) y a los stores.
- Compone funciones puras de `utils/` y `lib/` para derivar lo que la screen renderiza.
- Devuelve un objeto plano: datos listos para pintar + handlers. La screen no sabe de dónde salió cada cosa.
- Los hooks dentro de `app/` necesitan `export default function _() { return null }` por Expo Router.

### 3. Hooks de dominio — `hooks/useDomain.ts`
- Capa React Query: `useQuery` / `useMutation` sobre los services.
- Define `queryKey`, `staleTime`, invalidaciones (`invalidateQueries` / `setQueryData`).
- No conoce la UI. Reutilizable entre screens y roles.
- Ver `docs/API_LAYER.md`.

### 4. Services — `api/{domain}/{domain}.service.ts`
- Objeto literal (no clase) con funciones que llaman a `apiClient`.
- Una función = un endpoint. Sin lógica de negocio, solo el shape de la request.

### 5. API client — `api/client.ts`
- Axios instance única. Interceptor de request inyecta el `Bearer` token; interceptor de response devuelve `response.data` directo y convierte errores en `new Error(message)`.

### 6. Stores — `stores/*.store.ts` (Zustand)
- Estado global mínimo: `auth.store` (usuario + token), `ui.store` (toast), `registration.store` (datos temporales del registro).
- El estado de servidor **no** va acá — eso es React Query. Zustand es solo para estado de cliente que cruza pantallas.

### 7. lib y utils
- `lib/{rol}/{feature}/` → constants/types/utils acoplados a un feature.
- `utils/` → funciones puras transversales.
- Ver `docs/UTILS.md`.

---

## Flujo completo de ejemplo (Commerce Home)

```
CommerceHome (index.tsx)
  → useCommerceHomeScreen()
       → useCurrentUser()        ── hooks/useUsers   → usersService.getMe   → GET /users/me
       → useNotifications()      ── hooks/useNotif    → ...                  → GET /notifications
       → useOrders({status})     ── hooks/useOrders   → ordersService.list   → GET /orders
       → useMyPublications(...)  ── hooks/usePublic   → ...                  → GET /publications/me
       → deriva con utils/publications: sort → filter → search
       → devuelve { businessName, publications, handlers... }
  CommerceHome solo pinta ese objeto
```

---

## Reglas de dependencia (qué puede importar qué)

```
utils/        →  (nada del proyecto, salvo otros utils y types de api)
lib/          →  utils/, api types, components types
api/service   →  api/client, api types
hooks/        →  api/service, api types
stores/       →  api types
useXxxScreen  →  hooks/, stores/, lib/, utils/, expo-router
index.tsx     →  useXxxScreen, components/
components/   →  components/ui, utils/, api types
```

Prohibido al revés: un `util` no importa un hook; un service no importa un store; un componente UI no llama a React Query.

---

## Organización de rutas (Expo Router)

```
app/
  (auth)/           login + registro (wizard en una screen, sin tabs)
  (consumer)/       tabs: home, orders, profile
  (commerce)/       tabs: home, publish (FAB — tab real, tab bar se oculta vía HIDDEN_TAB_BAR_ROUTES), profile
  (onboarding)/     address (post-registro obligatorio)
  edit-profile/     fuera de tabs
  publish-product/  fuera de tabs — solo edición ([id].tsx);
                    re-exporta components/PublishProductScreen/ (crear es el tab publish)
  notifications/    fuera de tabs
  _layout.tsx       root: providers + fonts + splash
  index.tsx         redirect según estado de auth
```

Routing inicial en `app/index.tsx`: `!isInitialized` → spinner; `!user` → `/(auth)`; sin dirección → `/(onboarding)/address`; rol `COMERCIO` → `/(commerce)/home`; si no → `/(consumer)/home`.

---

## Realtime / WebSockets (socket.io)

**Una sola conexión** socket.io por usuario para toda la app (chat + notificaciones + lo que venga), atada al token de sesión. Capa reutilizable:

```
lib/socket/socketClient.ts   Singleton socket.io: getSocket / connectSocket / disconnectSocket.
                             Conecta a envConfig.SOCKET_URL (API_URL sin /api/v1) con { path: "/ws" }.
providers/SocketProvider.tsx Conecta cuando hay accessToken y desconecta al desloguear.
                             El token NO va en el handshake: emite `authenticate {token}` tras
                             `connect` y marca isConnected recién con `authenticated`. Expone
                             { socket, isConnected } por contexto.
hooks/useSocket.ts           useSocket() → { socket, isConnected }.
                             useSocketEvent<T>(event, handler, enabled) → suscripción con cleanup
                             automático; el handler se lee por ref (no hace falta memoizarlo).
hooks/useRealtimeSync.ts     Listener global: traduce eventos del server en invalidaciones de
                             React Query (ver abajo).
providers/RealtimeProvider.tsx Monta useRealtimeSync una sola vez. Va dentro de SocketProvider.
```

`SocketProvider` se monta en el root layout dentro de `AuthProvider`, y `RealtimeProvider` dentro de `SocketProvider`.

**Sincronización global (`useRealtimeSync`).** Un único listener montado por `RealtimeProvider` mapea los eventos del server a invalidaciones de caché, sin estado paralelo. Así, cualquier pantalla montada (home, detalle, etc.) se refresca sola:

| Evento recibido                                    | Invalida                                                |
| -------------------------------------------------- | ------------------------------------------------------- |
| `new_notification` (siempre)                       | `["notifications"]`                                     |
| `new_notification` tipo reserva/cancelación/entrega| `["orders"]`, `["publications"]`                        |
| `new_notification` tipo `*_EXPIRING`/`*_EXPIRED`   | `["publications"]`                                      |
| `new_notification` tipo `NEW_MESSAGE`              | `["chats"]`, `["orders"]`, `["publications"]`, `["chats", id, "messages"]` |
| `publication_changed` (broadcast)                  | `["publications"]`                                      |

**Feature de tiempo real acotada a una pantalla** (patrón): crear un hook `useXxxSocket` que use `useSocket`/`useSocketEvent`, escuche sus eventos e invalide/derive lo justo (no mantener estado paralelo). Ejemplo: `components/ChatScreen/useChatSocket.ts` hace `join_chat`/`leave_chat`, invalida `["chats", orderId, "messages"]` al recibir `new_message`, y maneja `typing`/`user_typing`. El detalle de orden escucha `new_notification` (`NEW_MESSAGE` de esa orden) para prender el badge de chat sin leer.

> `/ws` es el **path** de socket.io (no un namespace) y el token se envía en el evento `authenticate` (no en el handshake), según el contrato de `docs/BACKEND_API.md`. Distinción clave: `new_notification` es 1-a-1 (al destinatario); `publication_changed` es broadcast global (todos los clientes) para mantener los listados de publicaciones disponibles en sync.

---

## Por qué este patrón

- **Testeable**: la lógica vive en hooks/utils puros → se testean sin renderizar UI. Los `.tsx` casi no necesitan test de lógica.
- **SonarQube**: separar lógica de presentación mantiene la complejidad cognitiva por archivo baja y evita duplicación.
- **Reutilizable**: el mismo hook de dominio alimenta consumer y commerce; las utils puras se comparten.
</content>
