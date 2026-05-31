declare module "react-native-svg" {
  import type { Component, ReactNode } from "react";

  interface CommonProps {
    fill?: string;
    stroke?: string;
    strokeWidth?: number | string;
    strokeLinecap?: "butt" | "round" | "square";
    strokeLinejoin?: "miter" | "round" | "bevel";
    width?: number | string;
    height?: number | string;
    viewBox?: string;
  }

  interface PathProps extends CommonProps {
    d?: string;
  }

  export class Svg extends Component<CommonProps & { children?: ReactNode }> {}
  export class Path extends Component<PathProps> {}
  export class Circle extends Component<CommonProps & { cx?: number | string; cy?: number | string; r?: number | string }> {}
  export class Rect extends Component<CommonProps & { x?: number | string; y?: number | string }> {}
  export class G extends Component<CommonProps & { children?: ReactNode }> {}
  export class Defs extends Component<{ children?: ReactNode }> {}
  export class ClipPath extends Component<{ id?: string; children?: ReactNode }> {}

  export default Svg;
}
