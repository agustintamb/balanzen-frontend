import React from 'react'
import { render } from '@testing-library/react-native'
import CheckIcon from '../check'

// Mock react-native-svg before importing CheckIcon
jest.mock('react-native-svg', () => {
  const React = require('react')
  const { View: RNView } = require('react-native')

  const Svg = ({ children, testID, ...props }: any) => (
    <RNView testID={testID || 'svg'} {...props}>
      {children}
    </RNView>
  )

  const Path = (props: any) => <RNView testID="path" {...props} />

  return {
    __esModule: true,
    default: Svg,
    Svg,
    Path,
  }
})

describe('CheckIcon', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Default props', () => {
    it('should render with default props', () => {
      const { getByTestId } = render(<CheckIcon />)

      const svg = getByTestId('svg')
      expect(svg).toBeTruthy()
    })

    it('should use default strokeColor (white)', () => {
      const { getByTestId } = render(<CheckIcon />)

      const path = getByTestId('path')
      expect(path.props.stroke).toBe('white')
    })

    it('should use default strokeWidth (2)', () => {
      const { getByTestId } = render(<CheckIcon />)

      const path = getByTestId('path')
      expect(path.props.strokeWidth).toBe(2)
    })

    it('should use default size (17)', () => {
      const { getByTestId } = render(<CheckIcon />)

      const svg = getByTestId('svg')
      expect(svg.props.width).toBe(17)
      expect(svg.props.height).toBe(17)
    })

    it('should have correct viewBox', () => {
      const { getByTestId } = render(<CheckIcon />)

      const svg = getByTestId('svg')
      expect(svg.props.viewBox).toBe('0 0 17 17')
    })

    it('should have fill="none"', () => {
      const { getByTestId } = render(<CheckIcon />)

      const svg = getByTestId('svg')
      expect(svg.props.fill).toBe('none')
    })
  })

  describe('Custom props', () => {
    it('should accept custom strokeColor', () => {
      const { getByTestId } = render(<CheckIcon strokeColor="#FF0000" />)

      const path = getByTestId('path')
      expect(path.props.stroke).toBe('#FF0000')
    })

    it('should accept custom strokeWidth', () => {
      const { getByTestId } = render(<CheckIcon strokeWidth={3} />)

      const path = getByTestId('path')
      expect(path.props.strokeWidth).toBe(3)
    })

    it('should accept custom size', () => {
      const { getByTestId } = render(<CheckIcon size={24} />)

      const svg = getByTestId('svg')
      expect(svg.props.width).toBe(24)
      expect(svg.props.height).toBe(24)
    })

    it('should accept all custom props together', () => {
      const { getByTestId } = render(
        <CheckIcon strokeColor="#00FF00" strokeWidth={4} size={32} />,
      )

      const svg = getByTestId('svg')
      const path = getByTestId('path')

      expect(svg.props.width).toBe(32)
      expect(svg.props.height).toBe(32)
      expect(path.props.stroke).toBe('#00FF00')
      expect(path.props.strokeWidth).toBe(4)
    })
  })

  describe('Path properties', () => {
    it('should have correct path data', () => {
      const { getByTestId } = render(<CheckIcon />)

      const path = getByTestId('path')
      expect(path.props.d).toBe('M14 4.20001L6.3 11.9L2.8 8.40001')
    })

    it('should have strokeLinecap="round"', () => {
      const { getByTestId } = render(<CheckIcon />)

      const path = getByTestId('path')
      expect(path.props.strokeLinecap).toBe('round')
    })

    it('should have strokeLinejoin="round"', () => {
      const { getByTestId } = render(<CheckIcon />)

      const path = getByTestId('path')
      expect(path.props.strokeLinejoin).toBe('round')
    })
  })

  describe('Edge cases', () => {
    it('should handle size of 0', () => {
      const { getByTestId } = render(<CheckIcon size={0} />)

      const svg = getByTestId('svg')
      expect(svg.props.width).toBe(0)
      expect(svg.props.height).toBe(0)
    })

    it('should handle very large size', () => {
      const { getByTestId } = render(<CheckIcon size={1000} />)

      const svg = getByTestId('svg')
      expect(svg.props.width).toBe(1000)
      expect(svg.props.height).toBe(1000)
    })

    it('should handle strokeWidth of 0', () => {
      const { getByTestId } = render(<CheckIcon strokeWidth={0} />)

      const path = getByTestId('path')
      expect(path.props.strokeWidth).toBe(0)
    })

    it('should handle empty string strokeColor', () => {
      const { getByTestId } = render(<CheckIcon strokeColor="" />)

      const path = getByTestId('path')
      expect(path.props.stroke).toBe('')
    })

    it('should handle different color formats', () => {
      const { getByTestId } = render(<CheckIcon strokeColor="rgb(255, 0, 0)" />)

      const path = getByTestId('path')
      expect(path.props.stroke).toBe('rgb(255, 0, 0)')
    })
  })
})
