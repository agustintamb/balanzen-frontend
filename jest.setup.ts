import { notifyManager } from "@tanstack/react-query";
import { act } from "@testing-library/react-native";

// React Query batches state updates via setTimeout. In tests those fire outside
// act(), producing "not wrapped in act()" warnings. Synchronizing updates with
// act() here eliminates all React Query-sourced act warnings across the suite.
notifyManager.setScheduler((callback) => {
  act(callback);
});

// @expo/vector-icons loads fonts asynchronously, triggering setState outside
// act() in any test that renders a component with an icon. Marking all fonts
// as already loaded prevents the async state update.
jest.mock("expo-font", () => ({
  isLoaded: jest.fn(() => true),
  loadAsync: jest.fn().mockResolvedValue(undefined),
  useFonts: jest.fn(() => [true, null]),
}));
