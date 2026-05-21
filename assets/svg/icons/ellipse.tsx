import Svg, { Circle } from 'react-native-svg'
import React from 'react'

type EllipseIconProps = {
  strokeColor?: string
  fillColor?: string
  strokeWidth?: number
  size?: number
}

const EllipseIcon: React.FC<EllipseIconProps> = ({
  strokeColor = '#4955EC',
  fillColor = 'white',
  strokeWidth = 4,
  size = 16,
}) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <Circle cx="8" cy="8" r="6" fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />
  </Svg>
)

export default EllipseIcon
