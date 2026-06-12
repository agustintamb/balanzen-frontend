import React from "react";
import { Text } from "react-native";
import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { act, render } from "@testing-library/react-native";
import { useUIStore } from "@/stores/ui.store";
import QueryProvider, { handleMutationError } from "../QueryProvider";

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockShowToast = jest.fn();

jest.mock("@/stores/ui.store", () => ({
  useUIStore: {
    getState: jest.fn(),
  },
}));

const mockUseUIStore = useUIStore as jest.Mocked<typeof useUIStore>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ChildComponent = () => <Text testID="child">child content</Text>;

const MutationTrigger = ({ mutationFn }: { mutationFn: jest.Mock }) => {
  const { mutate } = useMutation({ mutationFn });
  return (
    <Text testID="trigger" onPress={() => mutate(undefined)}>
      trigger
    </Text>
  );
};

const buildTestQueryClient = () =>
  new QueryClient({
    mutationCache: new MutationCache({ onError: handleMutationError }),
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("QueryProvider", () => {
  beforeEach(() => {
    mockUseUIStore.getState.mockReturnValue({
      showToast: mockShowToast,
      hideToast: jest.fn(),
      toast: { visible: false, message: "", type: "error" },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render children correctly", () => {
      const { getByTestId } = render(
        <QueryProvider>
          <ChildComponent />
        </QueryProvider>,
      );

      expect(getByTestId("child")).toBeTruthy();
    });

    it("should render multiple children correctly", () => {
      const { getByTestId } = render(
        <QueryProvider>
          <Text testID="first">first</Text>
          <Text testID="second">second</Text>
        </QueryProvider>,
      );

      expect(getByTestId("first")).toBeTruthy();
      expect(getByTestId("second")).toBeTruthy();
    });

    it("should provide a QueryClient context that children can consume", () => {
      let capturedClient: QueryClient | null = null;

      const ClientInspector = () => {
        capturedClient = useQueryClient();
        return null;
      };

      render(
        <QueryProvider>
          <ClientInspector />
        </QueryProvider>,
      );

      expect(capturedClient).not.toBeNull();
      expect(capturedClient).toBeInstanceOf(QueryClient);
    });
  });

  describe("MutationCache global onError", () => {
    it("should call showToast with the error message when a mutation fails", async () => {
      const testClient = buildTestQueryClient();

      const failingMutation = jest
        .fn()
        .mockRejectedValue(new Error("Red caída"));

      const { getByTestId } = render(
        <QueryClientProvider client={testClient}>
          <MutationTrigger mutationFn={failingMutation} />
        </QueryClientProvider>,
      );

      await act(async () => {
        getByTestId("trigger").props.onPress();
        // Allow the promise to settle
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(mockShowToast).toHaveBeenCalledWith("Red caída", "error");
    });

    it("should call showToast with fallback message when error is not an Error instance", async () => {
      const testClient = buildTestQueryClient();

      const failingMutation = jest.fn().mockRejectedValue("plain string error");

      const { getByTestId } = render(
        <QueryClientProvider client={testClient}>
          <MutationTrigger mutationFn={failingMutation} />
        </QueryClientProvider>,
      );

      await act(async () => {
        getByTestId("trigger").props.onPress();
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(mockShowToast).toHaveBeenCalledWith(
        "Ocurrió un error inesperado",
        "error",
      );
    });

    it("should call showToast with error type set to 'error'", async () => {
      const testClient = buildTestQueryClient();

      const failingMutation = jest
        .fn()
        .mockRejectedValue(new Error("Algo salió mal"));

      const { getByTestId } = render(
        <QueryClientProvider client={testClient}>
          <MutationTrigger mutationFn={failingMutation} />
        </QueryClientProvider>,
      );

      await act(async () => {
        getByTestId("trigger").props.onPress();
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      const [, toastType] = mockShowToast.mock.calls[0];
      expect(toastType).toBe("error");
    });

    it("should call showToast once per failed mutation", async () => {
      const testClient = buildTestQueryClient();

      const failingMutation = jest
        .fn()
        .mockRejectedValue(new Error("Único error"));

      const { getByTestId } = render(
        <QueryClientProvider client={testClient}>
          <MutationTrigger mutationFn={failingMutation} />
        </QueryClientProvider>,
      );

      await act(async () => {
        getByTestId("trigger").props.onPress();
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(mockShowToast).toHaveBeenCalledTimes(1);
    });

    it("should not call showToast when a mutation succeeds", async () => {
      const testClient = buildTestQueryClient();

      const successMutation = jest.fn().mockResolvedValue({ ok: true });

      const { getByTestId } = render(
        <QueryClientProvider client={testClient}>
          <MutationTrigger mutationFn={successMutation} />
        </QueryClientProvider>,
      );

      await act(async () => {
        getByTestId("trigger").props.onPress();
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(mockShowToast).not.toHaveBeenCalled();
    });

    it("should call showToast for each individual failing mutation", async () => {
      const testClient = buildTestQueryClient();

      const failingMutation = jest
        .fn()
        .mockRejectedValueOnce(new Error("Error uno"))
        .mockRejectedValueOnce(new Error("Error dos"));

      let triggerMutate: (() => void) | null = null;

      const MutationTrigger = () => {
        const { mutate } = useMutation({ mutationFn: failingMutation });
        triggerMutate = () => mutate(undefined);
        return <Text testID="trigger">trigger</Text>;
      };

      render(
        <QueryClientProvider client={testClient}>
          <MutationTrigger />
        </QueryClientProvider>,
      );

      await act(async () => {
        triggerMutate?.();
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      await act(async () => {
        triggerMutate?.();
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(mockShowToast).toHaveBeenCalledTimes(2);
      expect(mockShowToast).toHaveBeenNthCalledWith(1, "Error uno", "error");
      expect(mockShowToast).toHaveBeenNthCalledWith(2, "Error dos", "error");
    });

    it("should use useUIStore.getState() (not a hook) to access showToast", () => {
      // This verifies the pattern used outside of React context — getState() must
      // be the entry point, not a hook call, since MutationCache.onError is not a component.
      const testClient = buildTestQueryClient();

      render(
        <QueryClientProvider client={testClient}>
          <ChildComponent />
        </QueryClientProvider>,
      );

      // getState was not called at render time — only on mutation error
      expect(mockUseUIStore.getState).not.toHaveBeenCalled();
    });
  });
});
