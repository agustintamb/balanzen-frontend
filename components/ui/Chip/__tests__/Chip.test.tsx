import React from 'react'
import { render } from '@testing-library/react-native'

import Chip from '@/components/ui/Chip'

describe('Chip', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('label rendering', () => {
    it('should render the label text', () => {
      // Arrange / Act
      const { getByText } = render(<Chip label="Fresh deal" />)
      // Assert
      expect(getByText('Fresh deal')).toBeTruthy()
    })

    it('should render an empty string label without crashing', () => {
      // Arrange / Act
      const { queryByText } = render(<Chip label="" />)
      // Assert — empty text node exists but has no visible text
      expect(queryByText('Fresh deal')).toBeNull()
    })
  })

  describe('variant classes', () => {
    it('should apply primary color classes when variant is primary', () => {
      // Arrange / Act
      const { getByTestId } = render(
        <Chip label="Primary" variant="primary" testID="chip" />,
      )
      // Assert
      const container = getByTestId('chip')
      expect(container.props.className).toContain('bg-primary-light')
    })

    it('should apply warning color classes when variant is warning', () => {
      // Arrange / Act
      const { getByTestId } = render(
        <Chip label="Warning" variant="warning" testID="chip" />,
      )
      // Assert
      const container = getByTestId('chip')
      expect(container.props.className).toContain('bg-warning-light')
    })

    it('should apply error color classes when variant is error', () => {
      // Arrange / Act
      const { getByTestId } = render(
        <Chip label="Error" variant="error" testID="chip" />,
      )
      // Assert
      const container = getByTestId('chip')
      expect(container.props.className).toContain('bg-error-light')
    })

    it('should apply neutral/gray classes when variant is neutral', () => {
      // Arrange / Act
      const { getByTestId } = render(
        <Chip label="Neutral" variant="neutral" testID="chip" />,
      )
      // Assert
      const container = getByTestId('chip')
      expect(container.props.className).toContain('bg-gray-100')
    })

    it('should default to primary variant when no variant prop is provided', () => {
      // Arrange / Act
      const { getByTestId } = render(<Chip label="Default" testID="chip" />)
      // Assert
      const container = getByTestId('chip')
      expect(container.props.className).toContain('bg-primary-light')
    })
  })

  describe('size variants', () => {
    it('should render without errors when size is sm', () => {
      // Arrange / Act
      const { getByText } = render(<Chip label="Small" size="sm" />)
      // Assert
      expect(getByText('Small')).toBeTruthy()
    })

    it('should render without errors when size is md', () => {
      // Arrange / Act
      const { getByText } = render(<Chip label="Medium" size="md" />)
      // Assert
      expect(getByText('Medium')).toBeTruthy()
    })

    it('should render without errors when size is lg', () => {
      // Arrange / Act
      const { getByText } = render(<Chip label="Large" size="lg" />)
      // Assert
      expect(getByText('Large')).toBeTruthy()
    })

    it('should apply sm padding class when size is sm', () => {
      // Arrange / Act
      const { getByTestId } = render(
        <Chip label="Small" size="sm" testID="chip" />,
      )
      // Assert
      const container = getByTestId('chip')
      expect(container.props.className).toContain('px-2')
    })

    it('should apply lg padding class when size is lg', () => {
      // Arrange / Act
      const { getByTestId } = render(
        <Chip label="Large" size="lg" testID="chip" />,
      )
      // Assert
      const container = getByTestId('chip')
      expect(container.props.className).toContain('px-4')
    })
  })

  describe('dot indicator', () => {
    it('should render a dot indicator when showDot is true', () => {
      // Arrange / Act
      const { getByTestId } = render(
        <Chip label="With dot" showDot testID="chip" />,
      )
      // Assert — the container should have two children: dot View + Text
      const container = getByTestId('chip')
      expect(container.children.length).toBe(2)
    })

    it('should NOT render a dot indicator when showDot is false', () => {
      // Arrange / Act
      const { getByTestId } = render(
        <Chip label="No dot" showDot={false} testID="chip" />,
      )
      // Assert — the container should have only one child: the Text
      const container = getByTestId('chip')
      expect(container.children.length).toBe(1)
    })

    it('should NOT render a dot indicator when showDot is omitted (defaults to false)', () => {
      // Arrange / Act
      const { getByTestId } = render(<Chip label="Default dot" testID="chip" />)
      // Assert
      const container = getByTestId('chip')
      expect(container.children.length).toBe(1)
    })
  })

  describe('testID forwarding', () => {
    it('should forward testID to the root View', () => {
      // Arrange / Act
      const { getByTestId } = render(
        <Chip label="Testable" testID="my-chip" />,
      )
      // Assert
      expect(getByTestId('my-chip')).toBeTruthy()
    })

    it('should not throw when testID is omitted', () => {
      // Arrange / Act / Assert
      expect(() => render(<Chip label="No testID" />)).not.toThrow()
    })
  })

  describe('custom className', () => {
    it('should merge custom className into the container classes', () => {
      // Arrange / Act
      const { getByTestId } = render(
        <Chip label="Custom" className="mt-4" testID="chip" />,
      )
      // Assert
      const container = getByTestId('chip')
      expect(container.props.className).toContain('mt-4')
    })

    it('should still contain base container classes when a custom className is supplied', () => {
      // Arrange / Act
      const { getByTestId } = render(
        <Chip label="Custom" className="mt-4" testID="chip" />,
      )
      // Assert
      const container = getByTestId('chip')
      expect(container.props.className).toContain('rounded-full')
    })
  })
})
