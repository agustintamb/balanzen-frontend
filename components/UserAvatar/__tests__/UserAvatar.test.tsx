import React from "react";
import { render } from "@testing-library/react-native";
import UserAvatar from "../index";

jest.mock("@expo/vector-icons", () => ({ Feather: () => null }));

describe("UserAvatar", () => {
  describe("with photo URL", () => {
    it("renders the avatar image", () => {
      const { getByTestId } = render(
        <UserAvatar photoUrl="https://example.com/photo.jpg" initials="JD" />,
      );
      expect(getByTestId("user-avatar-image")).toBeTruthy();
    });
  });

  describe("without photo URL", () => {
    it("renders the initials view", () => {
      const { getByTestId } = render(
        <UserAvatar photoUrl={null} initials="JD" />,
      );
      expect(getByTestId("user-avatar-initials")).toBeTruthy();
    });

    it("displays the initials text", () => {
      const { getByText } = render(
        <UserAvatar photoUrl={undefined} initials="AB" />,
      );
      expect(getByText("AB")).toBeTruthy();
    });
  });

  describe("loading state", () => {
    it("shows the loading overlay when isLoading is true", () => {
      const { getByTestId } = render(<UserAvatar initials="JD" isLoading />);
      expect(getByTestId("user-avatar-loading")).toBeTruthy();
    });

    it("does not show the loading overlay when isLoading is false", () => {
      const { queryByTestId } = render(
        <UserAvatar initials="JD" isLoading={false} />,
      );
      expect(queryByTestId("user-avatar-loading")).toBeNull();
    });
  });

  describe("editable state", () => {
    it("shows the edit button when editable is true and not loading", () => {
      const { getByTestId } = render(
        <UserAvatar initials="JD" editable isLoading={false} />,
      );
      expect(getByTestId("user-avatar-edit-btn")).toBeTruthy();
    });

    it("hides the edit button when isLoading is true", () => {
      const { queryByTestId } = render(
        <UserAvatar initials="JD" editable isLoading />,
      );
      expect(queryByTestId("user-avatar-edit-btn")).toBeNull();
    });

    it("hides the edit button when editable is false", () => {
      const { queryByTestId } = render(
        <UserAvatar initials="JD" editable={false} />,
      );
      expect(queryByTestId("user-avatar-edit-btn")).toBeNull();
    });
  });

  describe("testID prop", () => {
    it("forwards testID to the container", () => {
      const { getByTestId } = render(
        <UserAvatar initials="JD" testID="avatar-container" />,
      );
      expect(getByTestId("avatar-container")).toBeTruthy();
    });
  });
});
