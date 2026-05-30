import React from 'react'
import { act, fireEvent, render } from '@testing-library/react-native'
import { useUIStore } from '@/stores/ui.store'
import Toast from '../index'

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock('@/stores/ui.store', () => ({
  useUIStore: jest.fn(),
  useToast: jest.fn(),
}))

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
}))

jest.mock('@expo/vector-icons', () => {
  const { View } = require('react-native')
  return {
    Ionicons: ({ name, testID, ...props }: { name: string; testID?: string; [key: string]: unknown }) => (
      <View testID={testID ?? `icon-${name}`} {...props} />
    ),
  }
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockUseUIStore = useUIStore as jest.MockedFunction<typeof useUIStore>

interface ToastState {
  visible: boolean
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
}

const buildStoreState = (
  overrides: Partial<ToastState> = {},
  hideToast: jest.Mock = jest.fn(),
) => ({
  toast: {
    visible: false,
    message: '',
    type: 'error' as const,
    ...overrides,
  },
  showToast: jest.fn(),
  hideToast,
})

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Toast', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Visibility', () => {
    it('should render nothing when toast.visible is false', () => {
      mockUseUIStore.mockReturnValue(buildStoreState({ visible: false, message: 'Hello' }) as ReturnType<typeof useUIStore>)

      const { toJSON } = render(<Toast />)

      expect(toJSON()).toBeNull()
    })

    it('should render the toast container when toast.visible is true', () => {
      mockUseUIStore.mockReturnValue(
        buildStoreState({ visible: true, message: 'Something happened', type: 'info' }) as ReturnType<typeof useUIStore>,
      )

      const { getByText } = render(<Toast />)

      expect(getByText('Something happened')).toBeTruthy()
    })
  })

  describe('Message display', () => {
    it('should display the toast message text', () => {
      mockUseUIStore.mockReturnValue(
        buildStoreState({ visible: true, message: 'Product saved successfully', type: 'success' }) as ReturnType<typeof useUIStore>,
      )

      const { getByText } = render(<Toast />)

      expect(getByText('Product saved successfully')).toBeTruthy()
    })

    it('should display a long message truncated to 3 lines via numberOfLines prop', () => {
      const longMessage = 'This is a very long message that should be truncated after three lines of text in the toast component'
      mockUseUIStore.mockReturnValue(
        buildStoreState({ visible: true, message: longMessage, type: 'warning' }) as ReturnType<typeof useUIStore>,
      )

      const { getByText } = render(<Toast />)
      const textEl = getByText(longMessage)

      expect(textEl.props.numberOfLines).toBe(3)
    })
  })

  describe('Type-based styling', () => {
    // The rendered tree is:
    //   Animated.View (wrapper)
    //     TouchableOpacity (container — has backgroundColor)
    //       Ionicons (type icon)
    //       Text (message)          ← message.parent = TouchableOpacity
    //       TouchableOpacity (close btn)
    //
    // message.parent gives us the outer TouchableOpacity whose style prop is
    // [styles.container, { backgroundColor: cfg.bg }].

    it('should apply success background color when type is success', () => {
      mockUseUIStore.mockReturnValue(
        buildStoreState({ visible: true, message: 'Done!', type: 'success' }) as ReturnType<typeof useUIStore>,
      )

      const { getByText } = render(<Toast />)

      // Tree (from toJSON): Animated.View(wrapper) > View(container,backgroundColor) > [Icon, Text, View(close)]
      // getByText returns the Text node.
      // message.parent = View(container) which has the merged flat style with backgroundColor.
      const message = getByText('Done!')
      const containerStyle = message.parent?.parent?.props.style as Record<string, unknown>
      expect(containerStyle.backgroundColor).toBe('#EAF3DE')
    })

    it('should apply error background color when type is error', () => {
      mockUseUIStore.mockReturnValue(
        buildStoreState({ visible: true, message: 'Something went wrong', type: 'error' }) as ReturnType<typeof useUIStore>,
      )

      const { getByText } = render(<Toast />)

      const message = getByText('Something went wrong')
      const containerStyle = message.parent?.parent?.props.style as Record<string, unknown>
      expect(containerStyle.backgroundColor).toBe('#FDECEA')
    })

    it('should apply warning background color when type is warning', () => {
      mockUseUIStore.mockReturnValue(
        buildStoreState({ visible: true, message: 'Expiring soon', type: 'warning' }) as ReturnType<typeof useUIStore>,
      )

      const { getByText } = render(<Toast />)

      const message = getByText('Expiring soon')
      const containerStyle = message.parent?.parent?.props.style as Record<string, unknown>
      expect(containerStyle.backgroundColor).toBe('#FAEEDA')
    })

    it('should apply info background color when type is info', () => {
      mockUseUIStore.mockReturnValue(
        buildStoreState({ visible: true, message: 'FYI', type: 'info' }) as ReturnType<typeof useUIStore>,
      )

      const { getByText } = render(<Toast />)

      const message = getByText('FYI')
      const containerStyle = message.parent?.parent?.props.style as Record<string, unknown>
      expect(containerStyle.backgroundColor).toBe('#F3F4F6')
    })

    it('should apply success text color when type is success', () => {
      mockUseUIStore.mockReturnValue(
        buildStoreState({ visible: true, message: 'Order placed', type: 'success' }) as ReturnType<typeof useUIStore>,
      )

      const { getByText } = render(<Toast />)
      const textEl = getByText('Order placed')

      expect(textEl.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ color: '#27500A' })]),
      )
    })

    it('should apply error text color when type is error', () => {
      mockUseUIStore.mockReturnValue(
        buildStoreState({ visible: true, message: 'Network error', type: 'error' }) as ReturnType<typeof useUIStore>,
      )

      const { getByText } = render(<Toast />)
      const textEl = getByText('Network error')

      expect(textEl.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ color: '#C0392B' })]),
      )
    })

    it('should apply warning text color when type is warning', () => {
      mockUseUIStore.mockReturnValue(
        buildStoreState({ visible: true, message: 'Check your input', type: 'warning' }) as ReturnType<typeof useUIStore>,
      )

      const { getByText } = render(<Toast />)
      const textEl = getByText('Check your input')

      expect(textEl.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ color: '#9A5E0A' })]),
      )
    })
  })

  describe('Auto-dismiss', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should call hideToast after AUTO_DISMISS_MS (3500ms)', () => {
      const hideToast = jest.fn()
      mockUseUIStore.mockReturnValue(
        buildStoreState({ visible: true, message: 'Auto hide me', type: 'success' }, hideToast) as ReturnType<typeof useUIStore>,
      )

      render(<Toast />)

      expect(hideToast).not.toHaveBeenCalled()

      act(() => {
        jest.advanceTimersByTime(3500)
      })

      expect(hideToast).toHaveBeenCalledTimes(1)
    })

    it('should not call hideToast before the 3500ms timeout elapses', () => {
      const hideToast = jest.fn()
      mockUseUIStore.mockReturnValue(
        buildStoreState({ visible: true, message: 'Still here', type: 'info' }, hideToast) as ReturnType<typeof useUIStore>,
      )

      render(<Toast />)

      act(() => {
        jest.advanceTimersByTime(3000)
      })

      expect(hideToast).not.toHaveBeenCalled()
    })
  })

  describe('Manual dismiss', () => {
    it('should call hideToast when the close button is pressed', () => {
      const hideToast = jest.fn()
      mockUseUIStore.mockReturnValue(
        buildStoreState({ visible: true, message: 'Dismiss me', type: 'error' }, hideToast) as ReturnType<typeof useUIStore>,
      )

      const { getByTestId } = render(<Toast />)

      // The close icon rendered by the mock has testID "icon-close"
      const closeIcon = getByTestId('icon-close')
      fireEvent.press(closeIcon.parent as unknown as ReturnType<typeof getByTestId>)

      expect(hideToast).toHaveBeenCalledTimes(1)
    })

    it('should call hideToast when the toast body is pressed', () => {
      const hideToast = jest.fn()
      mockUseUIStore.mockReturnValue(
        buildStoreState({ visible: true, message: 'Tap to dismiss', type: 'success' }, hideToast) as ReturnType<typeof useUIStore>,
      )

      const { getByText } = render(<Toast />)

      fireEvent.press(getByText('Tap to dismiss'))

      expect(hideToast).toHaveBeenCalledTimes(1)
    })
  })

  describe('Edge cases', () => {
    it('should still render while the exit animation is running after toast.visible becomes false', () => {
      const hideToast = jest.fn()

      // Start visible
      mockUseUIStore.mockReturnValue(
        buildStoreState({ visible: true, message: 'Visible', type: 'info' }, hideToast) as ReturnType<typeof useUIStore>,
      )
      const { rerender, queryByText } = render(<Toast />)
      expect(queryByText('Visible')).toBeTruthy()

      // Transition to hidden — shouldRender stays true until the Animated callback fires
      mockUseUIStore.mockReturnValue(
        buildStoreState({ visible: false, message: 'Visible', type: 'info' }, hideToast) as ReturnType<typeof useUIStore>,
      )

      act(() => {
        rerender(<Toast />)
      })

      // The exit animation callback has not fired yet in the test env, so the
      // node is still mounted (animating out). This is the expected intermediate state.
      expect(queryByText('Visible')).toBeTruthy()
    })

    it('should render the correct icon for each toast type', () => {
      const types: Array<{ type: 'success' | 'error' | 'warning' | 'info'; iconName: string }> = [
        { type: 'success', iconName: 'icon-checkmark-circle-outline' },
        { type: 'error', iconName: 'icon-alert-circle-outline' },
        { type: 'warning', iconName: 'icon-warning-outline' },
        { type: 'info', iconName: 'icon-information-circle-outline' },
      ]

      types.forEach(({ type, iconName }) => {
        mockUseUIStore.mockReturnValue(
          buildStoreState({ visible: true, message: 'Test', type }) as ReturnType<typeof useUIStore>,
        )

        const { getByTestId, unmount } = render(<Toast />)
        expect(getByTestId(iconName)).toBeTruthy()
        unmount()
      })
    })
  })
})
