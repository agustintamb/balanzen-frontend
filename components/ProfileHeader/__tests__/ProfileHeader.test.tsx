import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import ProfileHeader from "../index";

jest.mock("@expo/vector-icons", () => ({ Feather: () => null }));

const BASE_PROPS = {
  displayName: "Juan Pérez",
  email: "juan@example.com",
  initials: "JP",
};

describe("ProfileHeader", () => {
  describe("rendering", () => {
    it("renders the display name", () => {
      const { getByText } = render(<ProfileHeader {...BASE_PROPS} />);
      expect(getByText("Juan Pérez")).toBeTruthy();
    });

    it("renders the email", () => {
      const { getByText } = render(<ProfileHeader {...BASE_PROPS} />);
      expect(getByText("juan@example.com")).toBeTruthy();
    });

    it("renders the address when provided", () => {
      const { getByText } = render(
        <ProfileHeader
          {...BASE_PROPS}
          addressShort="Av. Corrientes 1234, CABA"
        />,
      );
      expect(getByText("Av. Corrientes 1234, CABA")).toBeTruthy();
    });

    it("does not render the address section when addressShort is undefined", () => {
      const { queryByText } = render(<ProfileHeader {...BASE_PROPS} />);
      expect(queryByText("Av. Corrientes")).toBeNull();
    });

    it("does not render the address section when addressShort is empty string", () => {
      const { UNSAFE_getAllByType } = render(
        <ProfileHeader {...BASE_PROPS} addressShort="" />,
      );
      const { View } = require("react-native");
      const mapPinRows = UNSAFE_getAllByType(View).filter(
        (v: { props: { className?: string } }) =>
          v.props.className?.includes("flex-row items-start gap-1"),
      );
      expect(mapPinRows).toHaveLength(0);
    });

    it("forwards testID to the outer container", () => {
      const { getByTestId } = render(
        <ProfileHeader {...BASE_PROPS} testID="profile-header" />,
      );
      expect(getByTestId("profile-header")).toBeTruthy();
    });
  });

  describe("photo viewer", () => {
    it("does not render the modal when photoFullUrl is not provided", () => {
      const { queryByTestId } = render(<ProfileHeader {...BASE_PROPS} />);
      expect(queryByTestId("photo-viewer-backdrop")).toBeNull();
    });

    it("opens the photo viewer when avatar is pressed and photoFullUrl is set", () => {
      const { getByTestId } = render(
        <ProfileHeader
          {...BASE_PROPS}
          photoUrl="https://example.com/thumb.jpg"
          photoFullUrl="https://example.com/full.jpg"
        />,
      );
      fireEvent.press(getByTestId("profile-avatar"));
      expect(getByTestId("photo-viewer-backdrop")).toBeTruthy();
    });

    it("closes the photo viewer when the backdrop is pressed", () => {
      const { getByTestId, queryByTestId } = render(
        <ProfileHeader
          {...BASE_PROPS}
          photoUrl="https://example.com/thumb.jpg"
          photoFullUrl="https://example.com/full.jpg"
        />,
      );
      fireEvent.press(getByTestId("profile-avatar"));
      fireEvent.press(getByTestId("photo-viewer-backdrop"));
      expect(queryByTestId("photo-viewer-backdrop")).toBeNull();
    });

    it("closes the photo viewer via onRequestClose (hardware back)", () => {
      const { getByTestId, queryByTestId, UNSAFE_getByType } = render(
        <ProfileHeader
          {...BASE_PROPS}
          photoUrl="https://example.com/thumb.jpg"
          photoFullUrl="https://example.com/full.jpg"
        />,
      );
      fireEvent.press(getByTestId("profile-avatar"));
      const { Modal } = require("react-native");
      fireEvent(UNSAFE_getByType(Modal), "requestClose");
      expect(queryByTestId("photo-viewer-backdrop")).toBeNull();
    });
  });
});
