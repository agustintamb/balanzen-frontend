import React from "react";
import { act, create } from "react-test-renderer";
import { useUIStore, useToast, ToastType } from "@/stores/ui.store";

// Renders a hook in a proper React context using react-test-renderer.
// Returns a ref-like object whose `.current` is updated after each act().
const renderTestHook = <T>(useHook: () => T): { current: T } => {
  const result: { current: T } = { current: null as unknown as T };

  const TestComponent = () => {
    result.current = useHook();
    return null;
  };

  act(() => {
    create(React.createElement(TestComponent));
  });

  return result;
};

const resetStore = () => {
  act(() => {
    useUIStore.setState({
      toast: { visible: false, message: "", type: "error" },
    });
  });
};

describe("useUIStore", () => {
  beforeEach(() => {
    resetStore();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── Initial state ───────────────────────────────────────────────────────────

  describe("initial state", () => {
    it("should have visible set to false", () => {
      const { toast } = useUIStore.getState();

      expect(toast.visible).toBe(false);
    });

    it("should have an empty message", () => {
      const { toast } = useUIStore.getState();

      expect(toast.message).toBe("");
    });

    it("should have type set to error as default", () => {
      const { toast } = useUIStore.getState();

      expect(toast.type).toBe("error");
    });
  });

  // ─── showToast ───────────────────────────────────────────────────────────────

  describe("showToast", () => {
    it("should set visible to true when called", () => {
      act(() => {
        useUIStore.getState().showToast("Something happened");
      });

      expect(useUIStore.getState().toast.visible).toBe(true);
    });

    it("should set the message when called", () => {
      act(() => {
        useUIStore.getState().showToast("Item added to favorites");
      });

      expect(useUIStore.getState().toast.message).toBe("Item added to favorites");
    });

    it("should default to error type when no type is provided", () => {
      act(() => {
        useUIStore.getState().showToast("Something went wrong");
      });

      expect(useUIStore.getState().toast.type).toBe("error");
    });

    it("should set type to success when specified", () => {
      act(() => {
        useUIStore.getState().showToast("Saved successfully", "success");
      });

      expect(useUIStore.getState().toast.type).toBe("success");
    });

    it("should set type to error when specified explicitly", () => {
      act(() => {
        useUIStore.getState().showToast("Connection failed", "error");
      });

      expect(useUIStore.getState().toast.type).toBe("error");
    });

    it("should set type to warning when specified", () => {
      act(() => {
        useUIStore.getState().showToast("Expiring soon", "warning");
      });

      expect(useUIStore.getState().toast.type).toBe("warning");
    });

    it("should set type to info when specified", () => {
      act(() => {
        useUIStore.getState().showToast("New version available", "info");
      });

      expect(useUIStore.getState().toast.type).toBe("info");
    });
  });

  // ─── hideToast ───────────────────────────────────────────────────────────────

  describe("hideToast", () => {
    it("should set visible to false after being shown", () => {
      act(() => {
        useUIStore.getState().showToast("Hello");
      });

      act(() => {
        useUIStore.getState().hideToast();
      });

      expect(useUIStore.getState().toast.visible).toBe(false);
    });

    it("should preserve message after hiding", () => {
      act(() => {
        useUIStore.getState().showToast("Address saved", "success");
      });

      act(() => {
        useUIStore.getState().hideToast();
      });

      expect(useUIStore.getState().toast.message).toBe("Address saved");
    });

    it("should preserve type after hiding", () => {
      act(() => {
        useUIStore.getState().showToast("Address saved", "success");
      });

      act(() => {
        useUIStore.getState().hideToast();
      });

      expect(useUIStore.getState().toast.type).toBe("success");
    });

    it("should be safe to call when toast is already hidden", () => {
      act(() => {
        useUIStore.getState().hideToast();
      });

      expect(useUIStore.getState().toast.visible).toBe(false);
    });
  });

  // ─── Full cycle ───────────────────────────────────────────────────────────────

  describe("showToast then hideToast full cycle", () => {
    it("should transition from hidden to visible to hidden correctly", () => {
      const store = useUIStore.getState;

      act(() => {
        store().showToast("Reservation confirmed", "success");
      });

      expect(store().toast.visible).toBe(true);
      expect(store().toast.message).toBe("Reservation confirmed");
      expect(store().toast.type).toBe("success");

      act(() => {
        store().hideToast();
      });

      expect(store().toast.visible).toBe(false);
      expect(store().toast.message).toBe("Reservation confirmed");
      expect(store().toast.type).toBe("success");
    });
  });

  // ─── Multiple sequential calls ───────────────────────────────────────────────

  describe("multiple sequential showToast calls", () => {
    it("should reflect only the last call when showToast is called multiple times", () => {
      act(() => {
        useUIStore.getState().showToast("First message", "info");
        useUIStore.getState().showToast("Second message", "success");
        useUIStore.getState().showToast("Third message", "warning");
      });

      const { toast } = useUIStore.getState();
      expect(toast.message).toBe("Third message");
      expect(toast.type).toBe("warning");
      expect(toast.visible).toBe(true);
    });

    it("should show toast again after hiding when showToast is called again", () => {
      act(() => {
        useUIStore.getState().showToast("First error", "error");
      });

      act(() => {
        useUIStore.getState().hideToast();
      });

      expect(useUIStore.getState().toast.visible).toBe(false);

      act(() => {
        useUIStore.getState().showToast("Second error", "error");
      });

      expect(useUIStore.getState().toast.visible).toBe(true);
      expect(useUIStore.getState().toast.message).toBe("Second error");
    });

    it("should override message from a previous error type with a success type", () => {
      act(() => {
        useUIStore.getState().showToast("Something failed", "error");
      });

      act(() => {
        useUIStore.getState().showToast("Now it worked", "success");
      });

      const { toast } = useUIStore.getState();
      expect(toast.message).toBe("Now it worked");
      expect(toast.type).toBe("success");
    });
  });
});

// ─── useToast helper ─────────────────────────────────────────────────────────

describe("useToast", () => {
  beforeEach(() => {
    act(() => {
      useUIStore.setState({
        toast: { visible: false, message: "", type: "error" },
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should expose showError helper that sets type to error", () => {
    const helpers = renderTestHook(() => useToast());

    act(() => {
      helpers.current.showError("Email already registered");
    });

    const { toast } = useUIStore.getState();
    expect(toast.type).toBe("error");
    expect(toast.message).toBe("Email already registered");
    expect(toast.visible).toBe(true);
  });

  it("should expose showSuccess helper that sets type to success", () => {
    const helpers = renderTestHook(() => useToast());

    act(() => {
      helpers.current.showSuccess("Address saved");
    });

    const { toast } = useUIStore.getState();
    expect(toast.type).toBe("success");
    expect(toast.message).toBe("Address saved");
    expect(toast.visible).toBe(true);
  });

  it("should expose showWarning helper that sets type to warning", () => {
    const helpers = renderTestHook(() => useToast());

    act(() => {
      helpers.current.showWarning("Expiring in 2 hours");
    });

    const { toast } = useUIStore.getState();
    expect(toast.type).toBe("warning");
    expect(toast.message).toBe("Expiring in 2 hours");
    expect(toast.visible).toBe(true);
  });

  it("should expose showInfo helper that sets type to info", () => {
    const helpers = renderTestHook(() => useToast());

    act(() => {
      helpers.current.showInfo("New products nearby");
    });

    const { toast } = useUIStore.getState();
    expect(toast.type).toBe("info");
    expect(toast.message).toBe("New products nearby");
    expect(toast.visible).toBe(true);
  });

  it("should expose generic show helper that accepts any ToastType", () => {
    const helpers = renderTestHook(() => useToast());
    const type: ToastType = "success";

    act(() => {
      helpers.current.show("Custom message", type);
    });

    const { toast } = useUIStore.getState();
    expect(toast.type).toBe("success");
    expect(toast.message).toBe("Custom message");
    expect(toast.visible).toBe(true);
  });

  it("should use the default error type when show is called without a type", () => {
    const helpers = renderTestHook(() => useToast());

    act(() => {
      helpers.current.show("Something failed");
    });

    expect(useUIStore.getState().toast.type).toBe("error");
    expect(useUIStore.getState().toast.visible).toBe(true);
  });
});
