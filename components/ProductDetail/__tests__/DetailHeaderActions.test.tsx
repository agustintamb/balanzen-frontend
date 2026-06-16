import { fireEvent, render } from "@testing-library/react-native";
import DetailHeaderActions from "../DetailHeaderActions";

describe("DetailHeaderActions", () => {
  it("renders the favorite and share buttons and wires them", () => {
    const onToggleFavorite = jest.fn();
    const onShare = jest.fn();
    const { getByTestId } = render(
      <DetailHeaderActions
        isFavorite={false}
        onToggleFavorite={onToggleFavorite}
        onShare={onShare}
      />,
    );
    fireEvent.press(getByTestId("btn-favorite"));
    expect(onToggleFavorite).toHaveBeenCalled();
    fireEvent.press(getByTestId("btn-share"));
    expect(onShare).toHaveBeenCalled();
  });

  it("renders the filled state when favorited", () => {
    const { getByTestId } = render(
      <DetailHeaderActions
        isFavorite
        onToggleFavorite={jest.fn()}
        onShare={jest.fn()}
      />,
    );
    expect(getByTestId("btn-favorite")).toBeTruthy();
  });
});
