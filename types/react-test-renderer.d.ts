declare module "react-test-renderer" {
  export function act(callback: () => void | Promise<void>): void;
  export function create(element: import("react").ReactElement): unknown;
}
