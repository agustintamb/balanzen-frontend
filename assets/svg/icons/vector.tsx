import React from "react";
import Svg, { Path } from "react-native-svg";

type VectorIconProps = {
  strokeColor?: string;
  height?: number;
  strokeWidth?: number;
};

const VectorIcon: React.FC<VectorIconProps> = ({
  strokeColor = "#D0D5DD",
  height = 32,
  strokeWidth = 2,
}) => (
  <Svg width={2} height={height} viewBox={`0 0 2 ${height}`} fill="none">
    <Path d={`M1 0V${height}`} stroke={strokeColor} strokeWidth={strokeWidth} />
  </Svg>
);

export default VectorIcon;
