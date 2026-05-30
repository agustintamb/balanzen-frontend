import * as Location from "expo-location";
import { buildAddressFromCoords } from "../address.utils";

jest.mock("expo-location", () => ({
  reverseGeocodeAsync: jest.fn(),
}));

const mockReverseGeocodeAsync = Location.reverseGeocodeAsync as jest.MockedFunction<
  typeof Location.reverseGeocodeAsync
>;

const buildPlace = (overrides: Partial<Location.LocationGeocodedAddress> = {}): Location.LocationGeocodedAddress => ({
  street: "Av. Corrientes",
  streetNumber: "1234",
  city: "Buenos Aires",
  region: "Buenos Aires",
  subregion: "CABA",
  country: "Argentina",
  postalCode: "C1043",
  name: null,
  isoCountryCode: "AR",
  timezone: null,
  district: null,
  formattedAddress: null,
  ...overrides,
});

describe("buildAddressFromCoords", () => {
  const LAT = -34.6037;
  const LNG = -58.3816;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("happy path", () => {
    it("should build a full AddressInput when all place fields are present", async () => {
      mockReverseGeocodeAsync.mockResolvedValueOnce([buildPlace()]);

      const result = await buildAddressFromCoords(LAT, LNG);

      expect(result).toEqual({
        formatted_address: "Av. Corrientes 1234, Buenos Aires, Buenos Aires",
        street: "Av. Corrientes",
        number: "1234",
        city: "Buenos Aires",
        province: "Buenos Aires",
        lat: LAT,
        lng: LNG,
      });
    });

    it("should use formattedAddress when backend provides it", async () => {
      mockReverseGeocodeAsync.mockResolvedValueOnce([
        buildPlace({ formattedAddress: "Av. Corrientes 1234, CABA, AR" }),
      ]);

      const result = await buildAddressFromCoords(LAT, LNG);

      expect(result.formatted_address).toBe("Av. Corrientes 1234, CABA, AR");
    });

    it("should preserve lat and lng exactly as passed", async () => {
      mockReverseGeocodeAsync.mockResolvedValueOnce([buildPlace()]);
      const customLat = -23.5505;
      const customLng = -46.6333;

      const result = await buildAddressFromCoords(customLat, customLng);

      expect(result.lat).toBe(customLat);
      expect(result.lng).toBe(customLng);
    });

    it("should call reverseGeocodeAsync with the correct coordinates", async () => {
      mockReverseGeocodeAsync.mockResolvedValueOnce([buildPlace()]);

      await buildAddressFromCoords(LAT, LNG);

      expect(mockReverseGeocodeAsync).toHaveBeenCalledWith({
        latitude: LAT,
        longitude: LNG,
      });
    });
  });

  describe("missing street number", () => {
    it("should use only street when streetNumber is missing", async () => {
      mockReverseGeocodeAsync.mockResolvedValueOnce([
        buildPlace({ streetNumber: null }),
      ]);

      const result = await buildAddressFromCoords(LAT, LNG);

      expect(result.number).toBe("");
      expect(result.street).toBe("Av. Corrientes");
      // streetLine should be just the street name
      expect(result.formatted_address).toContain("Av. Corrientes");
      expect(result.formatted_address).not.toMatch(/Av\. Corrientes \d/);
    });

    it("should build streetLine as empty string when both street and streetNumber are null", async () => {
      mockReverseGeocodeAsync.mockResolvedValueOnce([
        buildPlace({ street: null, streetNumber: null }),
      ]);

      const result = await buildAddressFromCoords(LAT, LNG);

      expect(result.street).toBe("");
      expect(result.number).toBe("");
    });
  });

  describe("missing city — fallback to subregion", () => {
    it("should fall back to subregion when city is null", async () => {
      mockReverseGeocodeAsync.mockResolvedValueOnce([
        buildPlace({ city: null, subregion: "CABA" }),
      ]);

      const result = await buildAddressFromCoords(LAT, LNG);

      expect(result.city).toBe("CABA");
    });

    it("should return empty string for city when both city and subregion are null", async () => {
      mockReverseGeocodeAsync.mockResolvedValueOnce([
        buildPlace({ city: null, subregion: null }),
      ]);

      const result = await buildAddressFromCoords(LAT, LNG);

      expect(result.city).toBe("");
    });
  });

  describe("missing region", () => {
    it("should return empty string for province when region is null", async () => {
      mockReverseGeocodeAsync.mockResolvedValueOnce([
        buildPlace({ region: null }),
      ]);

      const result = await buildAddressFromCoords(LAT, LNG);

      expect(result.province).toBe("");
    });
  });

  describe("empty geocoder results", () => {
    it("should return empty fields when geocoder returns an empty array", async () => {
      mockReverseGeocodeAsync.mockResolvedValueOnce([]);

      const result = await buildAddressFromCoords(LAT, LNG);

      expect(result).toEqual({
        formatted_address: "",
        street: "",
        number: "",
        city: "",
        province: "",
        lat: LAT,
        lng: LNG,
      });
    });
  });

  describe("formatted_address fallback construction", () => {
    it("should join non-empty parts with a comma and space", async () => {
      mockReverseGeocodeAsync.mockResolvedValueOnce([
        buildPlace({
          formattedAddress: null,
          street: "Belgrano",
          streetNumber: "500",
          city: "Córdoba",
          region: "Córdoba",
          subregion: null,
        }),
      ]);

      const result = await buildAddressFromCoords(LAT, LNG);

      expect(result.formatted_address).toBe("Belgrano 500, Córdoba, Córdoba");
    });

    it("should omit empty parts from the formatted_address fallback", async () => {
      mockReverseGeocodeAsync.mockResolvedValueOnce([
        buildPlace({
          formattedAddress: null,
          street: "San Martín",
          streetNumber: null,
          city: null,
          subregion: null,
          region: "Mendoza",
        }),
      ]);

      const result = await buildAddressFromCoords(LAT, LNG);

      // streetLine = "San Martín" (no number), city fallback = "" filtered out
      expect(result.formatted_address).toBe("San Martín, Mendoza");
    });
  });
});
