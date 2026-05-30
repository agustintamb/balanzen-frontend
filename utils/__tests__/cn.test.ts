import { cn } from "@/utils/cn";

describe("cn", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("basic string concatenation", () => {
    it("should return a single class when given one string", () => {
      // Arrange / Act
      const result = cn("px-4");
      // Assert
      expect(result).toBe("px-4");
    });

    it("should join two string classes with a space", () => {
      // Arrange / Act
      const result = cn("px-4", "py-2");
      // Assert
      expect(result).toBe("px-4 py-2");
    });

    it("should join multiple string classes with spaces", () => {
      // Arrange / Act
      const result = cn("flex", "flex-col", "items-center", "justify-between");
      // Assert
      expect(result).toBe("flex flex-col items-center justify-between");
    });
  });

  describe("empty / no-arg call", () => {
    it("should return an empty string when called with no arguments", () => {
      // Arrange / Act
      const result = cn();
      // Assert
      expect(result).toBe("");
    });
  });

  describe("falsy value filtering", () => {
    it("should ignore undefined values", () => {
      // Arrange / Act
      const result = cn("px-4", undefined, "py-2");
      // Assert
      expect(result).toBe("px-4 py-2");
    });

    it("should ignore null values", () => {
      // Arrange / Act
      const result = cn("px-4", null, "py-2");
      // Assert
      expect(result).toBe("px-4 py-2");
    });

    it("should ignore false values", () => {
      // Arrange / Act
      const result = cn("px-4", false, "py-2");
      // Assert
      expect(result).toBe("px-4 py-2");
    });

    it("should ignore 0 values", () => {
      // Arrange / Act
      const result = cn("px-4", 0, "py-2");
      // Assert
      expect(result).toBe("px-4 py-2");
    });

    it("should return an empty string when only falsy args are provided", () => {
      // Arrange / Act
      const result = cn(undefined, null, false);
      // Assert
      expect(result).toBe("");
    });

    it("should handle a single undefined arg", () => {
      // Arrange / Act
      const result = cn(undefined);
      // Assert
      expect(result).toBe("");
    });

    it("should handle a single null arg", () => {
      // Arrange / Act
      const result = cn(null);
      // Assert
      expect(result).toBe("");
    });
  });

  describe("truthy conditional classes", () => {
    it("should include a class when its condition is true", () => {
      // Arrange
      const isActive = true;
      // Act
      const result = cn("base-class", isActive && "active");
      // Assert
      expect(result).toBe("base-class active");
    });

    it("should exclude a class when its condition is false", () => {
      // Arrange
      const isActive = false;
      // Act
      const result = cn("base-class", isActive && "active");
      // Assert
      expect(result).toBe("base-class");
    });
  });

  describe("object syntax", () => {
    it("should include a class when its object value is true", () => {
      // Arrange / Act
      const result = cn({ "bg-primary": true });
      // Assert
      expect(result).toBe("bg-primary");
    });

    it("should exclude a class when its object value is false", () => {
      // Arrange / Act
      const result = cn({ "bg-primary": false });
      // Assert
      expect(result).toBe("");
    });

    it("should include only truthy keys from an object with mixed values", () => {
      // Arrange / Act
      const result = cn({
        "bg-primary": true,
        "text-white": false,
        "rounded-lg": true,
      });
      // Assert
      expect(result).toBe("bg-primary rounded-lg");
    });
  });

  describe("array inputs", () => {
    it("should flatten a single array of class strings", () => {
      // Arrange / Act
      const result = cn(["flex", "items-center"]);
      // Assert
      expect(result).toBe("flex items-center");
    });

    it("should flatten nested arrays of class strings", () => {
      // Arrange / Act
      const result = cn(["flex", ["items-center", "justify-center"]]);
      // Assert
      expect(result).toBe("flex items-center justify-center");
    });

    it("should filter falsy values inside an array", () => {
      // Arrange / Act
      const result = cn(["flex", false, null, undefined, "items-center"]);
      // Assert
      expect(result).toBe("flex items-center");
    });
  });

  describe("mixed inputs (strings + objects + arrays)", () => {
    it("should handle a combination of strings, objects, and arrays", () => {
      // Arrange / Act
      const result = cn(
        "flex",
        { "bg-primary": true, "text-error": false },
        ["px-4", "py-2"]
      );
      // Assert
      expect(result).toBe("flex bg-primary px-4 py-2");
    });

    it("should handle string + conditional + object together", () => {
      // Arrange
      const isDisabled = true;
      // Act
      const result = cn(
        "rounded-xl px-4 py-3",
        isDisabled && "opacity-50",
        { "bg-primary": !isDisabled, "bg-surface-dark": isDisabled }
      );
      // Assert
      expect(result).toBe("rounded-xl px-4 py-3 opacity-50 bg-surface-dark");
    });
  });

  describe("tailwind conflict resolution", () => {
    it("should keep the later padding-x class when both px-2 and px-4 are provided", () => {
      // Arrange / Act
      const result = cn("px-2", "px-4");
      // Assert
      expect(result).toBe("px-4");
    });

    it("should keep the later background class when both bg-primary and bg-error are provided", () => {
      // Arrange / Act
      const result = cn("bg-primary", "bg-error");
      // Assert
      expect(result).toBe("bg-error");
    });

    it("should keep the later text-size class when multiple are provided", () => {
      // Arrange / Act
      const result = cn("text-sm", "text-lg");
      // Assert
      expect(result).toBe("text-lg");
    });

    it("should keep the later font-weight class when both are provided", () => {
      // Arrange / Act
      const result = cn("font-bold", "font-medium");
      // Assert
      expect(result).toBe("font-medium");
    });

    it("should keep the later rounded class when both are provided", () => {
      // Arrange / Act
      const result = cn("rounded", "rounded-lg");
      // Assert
      expect(result).toBe("rounded-lg");
    });
  });

  describe("className override pattern", () => {
    it("should allow a parent className to override the component base class", () => {
      // Arrange
      const baseClass = "px-2 py-1 bg-primary rounded";
      const overrideClass = "px-6 bg-error";
      // Act
      const result = cn(baseClass, overrideClass);
      // Assert
      // px-6 overrides px-2, bg-error overrides bg-primary, rest untouched
      expect(result).toBe("py-1 rounded px-6 bg-error");
    });

    it("should preserve base classes that are not overridden", () => {
      // Arrange
      const base = "flex items-center gap-2 text-sm";
      const override = "text-lg";
      // Act
      const result = cn(base, override);
      // Assert
      expect(result).toBe("flex items-center gap-2 text-lg");
    });

    it("should not duplicate classes when the same class appears in base and override", () => {
      // Arrange / Act
      const result = cn("bg-primary", "bg-primary");
      // Assert
      expect(result).toBe("bg-primary");
    });
  });
});
