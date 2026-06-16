import { Text } from "react-native";
import { render } from "@testing-library/react-native";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import RealtimeProvider from "../RealtimeProvider";

jest.mock("@/hooks/useRealtimeSync", () => ({ useRealtimeSync: jest.fn() }));

describe("RealtimeProvider", () => {
  it("calls useRealtimeSync and renders children", () => {
    const { getByText } = render(
      <RealtimeProvider>
        <Text>hijo</Text>
      </RealtimeProvider>,
    );
    expect(useRealtimeSync).toHaveBeenCalled();
    expect(getByText("hijo")).toBeTruthy();
  });
});
