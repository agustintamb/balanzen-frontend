import { router } from "expo-router";
import { safePush } from "@/utils/navigation";

jest.mock("expo-router", () => ({
  router: { push: jest.fn() },
}));

const mockPush = router.push as jest.Mock;

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runAllTimers();
  jest.useRealTimers();
  jest.clearAllMocks();
});

describe("safePush", () => {
  it("calls router.push with the provided href", () => {
    safePush("/foo");
    expect(mockPush).toHaveBeenCalledWith("/foo");
    expect(mockPush).toHaveBeenCalledTimes(1);
  });

  it("ignores a second call within the 600 ms guard window", () => {
    safePush("/foo");
    safePush("/bar");
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith("/foo");
  });

  it("allows a new push after the 600 ms guard expires", () => {
    safePush("/foo");
    jest.advanceTimersByTime(600);
    safePush("/bar");
    expect(mockPush).toHaveBeenCalledTimes(2);
    expect(mockPush).toHaveBeenNthCalledWith(2, "/bar");
  });
});
