import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { AddressInput } from "@/api/addresses/addresses.types";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { SafeMapView } from "./SafeMapView";

export type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

interface AddressMapProps {
  region: Region;
  pendingAddress: AddressInput | null;
  isReverseGeocoding: boolean;
  isSaving: boolean;
  onRegionChangeComplete: (region: Region) => void;
  onConfirm: () => void;
  onBack: () => void;
}

const AddressMap = ({
  region,
  pendingAddress,
  isReverseGeocoding,
  isSaving,
  onRegionChangeComplete,
  onConfirm,
  onBack,
}: AddressMapProps) => (
  <View style={{ flex: 1 }}>
    <SafeMapView
      style={StyleSheet.absoluteFillObject}
      initialRegion={region}
      region={region}
      onRegionChangeComplete={onRegionChangeComplete}
      showsUserLocation
      showsMyLocationButton={false}
    />

    {/* Pin fijo en el centro */}
    <View
      style={[StyleSheet.absoluteFillObject, styles.pinContainer]}
      pointerEvents="none"
    >
      <View style={styles.pin} />
    </View>

    {/* Botón de retroceso superpuesto */}
    <SafeAreaView edges={["top"]} style={styles.topOverlay}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Icon name="arrow-left" size={20} color="primary-dark" />
      </TouchableOpacity>
    </SafeAreaView>

    {/* Panel inferior de confirmación */}
    <View style={styles.bottomPanel}>
      <SafeAreaView
        edges={["bottom"]}
        style={{
          backgroundColor: "#F1EFE8",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        }}
      >
        <View style={styles.bottomContent}>
          <Text className="font-sans-bold text-xl text-primary-dark">
            Confirmá tu ubicación
          </Text>

          {pendingAddress && (
            <View className="bg-white rounded-2xl px-4 py-3 flex-row items-start gap-2">
              <View style={{ marginTop: 2 }}>
                <Icon name="map-pin" size={18} />
              </View>
              <Text
                className="flex-1 font-sans text-sm text-primary-dark leading-5"
                numberOfLines={2}
              >
                {isReverseGeocoding
                  ? "Buscando dirección..."
                  : pendingAddress.formatted_address}
              </Text>
            </View>
          )}

          <Button
            loading={isSaving}
            disabled={!pendingAddress || isReverseGeocoding}
            onPress={onConfirm}
          >
            Confirmar
          </Button>
        </View>
      </SafeAreaView>
    </View>
  </View>
);

export default AddressMap;

const styles = StyleSheet.create({
  pinContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  pin: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#1a1a1a",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 5,
  },
  topOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  backButton: {
    margin: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  bottomContent: {
    padding: 20,
    paddingTop: 16,
    gap: 16,
  },
});
