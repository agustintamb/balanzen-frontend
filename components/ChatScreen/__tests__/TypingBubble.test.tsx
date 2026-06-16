import { render } from "@testing-library/react-native";
import TypingBubble from "../TypingBubble";

describe("TypingBubble", () => {
  it("renders the typing-bubble container", () => {
    const { getByTestId } = render(<TypingBubble />);
    expect(getByTestId("typing-bubble")).toBeTruthy();
  });

  it("matches snapshot", () => {
    const { toJSON } = render(<TypingBubble />);
    expect(toJSON()).toMatchSnapshot();
  });
});
