import React from "react";
import { render } from "@testing-library/react-native";

describe("SafeMapView (maps unavailable — Expo Go)", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.doMock("react-native-maps", () => {
      throw new Error("Module not found");
    });
  });

  afterEach(() => {
    jest.resetModules();
  });

  it("exports MAPS_AVAILABLE as false when react-native-maps throws", () => {
    const { MAPS_AVAILABLE } = require("../SafeMapView");
    expect(MAPS_AVAILABLE).toBe(false);
  });

  it("renders the fallback message when maps module is unavailable", () => {
    const { SafeMapView } = require("../SafeMapView");
    const { getByText } = render(<SafeMapView style={{}} />);
    expect(getByText(/Mapa no disponible/)).toBeTruthy();
  });
});

describe("SafeMapView (maps available — dev client / production)", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.doMock("react-native-maps", () => ({ default: "MapView" }));
  });

  afterEach(() => {
    jest.resetModules();
  });

  it("exports MAPS_AVAILABLE as true when react-native-maps loads", () => {
    const { MAPS_AVAILABLE } = require("../SafeMapView");
    expect(MAPS_AVAILABLE).toBe(true);
  });

  it("SafeMapView is the native MapView component", () => {
    const { SafeMapView } = require("../SafeMapView");
    expect(SafeMapView).toBe("MapView");
  });
});
