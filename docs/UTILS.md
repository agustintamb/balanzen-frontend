# Utils y lib — Guía

Dónde vive la lógica pura (sin React, sin side-effects) y cómo se organiza.

---

## `utils/` vs `lib/` — la decisión

| Pregunta | Va en `utils/` | Va en `lib/{rol}/{feature}/` |
|----------|----------------|------------------------------|
| ¿Lo usa más de un feature? | ✅ sí | — |
| ¿Es transversal (formato, fechas, validación, imágenes)? | ✅ | — |
| ¿Es específico de una pantalla/feature de un rol? | — | ✅ |
| ¿Son constantes de UI de ese feature (filtros, labels)? | — | ✅ |
| ¿Son tipos solo de ese feature? | — | ✅ |

**Regla:** lo genérico y reutilizable → `utils/`. Lo acoplado a un feature concreto → `lib/{rol}/{feature}/`. Cuando algo en `lib/` empieza a usarse desde otro feature, se promueve a `utils/` (ver más abajo).

---

## `utils/` — funciones puras transversales

Archivos actuales y su responsabilidad:

| Archivo | Qué expone |
|---------|-----------|
| `format.ts` | Formato de números, precios, fechas relativas (`formatRelativeDate`) |
| `dateFilters.ts` | `getDateRange(filter)` → `{ date_from, date_to }` para queries |
| `validation.ts` | Regex compartidos (`EMAIL_REGEX`, `NAME_REGEX`, ...) |
| `cloudinary.ts` | `buildProfilePhotoUrl` / `buildCardImageUrl` / `buildDetailImageUrl` / `buildAvatarUrl` |
| `cn.ts` | `cn()` = clsx + tailwind-merge |
| `navigation.ts` | `safePush` / helpers de navegación |
| `orders.ts` | `sortAndSearchOrders` (transversal a consumer y commerce) |
| `publications.ts` | `filterPublications`, `sortPublications`, `searchPublications`, `countExpiringPublications` |
| `auth.ts` | `persistSession` (guarda tokens en SecureStore + popula store) |
| `address.ts` | Helpers de direcciones |

### Patrón de una util pura

```ts
// utils/orders.ts
import type { Order } from "@/api/orders/orders.types";

export const sortAndSearchOrders = (
  orders: Order[] | undefined,
  activeSort: "recent" | "oldest",
  activeSearch: string,
): Order[] => {
  const baseOrders = orders ?? [];           // siempre tolerar undefined
  const filtered = activeSearch
    ? baseOrders.filter((o) =>
        o.publication.title.toLowerCase().includes(activeSearch.toLowerCase()),
      )
    : baseOrders;

  if (activeSort === "oldest") {
    return [...filtered].sort(                // nunca mutar el array de entrada
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
  }
  return [...filtered].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
};
```

Reglas para `utils/`:
- **Puras**: sin estado, sin side-effects, sin acceso a stores ni a `router`. Mismo input → mismo output.
- **Tolerantes a `undefined`**: aceptar `T[] | undefined` y normalizar con `?? []`.
- **Inmutables**: nunca mutar argumentos (`[...arr].sort(...)`, no `arr.sort(...)`).
- **Tipadas**: tipo de retorno explícito.
- **Testeadas**: todo archivo en `utils/` tiene su `__tests__/`.

---

## `lib/{rol}/{feature}/` — lógica acoplada a un feature

Estructura estándar de un feature en `lib/`:

```
lib/
  consumer/
    orders/
      constants.ts   ← FILTERS, DATE_FILTERS, SORT_FILTERS (opciones de UI)
      types.ts       ← tipos solo de este feature
      utils.ts       ← lógica que combina utils globales + tipos del feature
  commerce/
    home/
      constants.ts
      types.ts
    publish/
      types.ts       ← PhotoItem, PublishFormValues, PublishMode, PhotoSource
      constants.ts   ← MAX_PHOTOS = 4, DEFAULT_VALUES
      utils.ts       ← parsePrice, isStep1Complete, isStep2Complete, sortCategories,
                        buildPublicationBody, publicationToFormValues, publicationPhotosToItems
```

### `types.ts`
```ts
// lib/consumer/orders/types.ts
import type { OrderStatus } from "@/api/orders/orders.types";

export type ConsumerOrderFilter = "all" | OrderStatus;
export type DateRangeFilter = "all" | "today" | "week" | "month";
export type OrderSortOption = "recent" | "oldest";
```

### `constants.ts`
```ts
// lib/consumer/orders/constants.ts
import type { FilterOption } from "@/components/FilterChipBar";
import type { ConsumerOrderFilter, DateRangeFilter, OrderSortOption } from "./types";

export const FILTERS: FilterOption<ConsumerOrderFilter>[] = [
  { key: "RESERVED", label: "Activos" },
  { key: "DELIVERED", label: "Entregados" },
  { key: "CANCELLED", label: "Cancelados" },
  { key: "all", label: "Todos" },
];

export const DATE_FILTERS: FilterOption<DateRangeFilter>[] = [ /* ... */ ];
export const SORT_FILTERS: FilterOption<OrderSortOption>[] = [ /* ... */ ];
```

### `utils.ts`
Compone utils globales con los tipos del feature:
```ts
// lib/consumer/orders/utils.ts
import { getDateRange } from "@/utils/dateFilters";
import { sortAndSearchOrders as globalSortAndSearchOrders } from "@/utils/orders";
import type { ConsumerOrderFilter, DateRangeFilter } from "./types";

export const buildOrderFilterParams = (
  activeFilter: ConsumerOrderFilter,
  dateFilter: DateRangeFilter,
) => ({
  ...(activeFilter !== "all" ? { status: activeFilter } : {}),
  ...getDateRange(dateFilter),
});

// re-export tipado al dominio del feature
export const sortAndSearchOrders = (
  orders: Order[] | undefined,
  activeSort: "recent" | "oldest",
  activeSearch: string,
) => globalSortAndSearchOrders(orders, activeSort, activeSearch);
```

---

## Cómo el hook de screen consume `lib/` y `utils/`

```ts
// useCommerceHomeScreen.ts (extracto)
import { DATE_FILTERS, FILTERS, SORT_FILTERS } from "@/lib/commerce/home/constants";
import type { CommerceSortOption, DateRangeFilter, FilterKey } from "@/lib/commerce/home/types";
import { getDateRange } from "@/utils/dateFilters";
import {
  countExpiringPublications,
  filterPublications,
  searchPublications,
  sortPublications,
} from "@/utils/publications";

// El hook re-exporta las constantes para que el .tsx las importe desde un solo lugar:
export { FILTERS, DATE_FILTERS, SORT_FILTERS };
export type { CommerceSortOption, DateRangeFilter, FilterKey };

// ...y deriva datos componiendo utils puras:
const sorted = sortPublications(pubs, activeSort);
const filtered = filterPublications(sorted, activeFilter);
const searched = searchPublications(filtered, activeSearch);
```

> El `.tsx` importa `FILTERS`/`DATE_FILTERS`/etc. **desde el hook**, no desde `lib/` directamente. El hook es la única fachada que ve la screen.

---

## Promover de `lib/` a `utils/`

Cuando una función en `lib/{rol}/{feature}/utils.ts` empieza a necesitarse desde otro rol/feature:
1. Mover la función a `utils/{tema}.ts`.
2. Dejar (si hace falta) un wrapper tipado en `lib/` que la re-exporte (como hace `lib/consumer/orders/utils.ts` con `sortAndSearchOrders`).
3. Mover/duplicar los tests al nuevo `utils/__tests__/`.

---

## Reglas SonarQube específicas de esta capa

- Complejidad cognitiva ≤ 15 por función → si un sort/filter encadena muchos `if`, partir en sub-funciones.
- Sin duplicación: si dos features hacen el mismo sort/filter, va a `utils/`.
- Tipo de retorno explícito en toda función exportada.
- Sin `any`: usar genéricos (`FilterOption<T>`) o `unknown` + type guard.
</content>
</invoke>
