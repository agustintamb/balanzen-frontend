import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import type { AddressInput } from "@/api/addresses/addresses.types";
import Icon from "@/components/ui/Icon";
import Input from "@/components/ui/Input";

interface AddressSearchProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchResults: AddressInput[];
  isSearching: boolean;
  isGettingLocation: boolean;
  permissionDenied: boolean;
  locationError: string | null;
  onSelectResult: (result: AddressInput) => void;
  onUseLocation: () => void;
  // Si hay direcciones previas, muestra un botón de volver a la lista
  onBack?: () => void;
}

const AddressSearch = ({
  searchQuery,
  onSearchChange,
  searchResults,
  isSearching,
  isGettingLocation,
  permissionDenied,
  locationError,
  onSelectResult,
  onUseLocation,
  onBack,
}: AddressSearchProps) => {
  const showDropdown =
    searchQuery.length >= 3 && (isSearching || searchResults.length > 0);

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 20,
          gap: 12,
        }}
      >
        {onBack && (
          <TouchableOpacity onPress={onBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icon name="arrow-back-outline" size={24} color="primary-dark" />
          </TouchableOpacity>
        )}
        <Text
          style={{
            fontFamily: "Inter_700Bold",
            fontSize: 20,
            color: "#27500A",
            flex: 1,
          }}
        >
          Ingresá tu dirección
        </Text>
      </View>

      {/* Contenido */}
      <View style={{ paddingHorizontal: 20, gap: 16 }}>
        {/* Input con dropdown */}
        <View style={{ zIndex: 10 }}>
          <Input
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder="Dirección o punto de referencia"
            returnKeyType="search"
            leftIcon={<Icon name="search-outline" size={18} color="muted" />}
          />

          {showDropdown && (
            <View
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                zIndex: 20,
                marginTop: 4,
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                overflow: "hidden",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              {isSearching && (
                <View style={{ alignItems: "center", padding: 16 }}>
                  <ActivityIndicator color="#639922" />
                </View>
              )}
              {!isSearching &&
                searchResults.map((result, index) => (
                  <TouchableOpacity
                    key={`${result.lat}-${result.lng}-${index}`}
                    onPress={() => onSelectResult(result)}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                      gap: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderBottomWidth:
                        index < searchResults.length - 1 ? 1 : 0,
                      borderBottomColor: "#F3F4F6",
                    }}
                  >
                    <View style={{ marginTop: 2 }}>
                      <Icon name="location-outline" size={18} color="muted" />
                    </View>
                    <Text
                      className="flex-1 font-sans text-base text-primary-dark leading-5"
                      numberOfLines={2}
                    >
                      {result.formatted_address}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          )}
        </View>

        {/* GPS */}
        <TouchableOpacity
          onPress={onUseLocation}
          disabled={isGettingLocation}
          activeOpacity={0.7}
          style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
        >
          <Icon name="navigate-outline" variant="soft" size={20} containerSize={40} />
          {isGettingLocation ? (
            <ActivityIndicator color="#639922" />
          ) : (
            <Text className="font-sans-medium text-base text-primary-dark">
              Mi ubicación actual
            </Text>
          )}
        </TouchableOpacity>

        {/* Feedback permisos / errores */}
        {permissionDenied && (
          <View className="bg-warning-light rounded-xl p-3">
            <Text className="font-sans text-sm text-warning leading-5">
              Para usar tu ubicación, habilitá el permiso en Configuración del sistema.
            </Text>
          </View>
        )}
        {!!locationError && !permissionDenied && (
          <View className="bg-error-light rounded-xl p-3">
            <Text className="font-sans text-sm text-error leading-5">
              {locationError}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default AddressSearch;
