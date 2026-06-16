# Catálogo de componentes UI

Todos los componentes están en `components/ui/` o `components/`.

- `components/ui/` → genéricos reutilizables sin dominio (Button, Input, Chip, Icon...).
- `components/{Feature}/` → componentes de dominio o de una screen compleja (OrderCard, ProductCard, ProfileHeader, PublishProductScreen...). Cuando una screen requiere múltiples sub-componentes y un hook propio, el conjunto completo vive aquí en lugar de en `app/`. Ejemplo real: `components/PublishProductScreen/` con `index.tsx`, `usePublishProductScreen.ts`, `StepIndicator.tsx`, `PhotoUploader.tsx`, `Step1Info.tsx`, `Step2Price.tsx`, `CategorySelector.tsx`, `ExpiryDateField.tsx`, `DonationCard.tsx`, `PublishSuccess.tsx`; y los archivos de ruta en `app/publish-product/` solo re-exportan el componente.

---

## Estructura de un componente nuevo

### Componente simple (un archivo)
Componentes de UI o de dominio sin lógica de presentación: un solo `index.tsx`.

```
components/ui/Button/
  index.tsx                 ← componente + interface de props exportada
  __tests__/Button.test.tsx
```

### Componente de dominio con utils (patrón de 3 archivos)
Cuando el componente necesita transformar datos para pintar (labels, formato, variantes derivadas del estado), se separa la lógica pura en `utils.ts` y se re-exporta desde `index.tsx`. Patrón usado en `OrderCard`, `ProductCard`, `ConsumerPublicationCard`.

```
components/OrderCard/
  index.tsx                 ← solo re-export (barrel)
  OrderCard.tsx             ← JSX + interface de props
  utils.ts                  ← maps de labels/variantes + helpers puros
  __tests__/
    OrderCard.test.tsx      ← render + interacción
    utils.test.ts           ← lógica pura aislada
```

**`index.tsx`** — barrel, solo re-exporta:
```tsx
export { default } from "./OrderCard";
export type { OrderCardProps } from "./OrderCard";
```

**`OrderCard.tsx`** — JSX + props, importa de `./utils`:
```tsx
import {
  formatPrice,
  getOrderDateLabel,
  ORDER_STATUS_CHIP_VARIANT,
  ORDER_STATUS_LABEL,
} from "./utils";

export interface OrderCardProps {
  order: Order;
  onPress?: (id: string) => void;
  hasUnreadMessages?: boolean;
  perspective?: "consumer" | "commerce";   // misma card, dos vistas
}

const OrderCard = ({ order, onPress, perspective = "consumer" }: OrderCardProps) => {
  /* ...solo presentación... */
};
export default OrderCard;
```

**`utils.ts`** — maps tipados + funciones puras (testeables sin render):
```ts
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  RESERVED: "Reservado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

export const ORDER_STATUS_CHIP_VARIANT: Record<OrderStatus, ChipProps["variant"]> = {
  RESERVED: "warning",
  DELIVERED: "info",
  CANCELLED: "error",
};

export const formatPrice = (price: number): string =>
  `$${price.toLocaleString("es-AR")}`;
```

> Regla: cada componente en **su propia carpeta**, nunca co-locado dentro del archivo de la screen. Las props se tipan con una `interface ...Props` exportada. Tests siempre en `__tests__/` al lado.

---

## Componentes con variantes — `tv()` (tailwind-variants)

Para componentes con muchas variantes/tamaños (Button, Chip, MenuItem), usar `tv()` con `slots` + `variants` + `compoundVariants` en vez de ternarios de clases:

```ts
const button = tv({
  slots: { container: "flex-row items-center justify-center", label: "font-sans-semibold" },
  variants: {
    variant: {
      primary: { container: "bg-primary rounded-2xl", label: "text-white" },
      danger:  { container: "bg-error rounded-2xl", label: "text-white" },
    },
    size: { sm: { container: "px-3 py-2" }, md: { container: "px-5 py-4" } },
  },
  compoundVariants: [
    { variant: "primary", disabled: true, class: { container: "bg-surface-dark", label: "text-gray-400" } },
  ],
  defaultVariants: { variant: "primary", size: "md" },
});
```

Para clases condicionales simples (sin variantes), usar `cn()`:
```tsx
import { cn } from "@/utils/cn";
className={cn("base", isActive && "bg-primary", className)}
```

---

## Button

```tsx
import Button from '@/components/ui/Button'

// Variantes
<Button onPress={fn}>Primario</Button>
<Button variant="secondary" onPress={fn}>Secundario</Button>
<Button variant="tertiary" onPress={fn}>Terciario</Button>
<Button variant="neutral" onPress={fn}>Neutral</Button>
<Button variant="textLink" onPress={fn}>Link</Button>
<Button variant="danger" onPress={fn}>Peligroso</Button>

// Tamaños
<Button size="sm" onPress={fn}>Pequeño</Button>
<Button size="md" onPress={fn}>Mediano (default)</Button>
<Button size="lg" onPress={fn}>Grande</Button>

// Estados
<Button loading={isPending} onPress={fn}>Cargando</Button>
<Button disabled={!isValid} onPress={fn}>Deshabilitado</Button>

// Con íconos (Feather)
<Button rightIconName="arrow-right" onPress={fn}>Continuar</Button>
<Button leftIconName="log-out" variant="danger" onPress={fn}>Salir</Button>
```

---

## Input

```tsx
import Input from '@/components/ui/Input'

// Tipos
<Input value={v} onChangeText={fn} type="text" placeholder="Texto" />
<Input value={v} onChangeText={fn} type="email" placeholder="tu@email.com" />
<Input value={v} onChangeText={fn} type="password" placeholder="Contraseña" />
<Input value={v} onChangeText={fn} type="number" placeholder="0" />
<Input value={v} onChangeText={fn} type="phone" placeholder="Teléfono" />

// Con label y error
<Input
  value={v}
  onChangeText={fn}
  label="Nombre"
  placeholder="Juan"
  error={error?.message}
/>

// Con hint
<Input value={v} onChangeText={fn} hint="Mínimo 8 caracteres" />

// Multiline (textarea)
<Input value={v} onChangeText={fn} multiline numberOfLines={4} placeholder="Descripción..." />

// Con ícono izquierdo
<Input
  value={v}
  onChangeText={fn}
  leftIcon={<Feather name="search" size={18} color="#9CA3AF" />}
/>

// Deshabilitado
<Input value={v} onChangeText={fn} disabled />

// Foco en siguiente campo (keyboard navigation)
<Input
  value={v}
  onChangeText={fn}
  returnKeyType="next"
  onSubmitEditing={() => nextRef.current?.focus()}
/>
```

Con `react-hook-form`:
```tsx
<Controller
  control={control}
  name="email"
  render={({ field: { onChange, value }, fieldState: { error } }) => (
    <Input
      value={value}
      onChangeText={onChange}
      type="email"
      placeholder="tu@email.com"
      error={error?.message}
    />
  )}
/>
```

---

## MenuItem

Ítem de lista con bordes redondeados. Se usan agrupados para crear secciones estilo settings.

```tsx
import MenuItem from '@/components/ui/MenuItem'

// Grupo de ítems
<MenuItem position="first" onPress={fn}>Editar Perfil</MenuItem>
<MenuItem position="middle" onPress={fn}>Mis Direcciones</MenuItem>
<MenuItem position="last" onPress={fn}>Cambiar Contraseña</MenuItem>

// Ítem único (sin bordes especiales)
<MenuItem onPress={fn}>Ítem solo</MenuItem>

// Con badge de count
<MenuItem onPress={fn} badgeCount={3}>Notificaciones</MenuItem>

// Variante danger
<MenuItem variant="danger" leftIcon="log-out" onPress={fn}>Cerrar sesión</MenuItem>
```

---

## Toast (useToast)

Global, manejado por `useUIStore`. No renderizar `<Toast>` — ya está en `app/_layout.tsx`.

```ts
import { useToast } from '@/stores/ui.store'

const { showError, showSuccess, showWarning, showInfo } = useToast()

showSuccess('Perfil actualizado')
showError('Error al guardar')
showWarning('La sesión expira pronto')
showInfo('Datos actualizados')
```

`QueryProvider` llama `showError` automáticamente en cualquier mutation que falle. No hace falta manejar errores de mutations manualmente en la mayoría de los casos.

---

## ActionSheet

Bottom sheet de acciones. Modal nativo.

```tsx
import ActionSheet from '@/components/ui/ActionSheet'

<ActionSheet
  visible={isVisible}
  onClose={() => setIsVisible(false)}
  options={[
    { label: 'Galería', onPress: () => pickFromLibrary() },
    { label: 'Cámara', onPress: () => pickFromCamera() },
    { label: 'Cancelar', style: 'cancel' },
  ]}
/>
```

---

## Icon

Wrapper de Feather icons.

```tsx
import Icon from '@/components/ui/Icon'

<Icon name="home" size={24} color="#639922" />
<Icon name="user" size={20} color="#27500A" />
```

Colores comunes:
- `#639922` — primary (verde)
- `#27500A` — primary-dark
- `#9CA3AF` — gray-400 (placeholders, íconos inactivos)
- `#374151` — gray-700 (íconos neutros)
- `#E84234` — error

---

## Chip

Tag/filtro seleccionable.

```tsx
import Chip from '@/components/ui/Chip'

<Chip label="Verduras" selected={selected} onPress={() => setSelected(!selected)} />
```

---

## ProfileHeader

Header de pantallas de perfil con avatar, nombre, email y dirección.

```tsx
import ProfileHeader from '@/components/ProfileHeader'

<ProfileHeader
  displayName="Juan Pérez"
  email="juan@mail.com"
  initials="JP"
  photoUrl={buildProfilePhotoUrl(user.photo_url)}  // null si no tiene foto
  photoFullUrl={buildDetailImageUrl(user.photo_url)}
  addressShort="Av. Corrientes 1234, CABA"
/>
```

---

## Banner

Logo/marca de la app. Se usa en las pantallas de auth.

```tsx
import Banner from '@/components/Banner'

<Banner />
```

---

## UserAvatar

Avatar circular con fallback a iniciales.

```tsx
import UserAvatar from '@/components/UserAvatar'

<UserAvatar
  photoUrl={photoUrl}     // URL ya transformada con buildProfilePhotoUrl/buildAvatarUrl
  initials="JP"
  size={60}
/>
```

---

## SplashOverlay

Overlay de splash screen personalizado. Ya está en `app/_layout.tsx`. No instanciar en otro lado.

---

## TabBar

Tab bar custom con tab central destacado. Ya está wired en `(commerce)/_layout.tsx` y `(consumer)/_layout.tsx`. No instanciar manualmente.

---

## Patrones de layout frecuentes

### Sección con título uppercase

```tsx
<View className="px-4 mb-6">
  <Text className="font-sans-semibold text-xs text-gray-400 uppercase tracking-widest mb-2 ml-1">
    Mi Cuenta
  </Text>
  <MenuItem position="first" onPress={fn}>Editar Perfil</MenuItem>
  <MenuItem position="last" onPress={fn}>Cambiar Contraseña</MenuItem>
</View>
```

### Card en lista

```tsx
<View className="bg-white rounded-2xl border border-gray-100 p-4 mb-3">
  <Text className="font-sans-bold text-base text-primary-dark">Título</Text>
  <Text className="font-sans text-sm text-gray-500 mt-1">Subtítulo</Text>
</View>
```

### Row de datos (label + valor)

```tsx
<View className="flex-row items-center justify-between py-3 border-b border-gray-100">
  <Text className="font-sans text-sm text-gray-500">Campo</Text>
  <Text className="font-sans-medium text-sm text-primary-dark">Valor</Text>
</View>
```

### Badge numérico

```tsx
{count > 0 && (
  <View className="bg-error rounded-full w-5 h-5 items-center justify-center">
    <Text className="font-sans-bold text-xs text-white">{count}</Text>
  </View>
)}
```

### Imagen de publicación (card)

```tsx
import { Image } from 'expo-image'
import { buildCardImageUrl } from '@/utils/cloudinary'

<Image
  source={{ uri: buildCardImageUrl(photo) }}
  style={{ width: '100%', aspectRatio: 1 }}
  contentFit="cover"
  placeholder={{ blurhash: '...' }}
/>
```

### Empty state

```tsx
<View className="flex-1 items-center justify-center gap-3 px-8">
  <Feather name="inbox" size={48} color="#9CA3AF" />
  <Text className="font-sans-medium text-base text-gray-400 text-center">
    No hay publicaciones disponibles
  </Text>
</View>
```

---

## Guía rápida de colores en clases

```
bg-surface          fondo general (#F1EFE8)
bg-white            cards, inputs
bg-primary          botón verde principal
bg-primary-light    fondo suave verde (#EAF3DE)
bg-error            rojo
text-primary-dark   texto principal (#27500A)
text-primary        verde (#639922)
text-gray-500       texto secundario
text-gray-400       placeholder / icono inactivo
border-gray-100     borde suave en cards
border-primary      borde en inputs focuseados
```
