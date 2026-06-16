import { fireEvent, render } from "@testing-library/react-native";
import ExpiryDateField from "../ExpiryDateField";

jest.mock("@react-native-community/datetimepicker", () => {
  const { View, TouchableOpacity } = require("react-native");
  return function MockDateTimePicker({ onChange }: any) {
    return (
      <>
        <TouchableOpacity
          testID="date-picker"
          onPress={() => onChange({ type: "set" }, new Date("2026-12-31"))}
        >
          <View />
        </TouchableOpacity>
        <TouchableOpacity
          testID="date-picker-dismiss"
          onPress={() => onChange({ type: "dismissed" }, undefined)}
        >
          <View />
        </TouchableOpacity>
      </>
    );
  };
});

jest.mock("@/components/ui/Icon", () => {
  const { View } = require("react-native");
  return () => <View testID="icon-calendar" />;
});

jest.mock("@/utils/cn", () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(" "),
}));

describe("ExpiryDateField", () => {
  it("renders placeholder text when value is null", () => {
    const { getByText } = render(
      <ExpiryDateField value={null} onChange={jest.fn()} />,
    );
    expect(getByText("Fecha de vencimiento")).toBeTruthy();
  });

  it("renders formatted date when value is provided", () => {
    const date = new Date(2026, 5, 15);
    const { getByText } = render(
      <ExpiryDateField value={date} onChange={jest.fn()} />,
    );
    expect(getByText("15/06/2026")).toBeTruthy();
  });

  it("opens the date picker when the field is pressed", () => {
    const { getByTestId, queryByTestId } = render(
      <ExpiryDateField value={null} onChange={jest.fn()} />,
    );
    expect(queryByTestId("date-picker")).toBeNull();
    fireEvent.press(getByTestId("expiry-date-field"));
    expect(getByTestId("date-picker")).toBeTruthy();
  });

  it("calls onChange with the selected date when set event fires", () => {
    const onChange = jest.fn();
    const { getByTestId } = render(
      <ExpiryDateField value={null} onChange={onChange} />,
    );
    fireEvent.press(getByTestId("expiry-date-field"));
    fireEvent.press(getByTestId("date-picker"));
    expect(onChange).toHaveBeenCalledWith(new Date("2026-12-31"));
  });

  it("hides the picker after a date is selected", () => {
    const { getByTestId, queryByTestId } = render(
      <ExpiryDateField value={null} onChange={jest.fn()} />,
    );
    fireEvent.press(getByTestId("expiry-date-field"));
    expect(getByTestId("date-picker")).toBeTruthy();
    fireEvent.press(getByTestId("date-picker"));
    expect(queryByTestId("date-picker")).toBeNull();
  });

  it("does not call onChange when the picker is dismissed", () => {
    const onChange = jest.fn();
    const { getByTestId, queryByTestId } = render(
      <ExpiryDateField value={null} onChange={onChange} />,
    );
    fireEvent.press(getByTestId("expiry-date-field"));
    fireEvent.press(getByTestId("date-picker-dismiss"));
    expect(onChange).not.toHaveBeenCalled();
    expect(queryByTestId("date-picker")).toBeNull();
  });
});
