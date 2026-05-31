import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import RoleCard, { type RoleOption } from '../index'

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

const buildRoleOption = (overrides: Partial<RoleOption> = {}): RoleOption => ({
  id: 'CONSUMIDOR',
  iconName: 'user',
  title: 'Soy consumidor',
  description: 'Explorá alimentos frescos a precios increíbles.',
  benefits: ['Ofertas cercanas', 'Hasta 70% off', 'Sin desperdicio'],
  ...overrides,
})

const DEFAULT_PROPS = {
  role: buildRoleOption(),
  selected: false,
  onPress: jest.fn(),
}

afterEach(() => {
  jest.clearAllMocks()
})

describe('RoleCard', () => {
  describe('content rendering', () => {
    it('should render the role title', () => {
      // Arrange
      const role = buildRoleOption({ title: 'Soy consumidor' })

      // Act
      const { getByText } = render(
        <RoleCard role={role} selected={false} onPress={jest.fn()} />,
      )

      // Assert
      expect(getByText('Soy consumidor')).toBeTruthy()
    })

    it('should render the role description', () => {
      // Arrange
      const role = buildRoleOption({ description: 'Explorá alimentos frescos a precios increíbles.' })

      // Act
      const { getByText } = render(
        <RoleCard role={role} selected={false} onPress={jest.fn()} />,
      )

      // Assert
      expect(getByText('Explorá alimentos frescos a precios increíbles.')).toBeTruthy()
    })

    it('should render the role icon', () => {
      // Arrange
      const role = buildRoleOption({ iconName: 'user' })

      // Act
      const { getByTestId } = render(
        <RoleCard role={role} selected={false} onPress={jest.fn()} />,
      )

      // Assert
      expect(getByTestId('icon-user')).toBeTruthy()
    })

    it('should render all benefit chips', () => {
      // Arrange
      const role = buildRoleOption({ benefits: ['Ofertas cercanas', 'Hasta 70% off', 'Sin desperdicio'] })

      // Act
      const { getByText } = render(
        <RoleCard role={role} selected={false} onPress={jest.fn()} />,
      )

      // Assert
      expect(getByText('Ofertas cercanas')).toBeTruthy()
      expect(getByText('Hasta 70% off')).toBeTruthy()
      expect(getByText('Sin desperdicio')).toBeTruthy()
    })

    it('should render commerce role title and description', () => {
      // Arrange
      const role = buildRoleOption({
        id: 'COMERCIO',
        title: 'Soy comercio',
        description: 'Publicá excedentes y reducí las pérdidas del negocio.',
        iconName: 'shopping-bag',
        benefits: ['Menos pérdidas', 'Más clientes', 'Impacto positivo'],
      })

      // Act
      const { getByText } = render(
        <RoleCard role={role} selected={false} onPress={jest.fn()} />,
      )

      // Assert
      expect(getByText('Soy comercio')).toBeTruthy()
      expect(getByText('Publicá excedentes y reducí las pérdidas del negocio.')).toBeTruthy()
    })
  })

  describe('press interaction', () => {
    it('should call onPress when the card is pressed', () => {
      // Arrange
      const onPress = jest.fn()
      const { getByText } = render(
        <RoleCard role={DEFAULT_PROPS.role} selected={false} onPress={onPress} />,
      )

      // Act
      fireEvent.press(getByText('Soy consumidor'))

      // Assert
      expect(onPress).toHaveBeenCalledTimes(1)
    })

    it('should call onPress each time the card is pressed', () => {
      // Arrange
      const onPress = jest.fn()
      const { getByText } = render(
        <RoleCard role={DEFAULT_PROPS.role} selected={false} onPress={onPress} />,
      )

      // Act
      fireEvent.press(getByText('Soy consumidor'))
      fireEvent.press(getByText('Soy consumidor'))

      // Assert
      expect(onPress).toHaveBeenCalledTimes(2)
    })
  })

  describe('selected state', () => {
    it('should apply selected border class when selected is true', () => {
      // Arrange & Act
      const { UNSAFE_getByType } = render(
        <RoleCard role={DEFAULT_PROPS.role} selected={true} onPress={jest.fn()} />,
      )
      const { TouchableOpacity } = require('react-native')

      // Assert — selected card gets primary border
      const touchable = UNSAFE_getByType(TouchableOpacity)
      expect(touchable.props.className).toContain('border-primary')
    })

    it('should apply unselected border class when selected is false', () => {
      // Arrange & Act
      const { UNSAFE_getByType } = render(
        <RoleCard role={DEFAULT_PROPS.role} selected={false} onPress={jest.fn()} />,
      )
      const { TouchableOpacity } = require('react-native')

      // Assert — unselected card gets gray border
      const touchable = UNSAFE_getByType(TouchableOpacity)
      expect(touchable.props.className).toContain('border-gray-200')
    })

    it('should render checkmark icon regardless of selected state', () => {
      // Arrange & Act
      const { getByTestId } = render(
        <RoleCard role={DEFAULT_PROPS.role} selected={true} onPress={jest.fn()} />,
      )

      // Assert — checkmark-circle icon is always rendered (opacity controlled via style)
      expect(getByTestId('icon-check-circle')).toBeTruthy()
    })

    it('should have opacity 1 on checkmark when selected is true', () => {
      // Arrange
      const { UNSAFE_getAllByType } = render(
        <RoleCard role={DEFAULT_PROPS.role} selected={true} onPress={jest.fn()} />,
      )
      const { View } = require('react-native')

      // Act — find the View wrapping the checkmark (has inline opacity style)
      const views = UNSAFE_getAllByType(View)
      const checkmarkWrapper = views.find(
        (v: { props: { style?: { opacity?: number } } }) => v.props.style?.opacity === 1,
      )

      // Assert
      expect(checkmarkWrapper).toBeTruthy()
    })

    it('should have opacity 0 on checkmark when selected is false', () => {
      // Arrange
      const { UNSAFE_getAllByType } = render(
        <RoleCard role={DEFAULT_PROPS.role} selected={false} onPress={jest.fn()} />,
      )
      const { View } = require('react-native')

      // Act — find the View wrapping the checkmark (has inline opacity style)
      const views = UNSAFE_getAllByType(View)
      const checkmarkWrapper = views.find(
        (v: { props: { style?: { opacity?: number } } }) => v.props.style?.opacity === 0,
      )

      // Assert
      expect(checkmarkWrapper).toBeTruthy()
    })
  })
})
