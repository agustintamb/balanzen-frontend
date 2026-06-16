# Guía: Construir pantallas nuevas

## El patrón Screen + Hook

Toda pantalla sigue este patrón: el archivo de pantalla (`index.tsx`) es JSX puro que importa un hook `useXxxScreen`. El hook contiene toda la lógica.

```
app/
  mi-feature/
    index.tsx          ← JSX puro, solo presentación
    useMyFeatureScreen.ts   ← toda la lógica
    _layout.tsx        ← solo si necesita header, stack, etc.
```

---

## Paso a paso: nueva pantalla

### 1. Crear el hook de pantalla

```ts
// app/mi-feature/useMyFeatureScreen.ts
import { useRouter } from 'expo-router'
import { useMyData } from '@/hooks/useMyDomain'
import { useToast } from '@/stores/ui.store'

export const useMyFeatureScreen = () => {
  const router = useRouter()
  const { data, isLoading } = useMyData()
  const { showError, showSuccess } = useToast()

  const handleAction = () => {
    router.push('/other-screen')
  }

  return { data, isLoading, handleAction }
}

// Expo Router requiere un default export en app/ — este archivo es un hook, no una pantalla
export default function _() { return null }
```

### 2. Crear la pantalla

```tsx
// app/mi-feature/index.tsx
import { View, Text, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { useMyFeatureScreen } from './useMyFeatureScreen'

const MyFeatureScreen = () => {
  const { data, isLoading, handleAction } = useMyFeatureScreen()

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView edges={['top', 'left', 'right']} className="bg-white">
        {/* Header fijo */}
      </SafeAreaView>

      <View className="flex-1 bg-surface">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Contenido scrolleable */}
        </ScrollView>
      </View>

      <SafeAreaView edges={['bottom', 'left', 'right']} className="bg-surface">
        {/* Footer/CTA fijo */}
      </SafeAreaView>
    </>
  )
}

export default MyFeatureScreen
```

---

## Layouts de pantalla

### Pantalla con header fijo + contenido scrolleable

```tsx
<>
  <StatusBar style="dark" />
  <SafeAreaView edges={['top', 'left', 'right']} className="bg-white">
    <View className="px-4 py-3 flex-row items-center">
      <Text className="font-sans-bold text-xl text-primary-dark">Título</Text>
    </View>
  </SafeAreaView>

  <View className="flex-1 bg-surface">
    <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="p-4">
      {/* contenido */}
    </ScrollView>
  </View>
</>
```

### Pantalla con header + footer CTA fijo

```tsx
<>
  <StatusBar style="dark" />
  <SafeAreaView edges={['top', 'left', 'right']} className="bg-white">
    {/* header */}
  </SafeAreaView>

  <View className="flex-1 bg-surface">
    <ScrollView>{/* contenido */}</ScrollView>
  </View>

  <SafeAreaView edges={['bottom', 'left', 'right']} className="bg-surface">
    <View className="px-4 pt-3 pb-2">
      <Button onPress={handleSave}>Guardar</Button>
    </View>
  </SafeAreaView>
</>
```

### Pantalla tipo formulario (keyboard avoiding)

```tsx
import { KeyboardAvoidingView, Platform, View } from 'react-native'

<SafeAreaView style={{ flex: 1, backgroundColor: '#F1EFE8' }}>
  {Platform.OS === 'ios' ? (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      {content}
    </KeyboardAvoidingView>
  ) : (
    // En Android usar androidKeyboardPad desde el hook (ver useAuthScreen)
    <View style={{ flex: 1, paddingBottom: androidKeyboardPad }}>
      {content}
    </View>
  )}
</SafeAreaView>
```

Para Android keyboard pad en el hook:
```ts
const [androidKeyboardPad, setAndroidKeyboardPad] = useState(0)

useEffect(() => {
  if (Platform.OS !== 'android') return
  const show = Keyboard.addListener('keyboardDidShow', (e) => {
    setAndroidKeyboardPad(e.endCoordinates.height)
  })
  const hide = Keyboard.addListener('keyboardDidHide', () => {
    setAndroidKeyboardPad(0)
  })
  return () => { show.remove(); hide.remove() }
}, [])
```

---

## Pantalla con formulario completo

### Hook
```ts
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { NAME_REGEX, EMAIL_REGEX } from '@/utils/validation'

const schema = z.object({
  first_name: z.string().min(1, 'Requerido').regex(NAME_REGEX, 'Solo letras y espacios'),
  email: z.string().min(1, 'Requerido').regex(EMAIL_REGEX, 'Email inválido'),
})
type FormValues = z.infer<typeof schema>

export const useMyFormScreen = () => {
  const { mutateAsync } = useMyMutation()
  const { showSuccess } = useToast()

  const { control, handleSubmit, formState: { isValid, isDirty, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { first_name: '', email: '' },
  })

  const handleSave = handleSubmit(async (values) => {
    await mutateAsync(values)
    showSuccess('Guardado correctamente')
    router.back()
  })

  return { control, isValid, isDirty, isSubmitting, handleSave }
}
```

### JSX
```tsx
import { Controller } from 'react-hook-form'
import Input from '@/components/ui/Input'

<Controller
  control={control}
  name="first_name"
  render={({ field: { onChange, value }, fieldState: { error } }) => (
    <Input
      value={value}
      onChangeText={onChange}
      placeholder="Nombre"
      type="text"
      error={error?.message}
    />
  )}
/>
```

---

## Pantalla con datos del servidor

```ts
export const useMyScreen = () => {
  const { data, isLoading, isError, error, refetch } = useMyQuery()

  return { data, isLoading, isError, error, refetch }
}
```

```tsx
const MyScreen = () => {
  const { data, isLoading } = useMyScreen()

  if (isLoading) return <ActivityIndicator />

  return <View>{/* render data */}</View>
}
```

---

## Agregar pantalla a la navegación

### Pantalla en tab navigator (consumer/commerce)

En `app/(consumer)/_layout.tsx`:
```tsx
<Tabs.Screen name="my-feature" />
```
Y crear `app/(consumer)/my-feature/index.tsx`.

### Pantalla fuera del tab (modal/stack)

Agregar en `app/` directamente: `app/my-feature/index.tsx`.
No necesita registrarse en ningún layout — Expo Router la detecta automáticamente.

### Navegar hacia ella
```ts
router.push('/my-feature')              // apilable
router.replace('/my-feature')           // reemplaza el stack
router.push('/(consumer)/my-feature')   // con grupo de ruta
```

### FAB de tab que oculta el tab bar (pantalla de creación de publicación)

Cuando el tab central es un FAB que debe ocupar la pantalla completa sin tab bar, el tab es una ruta normal que renderiza la pantalla de creación. El tab bar se auto-oculta vía `HIDDEN_TAB_BAR_ROUTES` en `components/TabBar/tabBar.utils.ts`.

Patrón real: `app/(commerce)/publish/index.tsx` + `components/TabBar/`.

```tsx
// app/(commerce)/_layout.tsx — sin listeners, sin tabPress interception
<Tabs.Screen name="publish" />
```

```ts
// app/(commerce)/publish/index.tsx — re-exporta la screen real (no es un stub)
import PublishProductScreen from "@/components/PublishProductScreen";
export default PublishProductScreen;
```

```ts
// components/TabBar/tabBar.utils.ts
// Rutas que ocupan la pantalla completa: el tab bar se oculta mientras están activas.
export const HIDDEN_TAB_BAR_ROUTES = new Set(["publish"]);
```

```tsx
// components/TabBar/index.tsx
const focusedRouteName = state.routes[state.index]?.name;
if (focusedRouteName && HIDDEN_TAB_BAR_ROUTES.has(focusedRouteName)) {
  return null;
}
```

Este mecanismo es necesario porque `tabBarStyle: { display: 'none' }` no funciona con un `tabBar` custom — la prop `tabBarStyle` aplica al tab bar nativo de React Navigation, no a un componente `tabBar` provisto por el usuario.

**Nota de naming:** la ruta de edición apilada se llama `/publish-product/[id]` (no `/publish/[id]`) porque los grupos de ruta como `(commerce)` son transparentes en la URL: `(commerce)/publish` resuelve a `/publish`. Un `app/publish/[id]` colisionaría con ese nombre. Usar `/publish-product/[id]` evita la colisión.

---

## Componentes de feature (dentro de una pantalla compleja)

Para pantallas con múltiples secciones complejas (ej. AuthScreen):

```
app/(auth)/
  index.tsx                       ← pantalla contenedora
  useAuthScreen.ts                ← estado del wizard (qué sección mostrar)
  components/
    LoginSection/
      index.tsx                   ← JSX puro
      useLoginSection.ts          ← lógica del login
      __tests__/
    RegisterPersonalSection/
      index.tsx
      useRegisterPersonalSection.ts
```

Cada componente de feature tiene su propio hook. El hook de la pantalla padre solo coordina navegación entre secciones.

---

## Formulario multi-paso (wizard) en una sola screen

Cuando un formulario tiene más de un paso, el estado del paso vive en el hook de la screen. El contenido de cada paso se separa en componentes `StepN*.tsx` que reciben el `control` compartido de react-hook-form. El label, handler y estado `disabled` del CTA se derivan del paso actual directamente en el hook.

Patrón real: publicación de producto (`components/PublishProductScreen/`).

```
components/PublishProductScreen/
  index.tsx                  ← Screen: StepIndicator + scroll con step content + footer CTA
  usePublishProductScreen.ts ← step: 1 | 2, form, photo state, mode (create/edit), handlers derivados
  StepIndicator.tsx
  Step1Info.tsx              ← recibe control, renderiza campos del paso 1
  Step2Price.tsx             ← recibe control + isDonation, renderiza precios / donación
  PhotoUploader.tsx
  CategorySelector.tsx
  ExpiryDateField.tsx        ← usa @react-native-community/datetimepicker para selección nativa de fecha
  DonationCard.tsx
  PublishSuccess.tsx         ← overlay de éxito (ver abajo)

lib/commerce/publish/
  types.ts       ← PhotoItem, PublishFormValues, PublishMode, PhotoSource
  constants.ts   ← MAX_PHOTOS = 4, DEFAULT_VALUES
  utils.ts       ← parsePrice, isStep1Complete, isStep2Complete, sortCategories,
                    buildPublicationBody, publicationToFormValues, publicationPhotosToItems

app/(commerce)/publish/
  index.tsx      ← thin route de creación (tab): export default PublishProductScreen

app/publish-product/
  [id].tsx       ← thin route de edición (apilada): export default PublishProductScreen
```

El hook expone el CTA polimórfico según paso y modo:

```ts
return {
  ctaLabel: isStep1 ? "Continuar" : isEdit ? "Guardar cambios" : "Publicar producto",
  ctaDisabled: isStep1 ? !canContinue : !canPublish || isSubmitting,
  onCtaPress: isStep1 ? handleContinue : handleSubmitPublish,
  // ...resto de valores
}
```

La validación de completitud de cada paso se hace con helpers puros en `lib/commerce/publish/utils.ts` (`isStep1Complete`, `isStep2Complete`) que reciben los valores del form y devuelven `boolean`. Eso permite testearlos sin render.

---

## Overlay de éxito fullscreen (Modal)

Para confirmaciones que deben tapar la tab bar se usa un `Modal` de React Native con `transparent={false}`. Se auto-descarta con `setTimeout` y luego llama a `router.replace`.

Patrón real: `components/PublishProductScreen/PublishSuccess.tsx`.

```tsx
// En el hook
const [showSuccess, setShowSuccess] = useState(false)

const handlePublish = handleSubmit(async (values) => {
  await createPublication(buildPublicationBody(values, photoUrls))
  setShowSuccess(true)
})

const handleSuccessDone = () => {
  setShowSuccess(false)
  reset(DEFAULT_VALUES)
  router.replace("/(commerce)/home")
}

// En el componente (PublishSuccess)
const SUCCESS_DURATION_MS = 2000

useEffect(() => {
  if (!visible) return
  // animación de entrada con Animated.spring
  const timer = setTimeout(onDone, SUCCESS_DURATION_MS)
  return () => clearTimeout(timer)
}, [visible])

return (
  <Modal visible={visible} animationType="fade" transparent={false} onRequestClose={onDone}>
    {/* contenido de éxito */}
  </Modal>
)
```

El hook de la screen controla `showSuccess`. La screen pasa `visible={showSuccess}` y `onDone={handleSuccessDone}` al componente.

---

## Screen reutilizable para crear y editar (modo dual)

Un mismo componente de screen puede manejar el modo creación y el modo edición leyendo un parámetro de ruta opcional. El hook detecta el modo con `useLocalSearchParams` y ramifica la lógica sin duplicar JSX.

```ts
// components/PublishProductScreen/usePublishProductScreen.ts
const { id } = useLocalSearchParams<{ id?: string }>();
const mode: PublishMode = id ? "edit" : "create";

// En modo edición: prefill del form con la publicación existente
useEffect(() => {
  if (mode !== "edit" || !publication || prefilledRef.current) return;
  prefilledRef.current = true;
  reset(publicationToFormValues(publication));
  setPhotos(publicationPhotosToItems(publication.photos));
}, [mode, publication, reset]);

// El CTA cambia según modo y paso
ctaLabel: isStep1 ? "Continuar" : isEdit ? "Guardar cambios" : "Publicar producto",
```

La ruta de creación es el propio tab `app/(commerce)/publish/index.tsx`. La ruta de edición es una ruta apilada `app/publish-product/[id].tsx`. Ambas re-exportan el mismo componente:

```ts
// app/(commerce)/publish/index.tsx — tab de creación
import PublishProductScreen from "@/components/PublishProductScreen";
export default PublishProductScreen;

// app/publish-product/[id].tsx — ruta apilada de edición
import PublishProductScreen from "@/components/PublishProductScreen";
export default PublishProductScreen;
```

El hook detecta el modo por la presencia de `id`:

```ts
const { id } = useLocalSearchParams<{ id?: string }>();
const isEdit = Boolean(id);
// create (tab): "atrás" → router.navigate('/(commerce)/home')
// edit (pushed): "atrás" → router.back()
// éxito en create: setShowSuccess(true) → onDone: reset(DEFAULT_VALUES) + router.replace('/(commerce)/home')
```

Para navegar a editar: `router.push('/publish-product/abc-123')`.

---

## Detalle de publicación / orden (dos rutas, una experiencia)

La pantalla de detalle es donde el usuario acciona sobre una publicación o una
reserva. Funciona en **dos modos** según la fuente de datos, cada uno con su
propia ruta raíz (fuera de los tab groups → **sin tab bar**, igual que
`notifications`/`favorites`):

| Ruta | Param | Endpoint (hook) | Cuándo se entra |
|------|-------|-----------------|-----------------|
| `app/publication/[id].tsx` | `publication_id` | `GET /publications/{id}` (`usePublication`) | Consumidor toca card del home (ACTIVE); comercio toca card ACTIVE |
| `app/order/[id].tsx` | `order_id` | `GET /orders/{id}` (`useOrder` → `OrderDetail`) | Consumidor desde pestaña Pedidos; comercio desde card RESERVED (`publication.order_id`); tras reservar |

Componentes en `components/ProductDetail/` (presentacionales compartidos) +
`components/PublicationDetailScreen/` y `components/OrderDetailScreen/` (screen +
hook por modo). El cuerpo (carrusel de imágenes, badges, precio, card de
detalles) se comparte; cada screen aporta su header, bloque de contraparte y CTAs.

### Matriz de acciones (estado × rol)

| Estado | Rol | Header der. | Bloque sobre el título | CTA(s) | Endpoint |
|--------|-----|-------------|------------------------|--------|----------|
| ACTIVE | Consumidor | favorito + compartir | Chat **deshabilitado** | `Reservar ahora` (+ sheet) | `POST /orders` |
| ACTIVE | Comercio (dueño) | — | "Sin reserva aún" · Chat deshab. | `Eliminar` (+ sheet) · `Editar` | `DELETE /publications/{id}` · push a `/publish-product/{id}` |
| RESERVED | Consumidor | favorito + compartir | Comercio + Chat **habilitado** | `Cancelar mi reserva` (+ sheet) | `PUT /orders/{id}/cancel` |
| RESERVED | Comercio | — | Consumidor (avatar) + Chat habilitado | `Cancelar reserva` (+ sheet) · `Entregar pedido` (+ sheet → success animado) | `PUT /orders/{id}/cancel` · `PUT /orders/{id}/deliver` |
| DELIVERED / CANCELLED / EXPIRED | Ambos | — | solo lectura, sin chat | — | — |

### Reglas

- **Chat** solo se habilita cuando existe una order en estado `RESERVED`; en el
  resto se muestra deshabilitado ("no disponible"). El chat vive en
  `app/chat/[orderId].tsx` (ruta raíz, full-screen) y se navega con
  `safePush('/chat/<orderId>')`.
- **Reservar**: `POST /orders` devuelve la order (resumida) con su `id`; tras el
  éxito se hace `router.replace('/order/<order.id>')` → la pantalla pasa a modo
  orden y se hidrata con `GET /orders/{id}`.
- **Entregar**: tras `PUT /orders/{id}/deliver`, overlay de éxito animado ~2s
  ("¡Pedido entregado!", patrón de `PublishSuccess`) y luego
  `router.replace('/(commerce)/home')`.
- **Rol/propiedad**: `user.role === 'COMERCIO'` y, para publicaciones,
  `user.id === publication.commerce.id`.
- **Contraparte** (modo orden): el comercio ve al `consumer` (nombre +
  `photo_url`); el consumidor ve al `commerce` (`business_name`). El nombre del
  consumidor se arma con `first_name`/`last_name` (no hay campo `name`).
- **Mapa/dirección**: usar `order.publication.commerce.selected_address`
  (trae `lat`/`lng`); puede ser `null`.

---

## Pantallas por rol

Para pantallas que tienen versiones distintas para consumidor y comercio:

```
app/(consumer)/profile/
  index.tsx              ← versión consumidor
  useProfileScreen.ts    ← puede ser compartido si la lógica es similar
  
app/(commerce)/profile/
  index.tsx              ← versión comercio
  useProfileScreen.ts
```

Dentro del hook, diferenciar por rol:
```ts
const isCommerce = user?.role === 'COMERCIO'
```

---

## Patterns de loading y error

### Query en pantalla
```tsx
const { data, isLoading, isError } = useMyQuery()

// Skeleton / spinner mientras carga
if (isLoading) return <View className="flex-1 items-center justify-center"><ActivityIndicator color="#639922" /></View>

// No mostrar error en pantalla — QueryProvider ya muestra toast automático
// Solo tratar isError si necesitás UI específica de error
```

### Mutation en formulario
```tsx
// El isPending del mutation deshabilita el botón y muestra spinner
<Button loading={isSubmitting} disabled={!isValid || isSubmitting} onPress={handleSave}>
  Guardar
</Button>
```

---

## Query keys convención

```ts
['users', 'me']                  // perfil propio
['users', id, 'public']          // perfil público
['addresses']                    // mis direcciones
['publications']                 // listado (consumidor)
['publications', 'me']           // mis publicaciones (comercio)
['publications', id]             // detalle
['orders']                       // mis pedidos
['orders', id]                   // detalle
['chats']                        // mis chats
['chats', orderId, 'messages']   // mensajes de un chat
['notifications']                // mis notificaciones
['favorites']                    // mis favoritos
['categories']                   // listado de categorías
['metrics', 'summary']           // métricas del comercio
```
