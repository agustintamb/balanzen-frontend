import { act, renderHook } from '@testing-library/react-native'
import { BackHandler, Keyboard, Platform } from 'react-native'

import type { UserRole } from '@/api/users/users.types'
import { useAuthScreen } from '@/app/(auth)/useAuthScreen'

// Use spyOn instead of mocking the whole module to avoid TurboModuleRegistry cascade issues
beforeEach(() => {
  jest.spyOn(BackHandler, 'addEventListener').mockReturnValue({ remove: jest.fn() } as any)
  jest.spyOn(Keyboard, 'addListener').mockReturnValue({ remove: jest.fn() } as any)
  Object.defineProperty(Platform, 'OS', { value: 'android', configurable: true })
})

afterEach(() => {
  jest.clearAllMocks()
  jest.restoreAllMocks()
})

// Helper to extract and invoke the registered hardwareBackPress callback
const getBackPressCallback = (): (() => boolean) => {
  const calls = (BackHandler.addEventListener as jest.Mock).mock.calls
  const lastCall = calls[calls.length - 1]
  return lastCall[1] as () => boolean
}

describe('useAuthScreen', () => {
  describe('initial state', () => {
    it('should start in login mode', () => {
      const { result } = renderHook(() => useAuthScreen())

      expect(result.current.mode).toBe('login')
    })

    it('should have selectedRole as null initially', () => {
      const { result } = renderHook(() => useAuthScreen())

      expect(result.current.selectedRole).toBeNull()
    })

    it('should have androidKeyboardPad as 0 initially', () => {
      const { result } = renderHook(() => useAuthScreen())

      expect(result.current.androidKeyboardPad).toBe(0)
    })
  })

  describe('handleGoToRegister', () => {
    it('should change mode to register-role when handleGoToRegister is called', () => {
      const { result } = renderHook(() => useAuthScreen())

      act(() => {
        result.current.handleGoToRegister()
      })

      expect(result.current.mode).toBe('register-role')
    })
  })

  describe('handleRoleContinue', () => {
    it('should set selectedRole and change mode to register-personal when handleRoleContinue is called with CONSUMIDOR', () => {
      const { result } = renderHook(() => useAuthScreen())
      const role: UserRole = 'CONSUMIDOR'

      act(() => {
        result.current.handleRoleContinue(role)
      })

      expect(result.current.selectedRole).toBe('CONSUMIDOR')
      expect(result.current.mode).toBe('register-personal')
    })

    it('should set selectedRole and change mode to register-personal when handleRoleContinue is called with COMERCIO', () => {
      const { result } = renderHook(() => useAuthScreen())
      const role: UserRole = 'COMERCIO'

      act(() => {
        result.current.handleRoleContinue(role)
      })

      expect(result.current.selectedRole).toBe('COMERCIO')
      expect(result.current.mode).toBe('register-personal')
    })
  })

  describe('handlePersonalContinue', () => {
    it('should change mode to register-commerce when handlePersonalContinue is called', () => {
      const { result } = renderHook(() => useAuthScreen())

      act(() => {
        result.current.handleRoleContinue('COMERCIO')
      })
      act(() => {
        result.current.handlePersonalContinue()
      })

      expect(result.current.mode).toBe('register-commerce')
    })
  })

  describe('handlePersonalBack', () => {
    it('should change mode back to register-role when handlePersonalBack is called', () => {
      const { result } = renderHook(() => useAuthScreen())

      act(() => {
        result.current.handleRoleContinue('CONSUMIDOR')
      })
      act(() => {
        result.current.handlePersonalBack()
      })

      expect(result.current.mode).toBe('register-role')
    })
  })

  describe('handleCommerceBack', () => {
    it('should change mode back to register-personal when handleCommerceBack is called', () => {
      const { result } = renderHook(() => useAuthScreen())

      act(() => {
        result.current.handleRoleContinue('COMERCIO')
      })
      act(() => {
        result.current.handlePersonalContinue()
      })
      act(() => {
        result.current.handleCommerceBack()
      })

      expect(result.current.mode).toBe('register-personal')
    })
  })

  describe('handleGoToLogin', () => {
    it('should reset mode to login and clear selectedRole when handleGoToLogin is called', () => {
      const { result } = renderHook(() => useAuthScreen())

      act(() => {
        result.current.handleRoleContinue('COMERCIO')
      })
      act(() => {
        result.current.handleGoToLogin()
      })

      expect(result.current.mode).toBe('login')
      expect(result.current.selectedRole).toBeNull()
    })

    it('should clear selectedRole regardless of previously selected role', () => {
      const { result } = renderHook(() => useAuthScreen())

      act(() => {
        result.current.handleRoleContinue('CONSUMIDOR')
      })
      expect(result.current.selectedRole).toBe('CONSUMIDOR')

      act(() => {
        result.current.handleGoToLogin()
      })

      expect(result.current.selectedRole).toBeNull()
    })
  })

  describe('BackHandler registration', () => {
    it('should register hardwareBackPress listener on mount', () => {
      renderHook(() => useAuthScreen())

      expect(BackHandler.addEventListener).toHaveBeenCalledWith(
        'hardwareBackPress',
        expect.any(Function),
      )
    })

    it('should remove the BackHandler listener on unmount', () => {
      const removeMock = jest.fn()
      ;(BackHandler.addEventListener as jest.Mock).mockReturnValueOnce({
        remove: removeMock,
      })

      const { unmount } = renderHook(() => useAuthScreen())
      unmount()

      expect(removeMock).toHaveBeenCalledTimes(1)
    })

    it('should re-register BackHandler listener whenever mode changes', () => {
      const { result } = renderHook(() => useAuthScreen())

      // Initial mount registers once
      const callCountAfterMount = (BackHandler.addEventListener as jest.Mock).mock.calls.length

      act(() => {
        result.current.handleGoToRegister()
      })

      expect((BackHandler.addEventListener as jest.Mock).mock.calls.length).toBeGreaterThan(
        callCountAfterMount,
      )
    })
  })

  describe('BackHandler behavior — hardware back press', () => {
    it('should return false (allow default exit) when back is pressed in login mode', () => {
      renderHook(() => useAuthScreen())

      const callback = getBackPressCallback()
      const result = callback()

      expect(result).toBe(false)
    })

    it('should navigate to login and return true when back is pressed in register-role mode', () => {
      const { result } = renderHook(() => useAuthScreen())

      act(() => {
        result.current.handleGoToRegister()
      })

      const callback = getBackPressCallback()
      let handled: boolean
      act(() => {
        handled = callback()
      })

      expect(handled!).toBe(true)
      expect(result.current.mode).toBe('login')
      expect(result.current.selectedRole).toBeNull()
    })

    it('should navigate to register-role and return true when back is pressed in register-personal mode', () => {
      const { result } = renderHook(() => useAuthScreen())

      act(() => {
        result.current.handleRoleContinue('CONSUMIDOR')
      })

      const callback = getBackPressCallback()
      let handled: boolean
      act(() => {
        handled = callback()
      })

      expect(handled!).toBe(true)
      expect(result.current.mode).toBe('register-role')
    })

    it('should navigate to register-personal and return true when back is pressed in register-commerce mode', () => {
      const { result } = renderHook(() => useAuthScreen())

      act(() => {
        result.current.handleRoleContinue('COMERCIO')
      })
      act(() => {
        result.current.handlePersonalContinue()
      })

      const callback = getBackPressCallback()
      let handled: boolean
      act(() => {
        handled = callback()
      })

      expect(handled!).toBe(true)
      expect(result.current.mode).toBe('register-personal')
    })
  })

  describe('androidKeyboardPad — keyboard listeners', () => {
    it('should register keyboardDidShow and keyboardDidHide listeners on Android', () => {
      renderHook(() => useAuthScreen())

      const listenerCalls = (Keyboard.addListener as jest.Mock).mock.calls
      const eventNames = listenerCalls.map((call: unknown[]) => call[0])

      expect(eventNames).toContain('keyboardDidShow')
      expect(eventNames).toContain('keyboardDidHide')
    })

    it('should remove keyboard listeners on unmount', () => {
      const removeShow = jest.fn()
      const removeHide = jest.fn()
      ;(Keyboard.addListener as jest.Mock)
        .mockReturnValueOnce({ remove: removeShow })
        .mockReturnValueOnce({ remove: removeHide })

      const { unmount } = renderHook(() => useAuthScreen())
      unmount()

      expect(removeShow).toHaveBeenCalledTimes(1)
      expect(removeHide).toHaveBeenCalledTimes(1)
    })

    it('should not register keyboard listeners on iOS', () => {
      const originalOS = Platform.OS
      Object.defineProperty(Platform, 'OS', { value: 'ios', configurable: true })

      renderHook(() => useAuthScreen())

      expect(Keyboard.addListener).not.toHaveBeenCalled()

      Object.defineProperty(Platform, 'OS', { value: originalOS, configurable: true })
    })

    it('should update androidKeyboardPad when keyboardDidShow fires', () => {
      let showCallback: ((event: { endCoordinates: { height: number } }) => void) | null = null
      ;(Keyboard.addListener as jest.Mock).mockImplementation(
        (event: string, cb: (event: { endCoordinates: { height: number } }) => void) => {
          if (event === 'keyboardDidShow') showCallback = cb
          return { remove: jest.fn() }
        },
      )

      const { result } = renderHook(() => useAuthScreen())

      act(() => {
        showCallback!({ endCoordinates: { height: 320 } })
      })

      expect(result.current.androidKeyboardPad).toBe(320)
    })

    it('should reset androidKeyboardPad to 0 when keyboardDidHide fires', () => {
      let showCallback: ((event: { endCoordinates: { height: number } }) => void) | null = null
      let hideCallback: (() => void) | null = null
      ;(Keyboard.addListener as jest.Mock).mockImplementation(
        (event: string, cb: ((event: { endCoordinates: { height: number } }) => void) & (() => void)) => {
          if (event === 'keyboardDidShow') showCallback = cb
          if (event === 'keyboardDidHide') hideCallback = cb
          return { remove: jest.fn() }
        },
      )

      const { result } = renderHook(() => useAuthScreen())

      act(() => {
        showCallback!({ endCoordinates: { height: 280 } })
      })
      expect(result.current.androidKeyboardPad).toBe(280)

      act(() => {
        hideCallback!()
      })
      expect(result.current.androidKeyboardPad).toBe(0)
    })
  })

  describe('full registration flow — mode transitions', () => {
    it('should traverse the full commerce registration flow in order', () => {
      const { result } = renderHook(() => useAuthScreen())

      expect(result.current.mode).toBe('login')

      act(() => {
        result.current.handleGoToRegister()
      })
      expect(result.current.mode).toBe('register-role')

      act(() => {
        result.current.handleRoleContinue('COMERCIO')
      })
      expect(result.current.mode).toBe('register-personal')
      expect(result.current.selectedRole).toBe('COMERCIO')

      act(() => {
        result.current.handlePersonalContinue()
      })
      expect(result.current.mode).toBe('register-commerce')
    })

    it('should go back to login from register-commerce via back press chain', () => {
      const { result } = renderHook(() => useAuthScreen())

      // Navigate forward to register-commerce
      act(() => { result.current.handleRoleContinue('COMERCIO') })
      act(() => { result.current.handlePersonalContinue() })
      expect(result.current.mode).toBe('register-commerce')

      // Back from register-commerce → register-personal
      act(() => { result.current.handleCommerceBack() })
      expect(result.current.mode).toBe('register-personal')

      // Back from register-personal → register-role
      act(() => { result.current.handlePersonalBack() })
      expect(result.current.mode).toBe('register-role')

      // Back from register-role → login
      act(() => { result.current.handleGoToLogin() })
      expect(result.current.mode).toBe('login')
    })
  })
})
