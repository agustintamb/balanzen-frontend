import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import TabBar from '../index'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ bottom: 0, top: 0, left: 0, right: 0 }),
}))

// Mock sub-components so TabBar routing logic can be tested in isolation
jest.mock('../FeaturedTab', () => {
  const { Pressable, Text } = require('react-native')
  const MockFeaturedTab = ({
    testID,
    onPress,
    config,
    isFocused,
  }: {
    testID: string
    onPress: () => void
    config: { label: string; icon: string }
    isFocused: boolean
  }) => (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityLabel={`featured-${config.label}`}
      accessibilityState={{ selected: isFocused }}
    >
      <Text>{config.label}</Text>
    </Pressable>
  )
  MockFeaturedTab.displayName = 'FeaturedTab'
  return MockFeaturedTab
})

jest.mock('../RegularTab', () => {
  const { Pressable, Text } = require('react-native')
  const MockRegularTab = ({
    testID,
    onPress,
    config,
    isFocused,
  }: {
    testID: string
    onPress: () => void
    config: { label: string; icon: string }
    isFocused: boolean
  }) => (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityLabel={`regular-${config.label}`}
      accessibilityState={{ selected: isFocused }}
    >
      <Text>{config.label}</Text>
    </Pressable>
  )
  MockRegularTab.displayName = 'RegularTab'
  return MockRegularTab
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

const buildNavigation = () => ({
  navigate: jest.fn(),
  emit: jest.fn().mockReturnValue({ defaultPrevented: false }),
  dispatch: jest.fn(),
  reset: jest.fn(),
  goBack: jest.fn(),
  isFocused: jest.fn(() => false),
  canGoBack: jest.fn(() => false),
  setParams: jest.fn(),
  setOptions: jest.fn(),
  addListener: jest.fn(() => () => {}),
  removeListener: jest.fn(),
  getParent: jest.fn(),
  getState: jest.fn(),
})

type RouteStub = { key: string; name: string }

const buildState = (routes: RouteStub[], activeIndex = 0) => ({
  routes: routes.map((r) => ({ ...r, params: undefined })),
  index: activeIndex,
  key: 'tab-state',
  routeNames: routes.map((r) => r.name),
  history: [],
  stale: false as const,
  type: 'tab' as const,
})

const CONSUMER_ROUTES: RouteStub[] = [
  { key: 'home-1', name: 'home' },
  { key: 'orders-1', name: 'orders' },
  { key: 'profile-1', name: 'profile' },
]

const COMMERCE_ROUTES: RouteStub[] = [
  { key: 'home-1', name: 'home' },
  { key: 'publications-1', name: 'publications' },
  { key: 'profile-1', name: 'profile' },
]

const buildTabBarProps = (
  routes: RouteStub[] = CONSUMER_ROUTES,
  activeIndex = 0,
  navigationOverrides = {},
): BottomTabBarProps => {
  const navigation = { ...buildNavigation(), ...navigationOverrides }
  return {
    state: buildState(routes, activeIndex),
    navigation: navigation as unknown as BottomTabBarProps['navigation'],
    descriptors: {} as BottomTabBarProps['descriptors'],
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('TabBar', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('tab rendering', () => {
    it('should render a pressable for each route', () => {
      // Arrange / Act
      const { getByTestId } = render(<TabBar {...buildTabBarProps()} />)
      // Assert
      expect(getByTestId('tab-home')).toBeTruthy()
      expect(getByTestId('tab-orders')).toBeTruthy()
      expect(getByTestId('tab-profile')).toBeTruthy()
    })

    it('should render RegularTab for home and profile routes', () => {
      // Arrange / Act
      const { getByTestId } = render(<TabBar {...buildTabBarProps()} />)
      // Assert — MockRegularTab sets accessibilityLabel 'regular-<label>'
      expect(getByTestId('tab-home').props.accessibilityLabel).toBe('regular-Inicio')
      expect(getByTestId('tab-profile').props.accessibilityLabel).toBe('regular-Perfil')
    })

    it('should render FeaturedTab for the orders route', () => {
      // Arrange / Act
      const { getByTestId } = render(<TabBar {...buildTabBarProps()} />)
      // Assert — MockFeaturedTab sets accessibilityLabel 'featured-<label>'
      expect(getByTestId('tab-orders').props.accessibilityLabel).toBe('featured-Mis pedidos')
    })

    it('should render FeaturedTab for the publications route', () => {
      // Arrange / Act
      const { getByTestId } = render(<TabBar {...buildTabBarProps(COMMERCE_ROUTES)} />)
      // Assert
      expect(getByTestId('tab-publications').props.accessibilityLabel).toBe('featured-Publicar')
    })

    it('should skip routes that have no config entry', () => {
      // Arrange
      const routes: RouteStub[] = [
        { key: 'home-1', name: 'home' },
        { key: 'unknown-1', name: 'unknown-route' },
      ]
      // Act
      const { getByTestId, queryByTestId } = render(<TabBar {...buildTabBarProps(routes)} />)
      // Assert — known route renders, unknown route is skipped
      expect(getByTestId('tab-home')).toBeTruthy()
      expect(queryByTestId('tab-unknown-route')).toBeNull()
    })
  })

  describe('active state', () => {
    it('should mark the active tab as selected via accessibilityState', () => {
      // Arrange — home is active (index 0)
      const { getByTestId } = render(<TabBar {...buildTabBarProps(CONSUMER_ROUTES, 0)} />)
      // Assert
      expect(getByTestId('tab-home').props.accessibilityState?.selected).toBe(true)
      expect(getByTestId('tab-orders').props.accessibilityState?.selected).toBe(false)
      expect(getByTestId('tab-profile').props.accessibilityState?.selected).toBe(false)
    })

    it('should mark the orders tab as selected when index is 1', () => {
      // Arrange
      const { getByTestId } = render(<TabBar {...buildTabBarProps(CONSUMER_ROUTES, 1)} />)
      // Assert
      expect(getByTestId('tab-home').props.accessibilityState?.selected).toBe(false)
      expect(getByTestId('tab-orders').props.accessibilityState?.selected).toBe(true)
    })
  })

  describe('navigation on press', () => {
    it('should emit a tabPress event when an inactive tab is pressed', () => {
      // Arrange — home is active, pressing orders
      const navigate = jest.fn()
      const emit = jest.fn().mockReturnValue({ defaultPrevented: false })
      const props = buildTabBarProps(CONSUMER_ROUTES, 0, { navigate, emit })
      const { getByTestId } = render(<TabBar {...props} />)
      // Act
      fireEvent.press(getByTestId('tab-orders'))
      // Assert
      expect(emit).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'tabPress', target: 'orders-1' }),
      )
    })

    it('should call navigation.navigate when an inactive tab is pressed', () => {
      // Arrange — home is active, pressing orders
      const navigate = jest.fn()
      const emit = jest.fn().mockReturnValue({ defaultPrevented: false })
      const props = buildTabBarProps(CONSUMER_ROUTES, 0, { navigate, emit })
      const { getByTestId } = render(<TabBar {...props} />)
      // Act
      fireEvent.press(getByTestId('tab-orders'))
      // Assert
      expect(navigate).toHaveBeenCalledWith('orders', undefined)
    })

    it('should NOT call navigation.navigate when the active tab is pressed', () => {
      // Arrange — home is active (index 0), pressing home again
      const navigate = jest.fn()
      const emit = jest.fn().mockReturnValue({ defaultPrevented: false })
      const props = buildTabBarProps(CONSUMER_ROUTES, 0, { navigate, emit })
      const { getByTestId } = render(<TabBar {...props} />)
      // Act
      fireEvent.press(getByTestId('tab-home'))
      // Assert — emit fires but navigate does not
      expect(emit).toHaveBeenCalled()
      expect(navigate).not.toHaveBeenCalled()
    })

    it('should NOT call navigation.navigate when the event is prevented', () => {
      // Arrange
      const navigate = jest.fn()
      const emit = jest.fn().mockReturnValue({ defaultPrevented: true })
      const props = buildTabBarProps(CONSUMER_ROUTES, 0, { navigate, emit })
      const { getByTestId } = render(<TabBar {...props} />)
      // Act
      fireEvent.press(getByTestId('tab-orders'))
      // Assert
      expect(emit).toHaveBeenCalled()
      expect(navigate).not.toHaveBeenCalled()
    })
  })
})
