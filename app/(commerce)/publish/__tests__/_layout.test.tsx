import PublishLayout from "../_layout";
import { render } from "@testing-library/react-native";

jest.mock("expo-router", () => ({
  Stack: () => null,
}));

describe("publish/_layout", () => {
  it("renders without crashing", () => {
    expect(() => render(<PublishLayout />)).not.toThrow();
  });

  it("is a default export", () => {
    expect(typeof PublishLayout).toBe("function");
  });
});
