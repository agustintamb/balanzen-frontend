import { render } from "@testing-library/react-native";
import { useForm } from "react-hook-form";
import Step2Price from "../Step2Price";
import type { PublishFormValues } from "@/lib/commerce/publish/types";

jest.mock("expo-image", () => ({
  Image: ({ source }: any) => {
    const { View } = require("react-native");
    return <View testID={`img-${source?.uri}`} />;
  },
}));
jest.mock("@/components/ui/Icon", () => {
  const { View } = require("react-native");
  return ({ name }: any) => <View testID={`icon-${name}`} />;
});
jest.mock("@/components/ui/Input", () => {
  const { TextInput } = require("react-native");
  return ({ testID, value, onChangeText, placeholder, error }: any) => (
    <TextInput
      testID={testID ?? placeholder}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
    />
  );
});
jest.mock("@/utils/cn", () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(" "),
}));
jest.mock("@/lib/commerce/publish/constants", () => ({ MAX_PHOTOS: 3 }));

jest.mock("../DonationCard", () => {
  const { View } = require("react-native");
  return ({ value, onChange }: any) => <View testID="donation-card" />;
});

interface WrapperProps {
  isDonation?: boolean;
  onToggleDonation?: (value: boolean) => void;
  onChangeFinalPrice?: (text: string) => void;
  onChangeOriginalPrice?: (text: string) => void;
}

const Wrapper = ({
  isDonation = false,
  onToggleDonation = jest.fn(),
  onChangeFinalPrice = jest.fn(),
  onChangeOriginalPrice = jest.fn(),
}: WrapperProps) => {
  const { control } = useForm<PublishFormValues>({
    defaultValues: {
      title: "",
      description: "",
      expiry_date: null,
      category_id: "",
      is_donation: false,
      final_price: "",
      original_price: "",
    },
  });
  return (
    <Step2Price
      control={control}
      isDonation={isDonation}
      onToggleDonation={onToggleDonation}
      onChangeFinalPrice={onChangeFinalPrice}
      onChangeOriginalPrice={onChangeOriginalPrice}
    />
  );
};

describe("Step2Price", () => {
  it("renders DonationCard", () => {
    const { getByTestId } = render(<Wrapper />);
    expect(getByTestId("donation-card")).toBeTruthy();
  });

  it("shows price inputs when isDonation is false", () => {
    const { getByTestId } = render(<Wrapper isDonation={false} />);
    expect(getByTestId("input-final-price")).toBeTruthy();
    expect(getByTestId("input-original-price")).toBeTruthy();
  });

  it("hides price inputs when isDonation is true", () => {
    const { queryByTestId } = render(<Wrapper isDonation={true} />);
    expect(queryByTestId("input-final-price")).toBeNull();
    expect(queryByTestId("input-original-price")).toBeNull();
  });

  it("renders the info notice text about visible publication", () => {
    const { getByText } = render(<Wrapper />);
    expect(
      getByText(
        "Tu publicación será visible para usuarios cercanos. Podés editarla o eliminarla desde tu panel en cualquier momento.",
      ),
    ).toBeTruthy();
  });
});
