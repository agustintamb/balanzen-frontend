import { renderHook, act, waitFor } from '@testing-library/react-native'
import { router } from 'expo-router'

import { useLogin } from '@/hooks/useAuth'
import { useAuthStore } from '@/stores/auth.store'
import { persistSession } from '@/utils/auth'
import type { LoginResponse } from '@/api/auth/auth.types'
import type { AuthUser } from '@/stores/auth.store'

import { useLoginSection } from '../useLoginSection'

jest.mock('@/hooks/useAuth', () => ({
  useLogin: jest.fn(),
}))

jest.mock('@/stores/auth.store', () => ({
  useAuthStore: jest.fn(),
}))

jest.mock('@/utils/auth', () => ({
  persistSession: jest.fn(),
}))

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}))

jest.mock('@/utils/validation', () => ({
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
}))

const mockedUseLogin = useLogin as jest.MockedFunction<typeof useLogin>
const mockedUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>
const mockedPersistSession = persistSession as jest.MockedFunction<typeof persistSession>
const mockedRouterReplace = router.replace as jest.MockedFunction<typeof router.replace>

const mockSetUser = jest.fn()
const mockSetAccessToken = jest.fn()

const CONSUMER_LOGIN_RESPONSE: LoginResponse = {
  access_token: 'access-token-abc',
  refresh_token: 'refresh-token-xyz',
  user: {
    id: 'user-id-123',
    email: 'jane@example.com',
    role: 'CONSUMIDOR',
    first_name: 'Jane',
    last_name: 'Doe',
    photo_url: null,
    has_address: true,
  },
}

const COMMERCE_LOGIN_RESPONSE: LoginResponse = {
  access_token: 'access-token-commerce',
  refresh_token: 'refresh-token-commerce',
  user: {
    id: 'commerce-id-456',
    email: 'commerce@example.com',
    role: 'COMERCIO',
    first_name: 'John',
    last_name: 'Smith',
    photo_url: null,
    has_address: true,
  },
}

const buildMutateFn = (
  onSuccessResponse?: LoginResponse,
  onErrorValue?: Error,
) =>
  jest.fn((_body: unknown, callbacks?: { onSuccess?: (r: LoginResponse) => Promise<void>; onError?: (e: Error) => void }) => {
    if (onSuccessResponse && callbacks?.onSuccess) {
      callbacks.onSuccess(onSuccessResponse)
    }
    if (onErrorValue && callbacks?.onError) {
      callbacks.onError(onErrorValue)
    }
  })

const setupMocks = (mutateFn = jest.fn(), isPending = false) => {
  mockedUseLogin.mockReturnValue({
    mutate: mutateFn,
    isPending,
  } as unknown as ReturnType<typeof useLogin>)

  mockedUseAuthStore.mockReturnValue({
    setUser: mockSetUser,
    setAccessToken: mockSetAccessToken,
  } as unknown as ReturnType<typeof useAuthStore>)

  mockedPersistSession.mockResolvedValue(undefined)
}

afterEach(() => {
  jest.clearAllMocks()
})

describe('useLoginSection', () => {
  describe('initial state', () => {
    it('should return control, onSubmit, isValid and isPending', () => {
      setupMocks()

      const { result } = renderHook(() => useLoginSection())

      expect(result.current.control).toBeDefined()
      expect(result.current.onSubmit).toBeInstanceOf(Function)
      expect(result.current.isValid).toBe(false)
      expect(result.current.isPending).toBe(false)
    })

    it('should start with isValid false when fields are empty', () => {
      setupMocks()

      const { result } = renderHook(() => useLoginSection())

      expect(result.current.isValid).toBe(false)
    })

    it('should reflect isPending true when mutation is in flight', () => {
      setupMocks(jest.fn(), true)

      const { result } = renderHook(() => useLoginSection())

      expect(result.current.isPending).toBe(true)
    })
  })

  describe('form submission with valid credentials', () => {
    it('should call useLogin mutate with email and password on submit', async () => {
      const mutateFn = jest.fn()
      setupMocks(mutateFn)

      const { result } = renderHook(() => useLoginSection())

      await act(async () => {
        result.current.control._formValues.email = 'jane@example.com'
        result.current.control._formValues.password = 'secret123'
      })

      await act(async () => {
        await result.current.onSubmit({
          nativeEvent: {},
        } as never)
      })

      expect(mutateFn).toHaveBeenCalledWith(
        { email: 'jane@example.com', password: 'secret123' },
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      )
    })

    it('should call mutate exactly once per submit', async () => {
      const mutateFn = jest.fn()
      setupMocks(mutateFn)

      const { result } = renderHook(() => useLoginSection())

      await act(async () => {
        result.current.control._formValues.email = 'jane@example.com'
        result.current.control._formValues.password = 'secret123'
      })

      await act(async () => {
        await result.current.onSubmit({} as never)
      })

      expect(mutateFn).toHaveBeenCalledTimes(1)
    })
  })

  describe('on login success', () => {
    it('should call persistSession with tokens and mapped user on consumer login', async () => {
      const mutateFn = buildMutateFn(CONSUMER_LOGIN_RESPONSE)
      setupMocks(mutateFn)

      const { result } = renderHook(() => useLoginSection())

      await act(async () => {
        result.current.control._formValues.email = 'jane@example.com'
        result.current.control._formValues.password = 'secret123'
        await result.current.onSubmit({} as never)
      })

      await waitFor(() => {
        expect(mockedPersistSession).toHaveBeenCalledWith(
          CONSUMER_LOGIN_RESPONSE,
          {
            id: CONSUMER_LOGIN_RESPONSE.user.id,
            email: CONSUMER_LOGIN_RESPONSE.user.email,
            role: CONSUMER_LOGIN_RESPONSE.user.role,
            first_name: CONSUMER_LOGIN_RESPONSE.user.first_name,
            last_name: CONSUMER_LOGIN_RESPONSE.user.last_name,
            has_address: CONSUMER_LOGIN_RESPONSE.user.has_address,
            photo_url: CONSUMER_LOGIN_RESPONSE.user.photo_url,
          } satisfies AuthUser,
          mockSetAccessToken,
          mockSetUser,
        )
      })
    })

    it('should navigate to consumer home when role is CONSUMIDOR and has_address is true', async () => {
      const mutateFn = buildMutateFn(CONSUMER_LOGIN_RESPONSE)
      setupMocks(mutateFn)

      const { result } = renderHook(() => useLoginSection())

      await act(async () => {
        result.current.control._formValues.email = 'jane@example.com'
        result.current.control._formValues.password = 'secret123'
        await result.current.onSubmit({} as never)
      })

      await waitFor(() => {
        expect(mockedRouterReplace).toHaveBeenCalledWith('/(consumer)/home')
      })
    })

    it('should navigate to commerce home when role is COMERCIO and has_address is true', async () => {
      const mutateFn = buildMutateFn(COMMERCE_LOGIN_RESPONSE)
      setupMocks(mutateFn)

      const { result } = renderHook(() => useLoginSection())

      await act(async () => {
        result.current.control._formValues.email = 'commerce@example.com'
        result.current.control._formValues.password = 'secret123'
        await result.current.onSubmit({} as never)
      })

      await waitFor(() => {
        expect(mockedRouterReplace).toHaveBeenCalledWith('/(commerce)/home')
      })
    })

    it('should navigate to onboarding address when has_address is false', async () => {
      const noAddressResponse: LoginResponse = {
        ...CONSUMER_LOGIN_RESPONSE,
        user: { ...CONSUMER_LOGIN_RESPONSE.user, has_address: false },
      }
      const mutateFn = buildMutateFn(noAddressResponse)
      setupMocks(mutateFn)

      const { result } = renderHook(() => useLoginSection())

      await act(async () => {
        result.current.control._formValues.email = 'jane@example.com'
        result.current.control._formValues.password = 'secret123'
        await result.current.onSubmit({} as never)
      })

      await waitFor(() => {
        expect(mockedRouterReplace).toHaveBeenCalledWith('/(onboarding)/address')
      })
    })

    it('should navigate to onboarding address when COMERCIO role has no address', async () => {
      const commerceNoAddress: LoginResponse = {
        ...COMMERCE_LOGIN_RESPONSE,
        user: { ...COMMERCE_LOGIN_RESPONSE.user, has_address: false },
      }
      const mutateFn = buildMutateFn(commerceNoAddress)
      setupMocks(mutateFn)

      const { result } = renderHook(() => useLoginSection())

      await act(async () => {
        result.current.control._formValues.email = 'commerce@example.com'
        result.current.control._formValues.password = 'secret123'
        await result.current.onSubmit({} as never)
      })

      await waitFor(() => {
        expect(mockedRouterReplace).toHaveBeenCalledWith('/(onboarding)/address')
      })
    })

    it('should pass photo_url from response to persistSession', async () => {
      const responseWithPhoto: LoginResponse = {
        ...CONSUMER_LOGIN_RESPONSE,
        user: { ...CONSUMER_LOGIN_RESPONSE.user, photo_url: 'https://example.com/photo.jpg' },
      }
      const mutateFn = buildMutateFn(responseWithPhoto)
      setupMocks(mutateFn)

      const { result } = renderHook(() => useLoginSection())

      await act(async () => {
        result.current.control._formValues.email = 'jane@example.com'
        result.current.control._formValues.password = 'secret123'
        await result.current.onSubmit({} as never)
      })

      await waitFor(() => {
        expect(mockedPersistSession).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({ photo_url: 'https://example.com/photo.jpg' }),
          expect.any(Function),
          expect.any(Function),
        )
      })
    })
  })

  describe('on login error', () => {
    it('should not call persistSession when mutation errors', async () => {
      const mutateFn = buildMutateFn(undefined, new Error('Invalid credentials'))
      setupMocks(mutateFn)

      const { result } = renderHook(() => useLoginSection())

      await act(async () => {
        result.current.control._formValues.email = 'jane@example.com'
        result.current.control._formValues.password = 'wrongpassword'
        await result.current.onSubmit({} as never)
      })

      expect(mockedPersistSession).not.toHaveBeenCalled()
    })

    it('should not navigate when mutation errors', async () => {
      const mutateFn = buildMutateFn(undefined, new Error('Invalid credentials'))
      setupMocks(mutateFn)

      const { result } = renderHook(() => useLoginSection())

      await act(async () => {
        result.current.control._formValues.email = 'jane@example.com'
        result.current.control._formValues.password = 'wrongpassword'
        await result.current.onSubmit({} as never)
      })

      expect(mockedRouterReplace).not.toHaveBeenCalled()
    })
  })

  describe('form validation', () => {
    it('should not call mutate when email is empty', async () => {
      const mutateFn = jest.fn()
      setupMocks(mutateFn)

      const { result } = renderHook(() => useLoginSection())

      await act(async () => {
        result.current.control._formValues.email = ''
        result.current.control._formValues.password = 'secret123'
        await result.current.onSubmit({} as never)
      })

      expect(mutateFn).not.toHaveBeenCalled()
    })

    it('should not call mutate when password is empty', async () => {
      const mutateFn = jest.fn()
      setupMocks(mutateFn)

      const { result } = renderHook(() => useLoginSection())

      await act(async () => {
        result.current.control._formValues.email = 'jane@example.com'
        result.current.control._formValues.password = ''
        await result.current.onSubmit({} as never)
      })

      expect(mutateFn).not.toHaveBeenCalled()
    })

    it('should not call mutate when email format is invalid', async () => {
      const mutateFn = jest.fn()
      setupMocks(mutateFn)

      const { result } = renderHook(() => useLoginSection())

      await act(async () => {
        result.current.control._formValues.email = 'not-an-email'
        result.current.control._formValues.password = 'secret123'
        await result.current.onSubmit({} as never)
      })

      expect(mutateFn).not.toHaveBeenCalled()
    })

    it('should not call mutate when both fields are empty', async () => {
      const mutateFn = jest.fn()
      setupMocks(mutateFn)

      const { result } = renderHook(() => useLoginSection())

      await act(async () => {
        await result.current.onSubmit({} as never)
      })

      expect(mutateFn).not.toHaveBeenCalled()
    })
  })

  describe('useLogin integration', () => {
    it('should call useLogin on mount', () => {
      setupMocks()
      renderHook(() => useLoginSection())
      expect(mockedUseLogin).toHaveBeenCalled()
    })

    it('should call useAuthStore on mount', () => {
      setupMocks()
      renderHook(() => useLoginSection())
      expect(mockedUseAuthStore).toHaveBeenCalled()
    })
  })
})
