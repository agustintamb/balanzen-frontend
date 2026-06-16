# Guía de Testing

## Stack
- Jest + jest-expo
- @testing-library/react-native
- Mocks con `jest.mock()`
- `createWrapper()` para hooks que usan React Query

---

## Estructura de tests

Cada módulo tiene sus tests en `__tests__/` dentro de la misma carpeta:

```
api/auth/
  auth.service.ts
  __tests__/
    auth.service.test.ts

hooks/
  __tests__/
    useAuth.test.ts

components/ui/Button/
  index.tsx
  __tests__/
    Button.test.tsx
```

---

## Tests de servicios API

```ts
// api/auth/__tests__/auth.service.test.ts
import apiClient from '@/api/client'
import { authService } from '../auth.service'

jest.mock('@/api/client', () => ({
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}))

const mockClient = apiClient as jest.Mocked<typeof apiClient>

describe('authService', () => {
  beforeEach(() => jest.clearAllMocks())

  it('calls login endpoint with correct body', async () => {
    const mockResponse = { access_token: 'token', refresh_token: 'r', user: { ... } }
    mockClient.post.mockResolvedValueOnce(mockResponse)

    const result = await authService.login({ email: 'a@b.com', password: '123' })

    expect(mockClient.post).toHaveBeenCalledWith('/auth/login', { email: 'a@b.com', password: '123' })
    expect(result).toEqual(mockResponse)
  })
})
```

---

## Tests de hooks React Query

Usar `createWrapper()` de `__test-utils__/createWrapper.tsx`:

```ts
// hooks/__tests__/useAuth.test.ts
import { renderHook, waitFor } from '@testing-library/react-native'
import { authService } from '@/api/auth/auth.service'
import createWrapper from '@/__test-utils__/createWrapper'
import { useLogin } from '../useAuth'

jest.mock('@/api/auth/auth.service')
const mockAuthService = authService as jest.Mocked<typeof authService>

describe('useLogin', () => {
  it('calls authService.login on mutate', async () => {
    mockAuthService.login.mockResolvedValueOnce({ access_token: 'tok', ... })
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useLogin(), { wrapper })

    result.current.mutate({ email: 'a@b.com', password: '123' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockAuthService.login).toHaveBeenCalledWith({ email: 'a@b.com', password: '123' })
  })
})
```

---

## Tests de componentes UI

```tsx
// components/ui/Button/__tests__/Button.test.tsx
import { render, fireEvent } from '@testing-library/react-native'
import Button from '../index'

describe('Button', () => {
  it('calls onPress when pressed', () => {
    const onPress = jest.fn()
    const { getByText } = render(<Button onPress={onPress}>Tap me</Button>)
    fireEvent.press(getByText('Tap me'))
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn()
    const { getByText } = render(<Button onPress={onPress} disabled>Tap me</Button>)
    fireEvent.press(getByText('Tap me'))
    expect(onPress).not.toHaveBeenCalled()
  })

  it('shows ActivityIndicator when loading', () => {
    const { queryByText, UNSAFE_getByType } = render(
      <Button onPress={jest.fn()} loading>Tap</Button>
    )
    expect(queryByText('Tap')).toBeNull()
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy()
  })
})
```

---

## Tests de hooks de componente (useXxxSection)

```ts
// app/(auth)/components/LoginSection/__tests__/useLoginSection.test.ts
import { renderHook, act, waitFor } from '@testing-library/react-native'
import { authService } from '@/api/auth/auth.service'
import createWrapper from '@/__test-utils__/createWrapper'
import { useLoginSection } from '../useLoginSection'

jest.mock('@/api/auth/auth.service')
jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }))
jest.mock('expo-secure-store', () => ({ setItemAsync: jest.fn() }))

describe('useLoginSection', () => {
  it('starts with isValid false (empty form)', () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useLoginSection(), { wrapper })
    expect(result.current.isValid).toBe(false)
  })
})
```

---

## Tests de stores Zustand

```ts
// stores/__tests__/auth.store.test.ts
import { act, renderHook } from '@testing-library/react-native'
import { useAuthStore } from '../auth.store'

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, accessToken: null, isInitialized: false })
  })

  it('setUser updates user in state', () => {
    const { result } = renderHook(() => useAuthStore())
    const mockUser = { id: '1', email: 'a@b.com', role: 'CONSUMIDOR', ... }

    act(() => result.current.setUser(mockUser as any))

    expect(result.current.user).toEqual(mockUser)
  })

  it('clear resets user and token', () => {
    useAuthStore.setState({ user: { id: '1' } as any, accessToken: 'tok' })
    const { result } = renderHook(() => useAuthStore())

    act(() => result.current.clear())

    expect(result.current.user).toBeNull()
    expect(result.current.accessToken).toBeNull()
  })
})
```

---

## Correr tests

```bash
npm test                   # todos
npm run test:coverage      # con reporte de cobertura
npm run test:watch         # modo watch
npx jest path/to/test      # test específico
npx jest --testNamePattern "nombre del test"
```

---

## Mocks comunes

### expo-router
```ts
jest.mock('expo-router', () => ({
  router: { replace: jest.fn(), push: jest.fn(), back: jest.fn() },
  useRouter: () => ({ replace: jest.fn(), push: jest.fn(), back: jest.fn() }),
}))
```

### expo-secure-store
```ts
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}))
```

### @/api/client
```ts
jest.mock('@/api/client', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}))
```

### Módulos con default export
```ts
jest.mock('@/components/ui/Button', () => ({
  __esModule: true,
  default: ({ children, onPress }: any) => (
    <TouchableOpacity onPress={onPress}><Text>{children}</Text></TouchableOpacity>
  ),
}))
```
