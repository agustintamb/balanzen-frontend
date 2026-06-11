import React from "react";
import Svg, { Path } from "react-native-svg";

type CheckIconProps = {
  strokeColor?: string;
  strokeWidth?: number;
  size?: number;
};

const CheckIcon: React.FC<CheckIconProps> = ({
  strokeColor = "white",
  strokeWidth = 2,
  size = 17,
}) => (
  <Svg width={size} height={size} viewBox="0 0 17 17" fill="none">
    <Path
      d="M14 4.20001L6.3 11.9L2.8 8.40001"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default CheckIcon;
