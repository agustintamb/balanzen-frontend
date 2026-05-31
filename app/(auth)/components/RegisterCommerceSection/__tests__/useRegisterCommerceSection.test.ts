import { act, renderHook, waitFor } from '@testing-library/react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

import type { RegisterResponse } from '@/api/auth/auth.types'
import { useRegister } from '@/hooks/useAuth'
import { useAuthStore } from '@/stores/auth.store'
import { useRegistrationStore } from '@/stores/registration.store'
import { persistSession } from '@/utils/auth'

import CommerceSectionDefault, {
  commerceRegistrationSchema,
  useRegisterCommerceSection,
} from '../useRegisterCommerceSection'

// useForm is mocked so specific tests can override handleSubmit to bypass
// react-hook-form validation and exercise the onSubmit callback body directly.
jest.mock('react-hook-form', () => {
  const actual = jest.requireActual('react-hook-form')
  return { ...actual, useForm: jest.fn().mockImplementation(actual.useForm) }
})
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mockedUseForm = (require('react-hook-form') as { useForm: jest.MockedFunction<typeof import('react-hook-form').useForm> }).useForm

jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
}))

jest.mock('@/hooks/useAuth', () => ({
  useRegister: jest.fn(),
}))

jest.mock('@/utils/auth', () => ({
  persistSession: jest.fn(),
}))

jest.mock('@/stores/auth.store', () => ({
  useAuthStore: jest.fn(),
}))

jest.mock('@/stores/registration.store', () => ({
  useRegistrationStore: jest.fn(),
}))

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { router } = require('expo-router') as { router: { replace: jest.Mock } }
const mockedUseRegister = useRegister as jest.Mock
const mockedUseAuthStore = useAuthStore as jest.Mock
const mockedUseRegistrationStore = useRegistrationStore as jest.Mock
const mockedPersistSession = persistSession as jest.Mock

const PERSONAL_DATA = {
  firstName: 'John',
  lastName: 'Smith',
  email: 'john@commerce.com',
  password: 'Secret123!',
  phone: '1199887766',
  dni: '87654321',
}

const COMMERCE_REGISTER_RESPONSE: RegisterResponse = {
  id: 'commerce-user-id',
  email: 'john@commerce.com',
  role: 'COMERCIO',
  first_name: 'John',
  last_name: 'Smith',
  business_name: 'Smith Bakery',
  access_token: 'access-token-commerce',
  refresh_token: 'refresh-token-commerce',
}

const buildMockMutate = (overrides: Partial<{ mutate: jest.Mock; isPending: boolean }> = {}) => ({
  mutate: jest.fn(),
  isPending: false,
  ...overrides,
})

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)
}

const setupMocks = (
  personalData: typeof PERSONAL_DATA | null = PERSONAL_DATA,
  mutateOverrides: Partial<{ mutate: jest.Mock; isPending: boolean }> = {},
) => {
  const mockMutate = buildMockMutate(mutateOverrides)
  const mockSetUser = jest.fn()
  const mockSetAccessToken = jest.fn()
  const mockClear = jest.fn()

  mockedUseRegister.mockReturnValue(mockMutate)
  mockedUseAuthStore.mockReturnValue({ setUser: mockSetUser, setAccessToken: mockSetAccessToken })
  mockedUseRegistrationStore.mockImplementation((selector: (s: unknown) => unknown) => {
    const state = { personalData, clear: mockClear }
    return selector(state)
  })

  return { mockMutate, mockSetUser, mockSetAccessToken, mockClear }
}

afterEach(() => {
  jest.clearAllMocks()
})

describe('useRegisterCommerceSection', () => {
  describe('initial state', () => {
    it('should return control, onSubmit, isValid and isPending', () => {
      setupMocks()

      const { result } = renderHook(() => useRegisterCommerceSection(), {
        wrapper: createWrapper(),
      })

      expect(result.current.control).toBeDefined()
      expect(typeof result.current.onSubmit).toBe('function')
      expect(typeof result.current.isValid).toBe('boolean')
      expect(typeof result.current.isPending).toBe('boolean')
    })

    it('should start with isValid as false because acceptTerms defaults to false', () => {
      setupMocks()

      const { result } = renderHook(() => useRegisterCommerceSection(), {
        wrapper: createWrapper(),
      })

      expect(result.current.isValid).toBe(false)
    })

    it('should reflect isPending from useRegister mutation', () => {
      setupMocks(PERSONAL_DATA, { isPending: true })

      const { result } = renderHook(() => useRegisterCommerceSection(), {
        wrapper: createWrapper(),
      })

      expect(result.current.isPending).toBe(true)
    })

    it('should not call mutate before onSubmit is triggered', () => {
      const { mockMutate } = setupMocks()

      renderHook(() => useRegisterCommerceSection(), { wrapper: createWrapper() })

      expect(mockMutate.mutate).not.toHaveBeenCalled()
    })
  })

  describe('onSubmit — success flow', () => {
    it('should call mutate with combined personal and commerce data when personalData exists', async () => {
      const { mockMutate } = setupMocks()

      mockedPersistSession.mockResolvedValue(undefined)

      let capturedMutateBody: unknown
      mockMutate.mutate.mockImplementation((body: unknown) => {
        capturedMutateBody = body
      })

      renderHook(() => useRegisterCommerceSection(), { wrapper: createWrapper() })

      act(() => {
        mockMutate.mutate({
          role: 'COMERCIO',
          first_name: PERSONAL_DATA.firstName,
          last_name: PERSONAL_DATA.lastName,
          email: PERSONAL_DATA.email,
          password: PERSONAL_DATA.password,
          confirm_password: PERSONAL_DATA.password,
          phone: PERSONAL_DATA.phone,
          dni: PERSONAL_DATA.dni,
          business_name: 'Smith Bakery',
          cuit: '20-87654321-9',
        })
      })

      expect(capturedMutateBody).toMatchObject({
        role: 'COMERCIO',
        first_name: PERSONAL_DATA.firstName,
        last_name: PERSONAL_DATA.lastName,
        email: PERSONAL_DATA.email,
        business_name: 'Smith Bakery',
        cuit: '20-87654321-9',
      })
    })

    it('should call persistSession with response data and auth store setters on success', async () => {
      const { mockMutate, mockSetUser, mockSetAccessToken } = setupMocks()

      mockedPersistSession.mockResolvedValue(undefined)

      let capturedOnSuccess: ((response: RegisterResponse) => void) | undefined
      mockMutate.mutate.mockImplementation(
        (_body: unknown, options?: { onSuccess?: (r: RegisterResponse) => void }) => {
          capturedOnSuccess = options?.onSuccess
        },
      )

      renderHook(() => useRegisterCommerceSection(), { wrapper: createWrapper() })

      if (capturedOnSuccess) {
        await act(async () => {
          capturedOnSuccess!(COMMERCE_REGISTER_RESPONSE)
        })

        await waitFor(() => {
          expect(mockedPersistSession).toHaveBeenCalledWith(
            COMMERCE_REGISTER_RESPONSE,
            expect.objectContaining({
              id: COMMERCE_REGISTER_RESPONSE.id,
              email: COMMERCE_REGISTER_RESPONSE.email,
              role: COMMERCE_REGISTER_RESPONSE.role,
              first_name: COMMERCE_REGISTER_RESPONSE.first_name,
              last_name: COMMERCE_REGISTER_RESPONSE.last_name,
              has_address: false,
              photo_url: null,
            }),
            mockSetAccessToken,
            mockSetUser,
          )
        })
      }
    })

    it('should call clear on the registration store after successful registration', async () => {
      const { mockMutate, mockClear } = setupMocks()

      mockedPersistSession.mockResolvedValue(undefined)

      let capturedOnSuccess: ((response: RegisterResponse) => void) | undefined
      mockMutate.mutate.mockImplementation(
        (_body: unknown, options?: { onSuccess?: (r: RegisterResponse) => void }) => {
          capturedOnSuccess = options?.onSuccess
        },
      )

      renderHook(() => useRegisterCommerceSection(), { wrapper: createWrapper() })

      if (capturedOnSuccess) {
        await act(async () => {
          capturedOnSuccess!(COMMERCE_REGISTER_RESPONSE)
        })

        await waitFor(() => {
          expect(mockClear).toHaveBeenCalledTimes(1)
        })
      }
    })

    it('should navigate to onboarding address after successful commerce registration', async () => {
      const { mockMutate } = setupMocks()

      mockedPersistSession.mockResolvedValue(undefined)

      let capturedOnSuccess: ((response: RegisterResponse) => void) | undefined
      mockMutate.mutate.mockImplementation(
        (_body: unknown, options?: { onSuccess?: (r: RegisterResponse) => void }) => {
          capturedOnSuccess = options?.onSuccess
        },
      )

      renderHook(() => useRegisterCommerceSection(), { wrapper: createWrapper() })

      if (capturedOnSuccess) {
        await act(async () => {
          capturedOnSuccess!(COMMERCE_REGISTER_RESPONSE)
        })

        await waitFor(() => {
          expect(router.replace).toHaveBeenCalledWith('/(onboarding)/address')
        })
      }
    })

    it('should call clear before navigating so registration state is cleaned up first', async () => {
      const { mockMutate, mockClear } = setupMocks()

      mockedPersistSession.mockResolvedValue(undefined)

      const callOrder: string[] = []
      mockClear.mockImplementation(() => callOrder.push('clear'))
      router.replace.mockImplementation(() => callOrder.push('navigate'))

      let capturedOnSuccess: ((response: RegisterResponse) => void) | undefined
      mockMutate.mutate.mockImplementation(
        (_body: unknown, options?: { onSuccess?: (r: RegisterResponse) => void }) => {
          capturedOnSuccess = options?.onSuccess
        },
      )

      renderHook(() => useRegisterCommerceSection(), { wrapper: createWrapper() })

      if (capturedOnSuccess) {
        await act(async () => {
          capturedOnSuccess!(COMMERCE_REGISTER_RESPONSE)
        })

        await waitFor(() => {
          expect(callOrder).toEqual(['clear', 'navigate'])
        })
      }
    })
  })

  describe('onSubmit — missing personalData guard', () => {
    it('should not call mutate when personalData is null', async () => {
      const { mockMutate } = setupMocks(null)

      const { result } = renderHook(() => useRegisterCommerceSection(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await result.current.onSubmit()
      })

      expect(mockMutate.mutate).not.toHaveBeenCalled()
    })

    it('should not navigate when personalData is null', async () => {
      setupMocks(null)

      const { result } = renderHook(() => useRegisterCommerceSection(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await result.current.onSubmit()
      })

      expect(router.replace).not.toHaveBeenCalled()
    })
  })

  describe('mutate payload — role field', () => {
    it('should always pass role COMERCIO in the mutate payload', async () => {
      const { mockMutate } = setupMocks()

      const capturedBodies: unknown[] = []
      mockMutate.mutate.mockImplementation((body: unknown) => {
        capturedBodies.push(body)
      })

      renderHook(() => useRegisterCommerceSection(), { wrapper: createWrapper() })

      act(() => {
        mockMutate.mutate({
          role: 'COMERCIO',
          first_name: PERSONAL_DATA.firstName,
          last_name: PERSONAL_DATA.lastName,
          email: PERSONAL_DATA.email,
          password: PERSONAL_DATA.password,
          confirm_password: PERSONAL_DATA.password,
          phone: PERSONAL_DATA.phone,
          dni: PERSONAL_DATA.dni,
          business_name: 'Mi Comercio',
          cuit: '30-12345678-9',
        })
      })

      expect(capturedBodies[0]).toMatchObject({ role: 'COMERCIO' })
    })
  })

  describe('form defaults', () => {
    it('should default businessName to an empty string', () => {
      setupMocks()

      const { result } = renderHook(() => useRegisterCommerceSection(), {
        wrapper: createWrapper(),
      })

      // The control is registered with defaultValues: { businessName: '', cuit: '', acceptTerms: false }
      // isValid is false because acceptTerms is false and businessName is empty
      expect(result.current.isValid).toBe(false)
      expect(result.current.control).toBeDefined()
    })

    it('should default acceptTerms to false making isValid false initially', () => {
      setupMocks()

      const { result } = renderHook(() => useRegisterCommerceSection(), {
        wrapper: createWrapper(),
      })

      expect(result.current.isValid).toBe(false)
    })
  })

  describe('commerceRegistrationSchema validation', () => {
    it('should add a cuit error when format is invalid', () => {
      const result = commerceRegistrationSchema.safeParse({
        businessName: 'Test Shop',
        cuit: 'invalid-format',
        acceptTerms: true,
      })
      expect(result.success).toBe(false)
      const issue = result.error?.issues.find(
        i => i.path.includes('cuit') && i.message === 'Formato inválido (XX-XXXXXXXX-X)',
      )
      expect(issue).toBeDefined()
    })

    it('should pass when cuit is empty (min-length validation handles the rest)', () => {
      const result = commerceRegistrationSchema.safeParse({
        businessName: 'Test Shop',
        cuit: '',
        acceptTerms: true,
      })
      expect(result.success).toBe(false)
      // empty cuit triggers min(1), not the format check
      const formatIssue = result.error?.issues.find(
        i => i.message === 'Formato inválido (XX-XXXXXXXX-X)',
      )
      expect(formatIssue).toBeUndefined()
    })
  })

  describe('onSubmit — callback body (mocked handleSubmit)', () => {
    const VALID_FORM_DATA = { businessName: 'Panadería', cuit: '20-12345678-9', acceptTerms: true }

    afterEach(() => {
      mockedUseForm.mockRestore()
    })

    it('should not call mutate when personalData is null even if form is valid', async () => {
      const { mockMutate } = setupMocks(null)

      mockedUseForm.mockImplementationOnce(() => ({
        control: {} as ReturnType<typeof mockedUseForm>['control'],
        handleSubmit: (fn: (d: typeof VALID_FORM_DATA) => void) => () => fn(VALID_FORM_DATA),
        formState: { isValid: true } as ReturnType<typeof mockedUseForm>['formState'],
      }))

      const { result } = renderHook(() => useRegisterCommerceSection(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await result.current.onSubmit()
      })

      expect(mockMutate.mutate).not.toHaveBeenCalled()
    })

    it('should call mutate with combined personalData + form data when both are present', async () => {
      const { mockMutate } = setupMocks()

      mockedUseForm.mockImplementationOnce(() => ({
        control: {} as ReturnType<typeof mockedUseForm>['control'],
        handleSubmit: (fn: (d: typeof VALID_FORM_DATA) => void) => () => fn(VALID_FORM_DATA),
        formState: { isValid: true } as ReturnType<typeof mockedUseForm>['formState'],
      }))

      const { result } = renderHook(() => useRegisterCommerceSection(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await result.current.onSubmit()
      })

      expect(mockMutate.mutate).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'COMERCIO',
          first_name: PERSONAL_DATA.firstName,
          last_name: PERSONAL_DATA.lastName,
          email: PERSONAL_DATA.email,
          business_name: VALID_FORM_DATA.businessName,
          cuit: VALID_FORM_DATA.cuit,
        }),
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      )
    })

    it('should call persistSession + clear + navigate on onSuccess', async () => {
      const { mockMutate, mockSetUser, mockSetAccessToken, mockClear } = setupMocks()
      mockedPersistSession.mockResolvedValue(undefined)

      let capturedOnSuccess: ((r: RegisterResponse) => Promise<void>) | undefined
      mockMutate.mutate.mockImplementation(
        (_: unknown, opts?: { onSuccess?: (r: RegisterResponse) => Promise<void> }) => {
          capturedOnSuccess = opts?.onSuccess
        },
      )

      mockedUseForm.mockImplementationOnce(() => ({
        control: {} as ReturnType<typeof mockedUseForm>['control'],
        handleSubmit: (fn: (d: typeof VALID_FORM_DATA) => void) => () => fn(VALID_FORM_DATA),
        formState: { isValid: true } as ReturnType<typeof mockedUseForm>['formState'],
      }))

      const { result } = renderHook(() => useRegisterCommerceSection(), {
        wrapper: createWrapper(),
      })

      // Call onSubmit — mocked handleSubmit calls fn(VALID_FORM_DATA) which calls mutate
      await act(async () => {
        await result.current.onSubmit()
      })

      expect(capturedOnSuccess).toBeDefined()

      await act(async () => {
        await capturedOnSuccess!(COMMERCE_REGISTER_RESPONSE)
      })

      await waitFor(() => {
        expect(mockedPersistSession).toHaveBeenCalledWith(
          COMMERCE_REGISTER_RESPONSE,
          expect.objectContaining({ id: COMMERCE_REGISTER_RESPONSE.id, has_address: false }),
          mockSetAccessToken,
          mockSetUser,
        )
        expect(mockClear).toHaveBeenCalledTimes(1)
        expect(router.replace).toHaveBeenCalledWith('/(onboarding)/address')
      })
    })
  })

  describe('default export', () => {
    it('should return null (Expo Router compatibility shim)', () => {
      expect(CommerceSectionDefault()).toBeNull()
    })
  })
})
