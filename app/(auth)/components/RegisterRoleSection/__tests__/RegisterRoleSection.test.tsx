import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import type { UserRole } from '@/api/users/users.types'
import RegisterRoleSection from '../index'
import { useRegisterRoleSection } from '../useRegisterRoleSection'

jest.mock('../useRegisterRoleSection', () => ({
  useRegisterRoleSection: jest.fn(),
}))

jest.mock('@/components/Banner', () => {
  const { View } = require('react-native')
  const MockBanner = () => <View testID="banner" />
  return MockBanner
})

jest.mock('@/components/ui/Chip', () => {
  const { Text } = require('react-native')
  const MockChip = ({ label, testID }: { label: string; testID?: string }) => (
    <Text testID={testID ?? `chip-${label}`}>{label}</Text>
  )
  return MockChip
})

jest.mock('@/components/ui/Icon', () => {
  const { Text } = require('react-native')
  const MockIcon = ({ name, testID }: { name: string; testID?: string }) => (
    <Text testID={testID ?? `icon-${name}`}>{name}</Text>
  )
  return MockIcon
})

jest.mock('@/utils/cn', () => ({
  cn: (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' '),
}))

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}))

const mockUseRegisterRoleSection = useRegisterRoleSection as jest.MockedFunction<
  typeof useRegisterRoleSection
>

const buildDefaultHookReturn = (
  overrides: Partial<ReturnType<typeof useRegisterRoleSection>> = {},
): ReturnType<typeof useRegisterRoleSection> => ({
  selectedRole: null,
  setSelectedRole: jest.fn(),
  ...overrides,
})

const DEFAULT_PROPS = {
  onContinue: jest.fn(),
  onSwitchToLogin: jest.fn(),
}

beforeEach(() => {
  mockUseRegisterRoleSection.mockReturnValue(buildDefaultHookReturn())
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('RegisterRoleSection', () => {
  describe('rendering', () => {
    it('should render the CONSUMIDOR role title', () => {
      // Arrange & Act
      const { getByText } = render(
        <RegisterRoleSection {...DEFAULT_PROPS} />,
      )

      // Assert
      expect(getByText('Soy consumidor')).toBeTruthy()
    })

    it('should render the COMERCIO role title', () => {
      // Arrange & Act
      const { getByText } = render(
        <RegisterRoleSection {...DEFAULT_PROPS} />,
      )

      // Assert
      expect(getByText('Soy comercio')).toBeTruthy()
    })

    it('should render both role descriptions', () => {
      // Arrange & Act
      const { getByText } = render(
        <RegisterRoleSection {...DEFAULT_PROPS} />,
      )

      // Assert
      expect(getByText('Explorá alimentos frescos a precios increíbles.')).toBeTruthy()
      expect(getByText('Publicá excedentes y reducí las pérdidas del negocio.')).toBeTruthy()
    })

    it('should render the continue button', () => {
      // Arrange & Act
      const { getByText } = render(
        <RegisterRoleSection {...DEFAULT_PROPS} />,
      )

      // Assert
      expect(getByText('Continuar')).toBeTruthy()
    })

    it('should render the switch to login link', () => {
      // Arrange & Act
      const { getByText } = render(
        <RegisterRoleSection {...DEFAULT_PROPS} />,
      )

      // Assert
      expect(getByText('Iniciar sesión')).toBeTruthy()
    })

    it('should render the banner', () => {
      // Arrange & Act
      const { getByTestId } = render(
        <RegisterRoleSection {...DEFAULT_PROPS} />,
      )

      // Assert
      expect(getByTestId('banner')).toBeTruthy()
    })

    it('should render the section heading', () => {
      // Arrange & Act
      const { getByText } = render(
        <RegisterRoleSection {...DEFAULT_PROPS} />,
      )

      // Assert
      expect(getByText('¿Cómo querés usar BalanZen?')).toBeTruthy()
    })
  })

  describe('role selection', () => {
    it('should call setSelectedRole with CONSUMIDOR when the consumer card is pressed', () => {
      // Arrange
      const setSelectedRole = jest.fn()
      mockUseRegisterRoleSection.mockReturnValue(
        buildDefaultHookReturn({ setSelectedRole }),
      )
      const { getByText } = render(<RegisterRoleSection {...DEFAULT_PROPS} />)

      // Act
      fireEvent.press(getByText('Soy consumidor'))

      // Assert
      expect(setSelectedRole).toHaveBeenCalledWith('CONSUMIDOR')
    })

    it('should call setSelectedRole with COMERCIO when the commerce card is pressed', () => {
      // Arrange
      const setSelectedRole = jest.fn()
      mockUseRegisterRoleSection.mockReturnValue(
        buildDefaultHookReturn({ setSelectedRole }),
      )
      const { getByText } = render(<RegisterRoleSection {...DEFAULT_PROPS} />)

      // Act
      fireEvent.press(getByText('Soy comercio'))

      // Assert
      expect(setSelectedRole).toHaveBeenCalledWith('COMERCIO')
    })

    it('should render CONSUMIDOR card with selected styles when selectedRole is CONSUMIDOR', () => {
      // Arrange
      mockUseRegisterRoleSection.mockReturnValue(
        buildDefaultHookReturn({ selectedRole: 'CONSUMIDOR' as UserRole }),
      )
      const { UNSAFE_getAllByType } = render(<RegisterRoleSection {...DEFAULT_PROPS} />)
      const { TouchableOpacity } = require('react-native')

      // Act
      const touchables = UNSAFE_getAllByType(TouchableOpacity)
      // First TouchableOpacity is the CONSUMIDOR RoleCard
      const consumerCard = touchables[0]

      // Assert — selected card gets border-primary
      expect(consumerCard.props.className).toContain('border-primary')
    })

    it('should render COMERCIO card with unselected styles when selectedRole is CONSUMIDOR', () => {
      // Arrange
      mockUseRegisterRoleSection.mockReturnValue(
        buildDefaultHookReturn({ selectedRole: 'CONSUMIDOR' as UserRole }),
      )
      const { UNSAFE_getAllByType } = render(<RegisterRoleSection {...DEFAULT_PROPS} />)
      const { TouchableOpacity } = require('react-native')

      // Act
      const touchables = UNSAFE_getAllByType(TouchableOpacity)
      // Second TouchableOpacity is the COMERCIO RoleCard
      const commerceCard = touchables[1]

      // Assert — unselected card gets border-gray-200
      expect(commerceCard.props.className).toContain('border-gray-200')
    })
  })

  describe('continue button state', () => {
    it('should disable the continue button when no role is selected', () => {
      // Arrange
      mockUseRegisterRoleSection.mockReturnValue(
        buildDefaultHookReturn({ selectedRole: null }),
      )
      const { UNSAFE_getAllByType } = render(<RegisterRoleSection {...DEFAULT_PROPS} />)
      const { TouchableOpacity } = require('react-native')

      // Act — find the TouchableOpacity that is disabled (the Continuar button)
      const touchables = UNSAFE_getAllByType(TouchableOpacity)
      const continueButton = touchables.find(
        (t: { props: { disabled?: boolean } }) => t.props.disabled === true,
      )

      // Assert
      expect(continueButton).toBeTruthy()
    })

    it('should enable the continue button when a role is selected', () => {
      // Arrange
      mockUseRegisterRoleSection.mockReturnValue(
        buildDefaultHookReturn({ selectedRole: 'CONSUMIDOR' as UserRole }),
      )
      const { UNSAFE_getAllByType } = render(<RegisterRoleSection {...DEFAULT_PROPS} />)
      const { TouchableOpacity } = require('react-native')

      // Act — when a role is selected, no TouchableOpacity should be disabled
      const touchables = UNSAFE_getAllByType(TouchableOpacity)
      const disabledButton = touchables.find(
        (t: { props: { disabled?: boolean } }) => t.props.disabled === true,
      )

      // Assert — continue button is not disabled (prop is falsy/absent)
      expect(disabledButton).toBeFalsy()
    })

    it('should call onContinue with CONSUMIDOR when continue is pressed and CONSUMIDOR is selected', () => {
      // Arrange
      const onContinue = jest.fn()
      mockUseRegisterRoleSection.mockReturnValue(
        buildDefaultHookReturn({ selectedRole: 'CONSUMIDOR' as UserRole }),
      )
      const { getByText } = render(
        <RegisterRoleSection onContinue={onContinue} onSwitchToLogin={jest.fn()} />,
      )

      // Act
      fireEvent.press(getByText('Continuar'))

      // Assert
      expect(onContinue).toHaveBeenCalledWith('CONSUMIDOR')
    })

    it('should call onContinue with COMERCIO when continue is pressed and COMERCIO is selected', () => {
      // Arrange
      const onContinue = jest.fn()
      mockUseRegisterRoleSection.mockReturnValue(
        buildDefaultHookReturn({ selectedRole: 'COMERCIO' as UserRole }),
      )
      const { getByText } = render(
        <RegisterRoleSection onContinue={onContinue} onSwitchToLogin={jest.fn()} />,
      )

      // Act
      fireEvent.press(getByText('Continuar'))

      // Assert
      expect(onContinue).toHaveBeenCalledWith('COMERCIO')
    })

    it('should not call onContinue when continue is pressed with no role selected', () => {
      // Arrange
      const onContinue = jest.fn()
      mockUseRegisterRoleSection.mockReturnValue(
        buildDefaultHookReturn({ selectedRole: null }),
      )
      const { getByText } = render(
        <RegisterRoleSection onContinue={onContinue} onSwitchToLogin={jest.fn()} />,
      )

      // Act
      fireEvent.press(getByText('Continuar'))

      // Assert — button is disabled so press does not fire, and guard in onPress also prevents it
      expect(onContinue).not.toHaveBeenCalled()
    })
  })

  describe('switch to login', () => {
    it('should call onSwitchToLogin when the Iniciar sesión link is pressed', () => {
      // Arrange
      const onSwitchToLogin = jest.fn()
      const { getByText } = render(
        <RegisterRoleSection onContinue={jest.fn()} onSwitchToLogin={onSwitchToLogin} />,
      )

      // Act
      fireEvent.press(getByText('Iniciar sesión'))

      // Assert
      expect(onSwitchToLogin).toHaveBeenCalledTimes(1)
    })
  })
})
