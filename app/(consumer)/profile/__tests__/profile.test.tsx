import { fireEvent, render } from "@testing-library/react-native";
import ConsumerProfile from "../index";
import { useProfileScreen } from "../useProfileScreen";

jest.mock("../useProfileScreen", () => ({ useProfileScreen: jest.fn() }));
jest.mock("expo-status-bar", () => ({ StatusBar: () => null }));
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}));
jest.mock("@/components/ProfileHeader", () => {
  const { Text } = require("react-native");
  return ({ displayName }: any) => (
    <Text testID="profile-header">{displayName}</Text>
  );
});
jest.mock("@/components/ui/MenuItem", () => {
  const { TouchableOpacity, Text } = require("react-native");
  return ({ testID, onPress, children }: any) => (
    <TouchableOpacity testID={testID} onPress={onPress}>
      <Text>{children}</Text>
    </TouchableOpacity>
  );
});

const baseVM = {
  displayName: "Ana Pérez",
  email: "ana@example.com",
  initials: "AP",
  photoUrl: null,
  photoFullUrl: null,
  addressShort: undefined,
  unreadCount: 0,
  handleEditProfile: jest.fn(),
  handleAddresses: jest.fn(),
  handleChangePassword: jest.fn(),
  handleFavorites: jest.fn(),
  handleNotifications: jest.fn(),
  handleLogout: jest.fn(),
};

const mockHook = (overrides = {}) =>
  (useProfileScreen as jest.Mock).mockReturnValue({ ...baseVM, ...overrides });

beforeEach(() => {
  jest.clearAllMocks();
  mockHook();
});

describe("ConsumerProfile", () => {
  it("renders the display name in profile header", () => {
    const { getByTestId } = render(<ConsumerProfile />);
    expect(getByTestId("profile-header").props.children).toBe("Ana Pérez");
  });

  it("calls handleEditProfile when btn-edit-profile is pressed", () => {
    const handleEditProfile = jest.fn();
    mockHook({ handleEditProfile });
    const { getByTestId } = render(<ConsumerProfile />);
    fireEvent.press(getByTestId("btn-edit-profile"));
    expect(handleEditProfile).toHaveBeenCalledTimes(1);
  });

  it("calls handleLogout when btn-logout is pressed", () => {
    const handleLogout = jest.fn();
    mockHook({ handleLogout });
    const { getByTestId } = render(<ConsumerProfile />);
    fireEvent.press(getByTestId("btn-logout"));
    expect(handleLogout).toHaveBeenCalledTimes(1);
  });

  it("renders all menu items", () => {
    const { getByTestId } = render(<ConsumerProfile />);
    expect(getByTestId("btn-edit-profile")).toBeTruthy();
    expect(getByTestId("btn-addresses")).toBeTruthy();
    expect(getByTestId("btn-change-password")).toBeTruthy();
    expect(getByTestId("btn-favorites")).toBeTruthy();
    expect(getByTestId("btn-notifications")).toBeTruthy();
    expect(getByTestId("btn-logout")).toBeTruthy();
  });
});
