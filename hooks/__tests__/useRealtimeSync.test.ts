import { act, renderHook } from "@testing-library/react-native";
import { useSocketEvent } from "@/hooks/useSocket";
import createWrapper from "@/__test-utils__/createWrapper";
import { useRealtimeSync } from "../useRealtimeSync";

jest.mock("@/hooks/useSocket", () => ({ useSocketEvent: jest.fn() }));

const mockUseSocketEvent = useSocketEvent as jest.Mock;

const getHandler = (event: string) =>
  mockUseSocketEvent.mock.calls.find((c) => c[0] === event)?.[1] as
    | ((payload: unknown) => void)
    | undefined;

beforeEach(() => jest.clearAllMocks());

describe("useRealtimeSync", () => {
  it("subscribes to new_notification and publication_changed", () => {
    const { wrapper } = createWrapper();
    renderHook(() => useRealtimeSync(), { wrapper });
    const events = mockUseSocketEvent.mock.calls.map((c) => c[0]);
    expect(events).toContain("new_notification");
    expect(events).toContain("publication_changed");
  });

  it("always invalidates notifications on new_notification", () => {
    const { wrapper, queryClient } = createWrapper();
    const invalidate = jest.spyOn(queryClient, "invalidateQueries");
    renderHook(() => useRealtimeSync(), { wrapper });
    act(() => getHandler("new_notification")?.({ id: "n1", type: "NEW_RESERVATION" }));
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["notifications"] });
  });

  it("only invalidates notifications when type is missing", () => {
    const { wrapper, queryClient } = createWrapper();
    const invalidate = jest.spyOn(queryClient, "invalidateQueries");
    renderHook(() => useRealtimeSync(), { wrapper });
    act(() => getHandler("new_notification")?.({ id: "n1" }));
    expect(invalidate).toHaveBeenCalledTimes(1);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["notifications"] });
  });

  it("invalidates orders and publications for ORDER_TYPES", () => {
    const ORDER_TYPES = [
      "NEW_RESERVATION",
      "RESERVATION_CANCELLED_BY_CONSUMER",
      "RESERVATION_CANCELLED_BY_COMMERCE",
      "ORDER_DELIVERED",
    ] as const;

    for (const type of ORDER_TYPES) {
      jest.clearAllMocks();
      const { wrapper, queryClient } = createWrapper();
      const invalidate = jest.spyOn(queryClient, "invalidateQueries");
      renderHook(() => useRealtimeSync(), { wrapper });
      act(() => getHandler("new_notification")?.({ id: "n1", type }));
      expect(invalidate).toHaveBeenCalledWith({ queryKey: ["orders"] });
      expect(invalidate).toHaveBeenCalledWith({ queryKey: ["publications"] });
    }
  });

  it("invalidates publications for PUBLICATION_EXPIRING", () => {
    const { wrapper, queryClient } = createWrapper();
    const invalidate = jest.spyOn(queryClient, "invalidateQueries");
    renderHook(() => useRealtimeSync(), { wrapper });
    act(() =>
      getHandler("new_notification")?.({ id: "n1", type: "PUBLICATION_EXPIRING" }),
    );
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["publications"] });
    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: ["orders"] });
  });

  it("invalidates publications for PUBLICATION_EXPIRED", () => {
    const { wrapper, queryClient } = createWrapper();
    const invalidate = jest.spyOn(queryClient, "invalidateQueries");
    renderHook(() => useRealtimeSync(), { wrapper });
    act(() =>
      getHandler("new_notification")?.({ id: "n1", type: "PUBLICATION_EXPIRED" }),
    );
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["publications"] });
    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: ["orders"] });
  });

  it("invalidates chats, orders, publications and message thread for NEW_MESSAGE with reference_id", () => {
    const { wrapper, queryClient } = createWrapper();
    const invalidate = jest.spyOn(queryClient, "invalidateQueries");
    renderHook(() => useRealtimeSync(), { wrapper });
    act(() =>
      getHandler("new_notification")?.({
        id: "n1",
        type: "NEW_MESSAGE",
        reference_id: "order-123",
      }),
    );
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["chats"] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["orders"] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["publications"] });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ["chats", "order-123", "messages"],
    });
  });

  it("does not invalidate message thread for NEW_MESSAGE without reference_id", () => {
    const { wrapper, queryClient } = createWrapper();
    const invalidate = jest.spyOn(queryClient, "invalidateQueries");
    renderHook(() => useRealtimeSync(), { wrapper });
    act(() =>
      getHandler("new_notification")?.({ id: "n1", type: "NEW_MESSAGE" }),
    );
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["chats"] });
    const messagesCall = (invalidate.mock.calls as { queryKey: unknown[] }[][]).find(
      ([arg]) => Array.isArray(arg.queryKey) && arg.queryKey[2] === "messages",
    );
    expect(messagesCall).toBeUndefined();
  });

  it("invalidates publications on publication_changed", () => {
    const { wrapper, queryClient } = createWrapper();
    const invalidate = jest.spyOn(queryClient, "invalidateQueries");
    renderHook(() => useRealtimeSync(), { wrapper });
    act(() => getHandler("publication_changed")?.({ id: "p1" }));
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["publications"] });
  });
});
