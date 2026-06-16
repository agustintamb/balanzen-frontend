import { act, renderHook } from "@testing-library/react-native";
import {
  useAddFavorite,
  useFavorites,
  useRemoveFavorite,
} from "@/hooks/useFavorites";
import { useFavoriteToggle } from "@/hooks/useFavoriteToggle";

jest.mock("@/hooks/useFavorites", () => ({
  useFavorites: jest.fn(),
  useAddFavorite: jest.fn(),
  useRemoveFavorite: jest.fn(),
}));

const mockAdd = jest.fn();
const mockRemove = jest.fn();

const setup = (favorites: { publication: { id: string } }[] = []) => {
  (useFavorites as jest.Mock).mockReturnValue({ data: { favorites } });
  (useAddFavorite as jest.Mock).mockReturnValue({ mutate: mockAdd });
  (useRemoveFavorite as jest.Mock).mockReturnValue({ mutate: mockRemove });
};

beforeEach(() => jest.clearAllMocks());

describe("useFavoriteToggle", () => {
  it("is not favorite when the publication is not in the list", () => {
    setup();
    const { result } = renderHook(() => useFavoriteToggle("pub-1"));
    expect(result.current.isFavorite).toBe(false);
  });

  it("is favorite when the publication is in the list", () => {
    setup([{ publication: { id: "pub-1" } }]);
    const { result } = renderHook(() => useFavoriteToggle("pub-1"));
    expect(result.current.isFavorite).toBe(true);
  });

  it("adds and flips to favorite optimistically", () => {
    setup();
    const { result } = renderHook(() => useFavoriteToggle("pub-1"));
    act(() => result.current.toggleFavorite());
    expect(mockAdd).toHaveBeenCalledWith("pub-1");
    expect(result.current.isFavorite).toBe(true);
  });

  it("removes and flips to not-favorite optimistically", () => {
    setup([{ publication: { id: "pub-1" } }]);
    const { result } = renderHook(() => useFavoriteToggle("pub-1"));
    act(() => result.current.toggleFavorite());
    expect(mockRemove).toHaveBeenCalledWith("pub-1");
    expect(result.current.isFavorite).toBe(false);
  });

  it("does nothing without a publication id", () => {
    setup();
    const { result } = renderHook(() => useFavoriteToggle());
    act(() => result.current.toggleFavorite());
    expect(mockAdd).not.toHaveBeenCalled();
    expect(mockRemove).not.toHaveBeenCalled();
  });

  it("is not favorite when the favorites list has not loaded", () => {
    (useFavorites as jest.Mock).mockReturnValue({ data: undefined });
    (useAddFavorite as jest.Mock).mockReturnValue({ mutate: mockAdd });
    (useRemoveFavorite as jest.Mock).mockReturnValue({ mutate: mockRemove });
    const { result } = renderHook(() => useFavoriteToggle("pub-1"));
    expect(result.current.isFavorite).toBe(false);
  });
});
