import React from "react";
import { render } from "@testing-library/react-native";
import { useAuthStore } from "@/stores/auth.store";
import Index from "../index";

jest.mock("expo-router", () => ({
  Redirect: ({ href }: { href: string }) => {
    const { Text } = require("react-native");
    return <Text testID={`redirect-${href}`}>{href}</Text>;
  },
}));

jest.mock("@/stores/auth.store", () => ({
  useAuthStore: jest.fn(),
}));

const CONSUMER_USER = {
  id: "u1",
  first_name: "Ana",
  last_name: "Pérez",
  email: "ana@example.com",
  role: "CONSUMIDOR",
  has_address: true,
  has_selected_address: true,
};

const COMMERCE_USER = {
  ...CONSUMER_USER,
  role: "COMERCIO",
};

const setup = (user: any, isInitialized = true) => {
  (useAuthStore as unknown as jest.Mock).mockReturnValue({
    user,
    isInitialized,
  });
};

describe("app/index.tsx redirect logic", () => {
  it("renders nothing when not initialized", () => {
    setup(null, false);
    const { toJSON } = render(<Index />);
    expect(toJSON()).toBeNull();
  });

  it("redirects to /(auth) when user is null", () => {
    setup(null);
    const { getByTestId } = render(<Index />);
    expect(getByTestId("redirect-/(auth)")).toBeTruthy();
  });

  it("redirects to /(onboarding)/address when has_address is false", () => {
    setup({ ...CONSUMER_USER, has_address: false });
    const { getByTestId } = render(<Index />);
    expect(getByTestId("redirect-/(onboarding)/address")).toBeTruthy();
  });

  it("redirects to /(onboarding)/address when has_selected_address is false", () => {
    setup({ ...CONSUMER_USER, has_selected_address: false });
    const { getByTestId } = render(<Index />);
    expect(getByTestId("redirect-/(onboarding)/address")).toBeTruthy();
  });

  it("redirects CONSUMIDOR to /(consumer)/home", () => {
    setup(CONSUMER_USER);
    const { getByTestId } = render(<Index />);
    expect(getByTestId("redirect-/(consumer)/home")).toBeTruthy();
  });

  it("redirects COMERCIO to /(commerce)/home", () => {
    setup(COMMERCE_USER);
    const { getByTestId } = render(<Index />);
    expect(getByTestId("redirect-/(commerce)/home")).toBeTruthy();
  });
});
