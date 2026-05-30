import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import LoginSection from '../index'
import { useLoginSection } from '../useLoginSection'

jest.mock('../useLoginSection', () => ({
  useLoginSection: jest.fn(),
}))

// Mock react-hook-form Controller so it renders its child with stable field/fieldState props
// without needing a real FormProvider or control instance.
jest.mock('react-hook-form', () => {
  const actual = jest.requireActual('react-hook-form')
  return {
    ...actual,
    Controller: ({
      render: renderProp,
    }: {
      render: (args: {
        field: { onChange: () => void; value: string }
        fieldState: { error: undefined }
      }) => React.ReactElement
      name: string
    }) =>
      renderProp({
        field: { onChange: jest.fn(), value: '' },
        fieldState: { error: undefined },
      }),
  }
})

jest.mock('@/components/Banner', () => {
  const { View } = require('react-native')
  const MockBanner = () => <View testID="banner" />
  return MockBanner
})

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}))

const mockUseLoginSection = useLoginSection as jest.MockedFunction<typeof useLoginSection>

const buildDefaultHookReturn = (
  overrides: Partial<ReturnType<typeof useLoginSection>> = {},
): ReturnType<typeof useLoginSection> => ({
  control: {} as ReturnType<typeof useLoginSection>['control'],
  onSubmit: jest.fn(),
  isValid: true,
  isPending: false,
  ...overrides,
})

beforeEach(() => {
  mockUseLoginSection.mockReturnValue(buildDefaultHookReturn())
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('LoginSection', () => {
  describe('rendering', () => {
    it('should render the email input placeholder', () => {
      // Arrange & Act
      const { getByPlaceholderText } = render(
        <LoginSection onSwitchToRegister={jest.fn()} />,
      )

      // Assert
      expect(getByPlaceholderText('tu@email.com')).toBeTruthy()
    })

    it('should render the password input placeholder', () => {
      // Arrange & Act
      const { getByPlaceholderText } = render(
        <LoginSection onSwitchToRegister={jest.fn()} />,
      )

      // Assert
      expect(getByPlaceholderText('Contraseña')).toBeTruthy()
    })

    it('should render the login button with label Ingresar', () => {
      // Arrange & Act
      const { getByText } = render(
        <LoginSection onSwitchToRegister={jest.fn()} />,
      )

      // Assert
      expect(getByText('Ingresar')).toBeTruthy()
    })

    it('should render the switch to register link', () => {
      // Arrange & Act
      const { getByText } = render(
        <LoginSection onSwitchToRegister={jest.fn()} />,
      )

      // Assert
      expect(getByText('Registrarse')).toBeTruthy()
    })

    it('should render the banner', () => {
      // Arrange & Act
      const { getByTestId } = render(
        <LoginSection onSwitchToRegister={jest.fn()} />,
      )

      // Assert
      expect(getByTestId('banner')).toBeTruthy()
    })

    it('should render the section heading text', () => {
      // Arrange & Act
      const { getByText } = render(
        <LoginSection onSwitchToRegister={jest.fn()} />,
      )

      // Assert
      expect(getByText('Iniciá sesión')).toBeTruthy()
    })
  })

  describe('submit button behavior', () => {
    it('should call onSubmit when the Ingresar button is pressed', () => {
      // Arrange
      const onSubmit = jest.fn()
      mockUseLoginSection.mockReturnValue(buildDefaultHookReturn({ onSubmit, isValid: true }))
      const { getByText } = render(<LoginSection onSwitchToRegister={jest.fn()} />)

      // Act
      fireEvent.press(getByText('Ingresar'))

      // Assert
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })

    it('should disable the submit button when isValid is false', () => {
      // Arrange
      mockUseLoginSection.mockReturnValue(buildDefaultHookReturn({ isValid: false, isPending: false }))
      const { UNSAFE_getAllByType } = render(<LoginSection onSwitchToRegister={jest.fn()} />)
      const { TouchableOpacity } = require('react-native')

      // Act — find the submit button: it is the TouchableOpacity whose onPress is onSubmit
      // The Button component's TouchableOpacity has disabled={!isValid || loading}
      const touchables = UNSAFE_getAllByType(TouchableOpacity)
      // Find the one with children containing "Ingresar" label by checking disabled prop
      const submitButton = touchables.find(
        (t: { props: { disabled?: boolean; children: unknown } }) => t.props.disabled === true,
      )

      // Assert
      expect(submitButton).toBeTruthy()
      expect(submitButton.props.disabled).toBe(true)
    })

    it('should enable the submit button when isValid is true', () => {
      // Arrange
      mockUseLoginSection.mockReturnValue(buildDefaultHookReturn({ isValid: true, isPending: false }))
      const { UNSAFE_getAllByType } = render(<LoginSection onSwitchToRegister={jest.fn()} />)
      const { TouchableOpacity } = require('react-native')

      // Act — when enabled, disabled prop is undefined/false (React Native omits it when falsy)
      const touchables = UNSAFE_getAllByType(TouchableOpacity)
      // The submit button is the first one (Ingresar). disabled = !isValid || loading = false
      const submitButton = touchables[0]

      // Assert — not disabled means the prop is falsy
      expect(submitButton.props.disabled).toBeFalsy()
    })
  })

  describe('loading state', () => {
    it('should show ActivityIndicator when isPending is true', () => {
      // Arrange
      mockUseLoginSection.mockReturnValue(buildDefaultHookReturn({ isPending: true }))
      const { UNSAFE_getByType } = render(<LoginSection onSwitchToRegister={jest.fn()} />)
      const { ActivityIndicator } = require('react-native')

      // Act & Assert
      expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy()
    })

    it('should not show ActivityIndicator when isPending is false', () => {
      // Arrange
      mockUseLoginSection.mockReturnValue(buildDefaultHookReturn({ isPending: false }))
      const { UNSAFE_queryByType } = render(<LoginSection onSwitchToRegister={jest.fn()} />)
      const { ActivityIndicator } = require('react-native')

      // Act & Assert
      expect(UNSAFE_queryByType(ActivityIndicator)).toBeNull()
    })

    it('should disable the button when isPending is true', () => {
      // Arrange — isPending=true, isValid=true. Button receives loading=true => disabled=true
      mockUseLoginSection.mockReturnValue(buildDefaultHookReturn({ isPending: true, isValid: true }))
      const { UNSAFE_getAllByType } = render(<LoginSection onSwitchToRegister={jest.fn()} />)
      const { TouchableOpacity } = require('react-native')

      // Act — Button passes disabled={disabled || loading} to TouchableOpacity
      const touchables = UNSAFE_getAllByType(TouchableOpacity)
      const disabledButton = touchables.find(
        (t: { props: { disabled?: boolean } }) => t.props.disabled === true,
      )

      // Assert
      expect(disabledButton).toBeTruthy()
    })
  })

  describe('switch to register', () => {
    it('should call onSwitchToRegister when the Registrarse link is pressed', () => {
      // Arrange
      const onSwitchToRegister = jest.fn()
      const { getByText } = render(<LoginSection onSwitchToRegister={onSwitchToRegister} />)

      // Act
      fireEvent.press(getByText('Registrarse'))

      // Assert
      expect(onSwitchToRegister).toHaveBeenCalledTimes(1)
    })
  })
})
