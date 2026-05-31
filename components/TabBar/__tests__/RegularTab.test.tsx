import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import RegularTab from '../RegularTab'
import type { TabItemProps } from '../tabBar.utils'

jest.mock('@/components/ui/Icon', () => {
  const { View } = require('react-native')
  const MockIcon = ({ name, testID }: { name: string; testID?: string }) => (
    <View testID={testID ?? `icon-${name}`} />
  )
  return MockIcon
})

const buildProps = (overrides: Partial<TabItemProps> = {}): TabItemProps => ({
  config: { label: 'Inicio', icon: 'home' },
  isFocused: false,
  onPress: jest.fn(),
  testID: 'tab-home',
  ...overrides,
})

describe('RegularTab', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render the label text', () => {
      // Arrange / Act
      const { getByText } = render(<RegularTab {...buildProps()} />)
      // Assert
      expect(getByText('Inicio')).toBeTruthy()
    })

    it('should render the icon', () => {
      // Arrange / Act
      const { getByTestId } = render(<RegularTab {...buildProps()} />)
      // Assert
      expect(getByTestId('icon-home')).toBeTruthy()
    })

    it('should forward testID to the Pressable', () => {
      // Arrange / Act
      const { getByTestId } = render(<RegularTab {...buildProps({ testID: 'tab-profile' })} />)
      // Assert
      expect(getByTestId('tab-profile')).toBeTruthy()
    })

    it('should render different labels for different configs', () => {
      // Arrange / Act
      const { getByText } = render(
        <RegularTab {...buildProps({ config: { label: 'Perfil', icon: 'user' } })} />,
      )
      // Assert
      expect(getByText('Perfil')).toBeTruthy()
    })
  })

  describe('active dot indicator', () => {
    it('should render the active dot when focused', () => {
      // Arrange / Act
      const { UNSAFE_getAllByType } = render(<RegularTab {...buildProps({ isFocused: true })} />)
      const { View } = require('react-native')
      // Assert — the inner dot View has bg-primary class
      const views = UNSAFE_getAllByType(View)
      const activeDot = views.find(
        (v: { props: { className?: string } }) =>
          v.props.className?.includes('bg-primary') && v.props.className?.includes('rounded-full'),
      )
      expect(activeDot).toBeTruthy()
    })

    it('should NOT render the active dot when not focused', () => {
      // Arrange / Act
      const { UNSAFE_getAllByType } = render(<RegularTab {...buildProps({ isFocused: false })} />)
      const { View } = require('react-native')
      // Assert — no View with bg-primary class
      const views = UNSAFE_getAllByType(View)
      const activeDot = views.find(
        (v: { props: { className?: string } }) =>
          v.props.className?.includes('bg-primary') && v.props.className?.includes('rounded-full'),
      )
      expect(activeDot).toBeFalsy()
    })
  })

  describe('label color', () => {
    it('should apply primary text color when focused', () => {
      // Arrange / Act
      const { getByText } = render(<RegularTab {...buildProps({ isFocused: true })} />)
      // Assert
      expect(getByText('Inicio').props.className).toContain('text-primary')
    })

    it('should apply gray text color when not focused', () => {
      // Arrange / Act
      const { getByText } = render(<RegularTab {...buildProps({ isFocused: false })} />)
      // Assert
      expect(getByText('Inicio').props.className).toContain('text-gray-400')
    })
  })

  describe('press interaction', () => {
    it('should call onPress when pressed', () => {
      // Arrange
      const onPress = jest.fn()
      const { getByTestId } = render(<RegularTab {...buildProps({ onPress, testID: 'tab-home' })} />)
      // Act
      fireEvent.press(getByTestId('tab-home'))
      // Assert
      expect(onPress).toHaveBeenCalledTimes(1)
    })

    it('should call onPress each time the tab is pressed', () => {
      // Arrange
      const onPress = jest.fn()
      const { getByTestId } = render(<RegularTab {...buildProps({ onPress, testID: 'tab-home' })} />)
      // Act
      fireEvent.press(getByTestId('tab-home'))
      fireEvent.press(getByTestId('tab-home'))
      // Assert
      expect(onPress).toHaveBeenCalledTimes(2)
    })
  })
})
