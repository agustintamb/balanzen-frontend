import {
  ROUTE_CONFIG,
  FEATURED_ROUTES,
  HIDDEN_TAB_BAR_ROUTES,
  GRADIENT_COLORS,
  GRADIENT_START,
  GRADIENT_END,
  CIRCLE_SHADOW,
  GRADIENT_STYLE,
  labelClass,
} from "../tabBar.utils";

jest.mock("@/utils/cn", () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(" "),
}));

jest.mock("@/components/ui/Icon", () => ({}));

describe("ROUTE_CONFIG", () => {
  it("contains the home route with correct label and icon", () => {
    expect(ROUTE_CONFIG.home).toEqual({ label: "Inicio", icon: "home" });
  });

  it("contains the orders route with correct label and icon", () => {
    expect(ROUTE_CONFIG.orders).toEqual({ label: "Mis pedidos", icon: "package" });
  });

  it("contains the publish route with correct label and icon", () => {
    expect(ROUTE_CONFIG.publish).toEqual({ label: "Publicar", icon: "plus" });
  });

  it("contains the profile route with correct label and icon", () => {
    expect(ROUTE_CONFIG.profile).toEqual({ label: "Perfil", icon: "user" });
  });

  it("has exactly four routes", () => {
    expect(Object.keys(ROUTE_CONFIG)).toHaveLength(4);
  });
});

describe("FEATURED_ROUTES", () => {
  it("contains orders", () => {
    expect(FEATURED_ROUTES.has("orders")).toBe(true);
  });

  it("contains publish", () => {
    expect(FEATURED_ROUTES.has("publish")).toBe(true);
  });

  it("does not contain home", () => {
    expect(FEATURED_ROUTES.has("home")).toBe(false);
  });

  it("does not contain profile", () => {
    expect(FEATURED_ROUTES.has("profile")).toBe(false);
  });
});

describe("HIDDEN_TAB_BAR_ROUTES", () => {
  it("contains publish", () => {
    expect(HIDDEN_TAB_BAR_ROUTES.has("publish")).toBe(true);
  });

  it("does not contain home", () => {
    expect(HIDDEN_TAB_BAR_ROUTES.has("home")).toBe(false);
  });

  it("does not contain orders", () => {
    expect(HIDDEN_TAB_BAR_ROUTES.has("orders")).toBe(false);
  });

  it("does not contain profile", () => {
    expect(HIDDEN_TAB_BAR_ROUTES.has("profile")).toBe(false);
  });
});

describe("GRADIENT_COLORS", () => {
  it("is a tuple of two color strings", () => {
    expect(GRADIENT_COLORS).toEqual(["#78B82B", "#4A8314"]);
  });
});

describe("GRADIENT_START", () => {
  it("has correct x and y values", () => {
    expect(GRADIENT_START).toEqual({ x: 0.2, y: 0 });
  });
});

describe("GRADIENT_END", () => {
  it("has correct x and y values", () => {
    expect(GRADIENT_END).toEqual({ x: 0.8, y: 1 });
  });
});

describe("CIRCLE_SHADOW", () => {
  it("has position absolute", () => {
    expect(CIRCLE_SHADOW.position).toBe("absolute");
  });

  it("has correct dimensions", () => {
    expect(CIRCLE_SHADOW.width).toBe(56);
    expect(CIRCLE_SHADOW.height).toBe(56);
    expect(CIRCLE_SHADOW.borderRadius).toBe(28);
  });

  it("has correct top offset", () => {
    expect(CIRCLE_SHADOW.top).toBe(-20);
  });

  it("has correct background color", () => {
    expect(CIRCLE_SHADOW.backgroundColor).toBe("#639922");
  });

  it("has correct shadow properties", () => {
    expect(CIRCLE_SHADOW.shadowColor).toBe("#000");
    expect(CIRCLE_SHADOW.shadowOffset).toEqual({ width: 0, height: 4 });
    expect(CIRCLE_SHADOW.shadowOpacity).toBe(0.18);
    expect(CIRCLE_SHADOW.shadowRadius).toBe(8);
    expect(CIRCLE_SHADOW.elevation).toBe(6);
  });
});

describe("GRADIENT_STYLE", () => {
  it("has correct dimensions", () => {
    expect(GRADIENT_STYLE.width).toBe(56);
    expect(GRADIENT_STYLE.height).toBe(56);
    expect(GRADIENT_STYLE.borderRadius).toBe(28);
  });

  it("has center alignment and hidden overflow", () => {
    expect(GRADIENT_STYLE.alignItems).toBe("center");
    expect(GRADIENT_STYLE.justifyContent).toBe("center");
    expect(GRADIENT_STYLE.overflow).toBe("hidden");
  });
});

describe("labelClass", () => {
  it("includes text-primary when focused", () => {
    const result = labelClass(true);
    expect(result).toContain("text-primary");
  });

  it("does not include text-gray-400 when focused", () => {
    const result = labelClass(true);
    expect(result).not.toContain("text-gray-400");
  });

  it("includes text-gray-400 when not focused", () => {
    const result = labelClass(false);
    expect(result).toContain("text-gray-400");
  });

  it("does not include text-primary when not focused", () => {
    const result = labelClass(false);
    expect(result).not.toContain("text-primary");
  });

  it("always includes base classes", () => {
    expect(labelClass(true)).toContain("text-xs");
    expect(labelClass(true)).toContain("font-sans-medium");
    expect(labelClass(true)).toContain("mt-1");
    expect(labelClass(false)).toContain("text-xs");
    expect(labelClass(false)).toContain("font-sans-medium");
    expect(labelClass(false)).toContain("mt-1");
  });
});
