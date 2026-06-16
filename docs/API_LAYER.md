# Capa de API — Guía

## Estructura por dominio

```
api/
  client.ts               Axios instance
  shared.types.ts         Tipos comunes (Pagination, PaginationParams)
  {domain}/
    {domain}.service.ts   Objeto con funciones de llamada
    {domain}.types.ts     Interfaces TypeScript
    __tests__/
```

---

## Agregar un nuevo dominio

### 1. Types
```ts
// api/my-domain/my-domain.types.ts

export interface MyEntity {
  id: string
  name: string
  created_at: string
}

export interface CreateMyEntityBody {
  name: string
}

export type UpdateMyEntityBody = Partial<CreateMyEntityBody>

export interface MyEntityListResponse {
  items: MyEntity[]
  pagination: Pagination
}
```

### 2. Service
```ts
// api/my-domain/my-domain.service.ts
import apiClient from '@/api/client'
import { MyEntity, CreateMyEntityBody, MyEntityListResponse, UpdateMyEntityBody } from './my-domain.types'
import { PaginationParams } from '@/api/shared.types'

export const myDomainService = {
  getAll: (params?: PaginationParams): Promise<MyEntityListResponse> =>
    apiClient.get('/my-domain', { params }),

  getById: (id: string): Promise<MyEntity> =>
    apiClient.get(`/my-domain/${id}`),

  create: (body: CreateMyEntityBody): Promise<MyEntity> =>
    apiClient.post('/my-domain', body),

  update: (id: string, body: UpdateMyEntityBody): Promise<MyEntity> =>
    apiClient.put(`/my-domain/${id}`, body),

  remove: (id: string): Promise<void> =>
    apiClient.delete(`/my-domain/${id}`),
}
```

### 3. Hook
```ts
// hooks/useMyDomain.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { myDomainService } from '@/api/my-domain/my-domain.service'
import { MyEntity, CreateMyEntityBody, MyEntityListResponse } from '@/api/my-domain/my-domain.types'

export const useMyEntities = () =>
  useQuery<MyEntityListResponse, Error>({
    queryKey: ['my-domain'],
    queryFn: () => myDomainService.getAll(),
  })

export const useMyEntity = (id: string) =>
  useQuery<MyEntity, Error>({
    queryKey: ['my-domain', id],
    queryFn: () => myDomainService.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })

export const useCreateMyEntity = () => {
  const queryClient = useQueryClient()
  return useMutation<MyEntity, Error, CreateMyEntityBody>({
    mutationFn: myDomainService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-domain'] }),
  })
}
```

---

## Tipos compartidos

```ts
// api/shared.types.ts
export interface Pagination {
  page: number
  limit: number
  total: number
  total_pages: number
}

export interface PaginationParams {
  page?: number
  limit?: number
}
```

---

## Dominios existentes y sus query keys

| Dominio        | Archivo service                    | Query keys principales                          |
|----------------|------------------------------------|------------------------------------------------|
| Auth           | `api/auth/auth.service.ts`         | Solo mutations (no queries)                    |
| Users          | `api/users/users.service.ts`       | `['users', 'me']`, `['users', id, 'public']`   |
| Addresses      | `api/addresses/addresses.service.ts` | `['addresses']`                              |
| Categories     | `api/categories/categories.service.ts` | `['categories']`                           |
| Publications   | `api/publications/publications.service.ts` | `['publications']`, `['publications', id]`, `['publications', 'me']`, `['publications', 'infinite', params]` |
| Orders         | `api/orders/orders.service.ts`     | `['orders']`, `['orders', id]`                 |
| Chats          | `api/chats/chats.service.ts`       | `['chats']`, `['chats', orderId, 'messages']`  |
| Notifications  | `api/notifications/notifications.service.ts` | `['notifications']`                  |
| Favorites      | `api/favorites/favorites.service.ts` | `['favorites']`                              |
| Metrics        | `api/metrics/metrics.service.ts`   | `['metrics', 'summary']`                       |
| Uploads        | `api/uploads/uploads.service.ts`   | Solo mutations                                 |

---

## Invalidación de caché al mutar

Regla general:
- Después de `create`: `invalidateQueries({ queryKey: ['domain'] })`
- Después de `update`: `setQueryData(['domain', id], updatedItem)` (optimista) o `invalidateQueries`
- Después de `delete`: `invalidateQueries({ queryKey: ['domain'] })`

Ejemplo con invalidación cruzada (orders afecta publications):
```ts
export const useCreateOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ordersService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['publications'] })
    },
  })
}
```

---

## Listados paginados con scroll infinito

Para listados largos se usa `useInfiniteQuery` en vez de `useQuery`. Ejemplo real: `usePublicationsInfinite` en `hooks/usePublications.ts`.

```ts
export const usePublicationsInfinite = (params?: PublicationFilters) =>
  useInfiniteQuery<PublicationListResponse, Error>({
    queryKey: ['publications', 'infinite', params],
    queryFn: ({ pageParam }) =>
      publicationsService.list({ ...params, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, total_pages } = lastPage.pagination
      return page < total_pages ? page + 1 : undefined
    },
    staleTime: 1000 * 60 * 2,
  })
```

- El tamaño de página se controla con `limit` en los filtros (el home de consumidor usa `PAGE_SIZE = 10` de `lib/consumer/home/constants.ts`). El total real para el contador se lee de `data.pages[0].pagination.total` (no de la cantidad cargada).
- El hook de pantalla aplana las páginas: `data?.pages.flatMap((p) => p.publications) ?? []`.
- Expone `fetchNextPage`, `hasNextPage`, `isFetchingNextPage` y un `handleEndReached` que dispara la siguiente página.
- En el `FlatList`: `onEndReached={handleEndReached}`, `onEndReachedThreshold` y un `ListFooterComponent` con spinner cuando `isFetchingNextPage`.
- La query key incluye `'infinite'` para no pisar la de `useQuery`, pero sigue invalidándose por prefijo con `invalidateQueries({ queryKey: ['publications'] })`.

---

## Uploads con FormData

El backend acepta `multipart/form-data` con campo `image`.

```ts
// Uso en hook de pantalla
const { mutateAsync: uploadImage } = useUploadImage()

const uploadPhoto = async (uri: string) => {
  const formData = new FormData()
  formData.append('image', {
    uri,
    type: 'image/jpeg',
    name: 'photo.jpg',
  } as unknown as Blob)
  const { url } = await uploadImage(formData)
  // url es la URL base de Cloudinary — aplicar transformaciones con utils/cloudinary.ts
}
```

---

## Error handling

El interceptor de response en `api/client.ts` transforma todos los errores en `new Error(message)` donde `message` es `error.response?.data?.message`.

`QueryProvider` tiene un `mutationCache` que llama `showError(error.message)` automáticamente en cualquier mutation fallida. No hace falta `try/catch` en la mayoría de los casos.

Si necesitás manejar un error específico de mutation:
```ts
mutate(data, {
  onError: (error) => {
    if (error.message.includes('ya existe')) {
      // lógica específica
    }
  }
})
```
