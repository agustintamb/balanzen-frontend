import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import AddressList from "@/components/AddressScreen/AddressList";
import AddressMap from "@/components/AddressScreen/AddressMap";
import AddressSearch from "@/components/AddressScreen/AddressSearch";
import { useAddressScreen } from "@/components/AddressScreen/useAddressScreen";
import ActionSheet from "@/components/ui/ActionSheet";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";

const AddressScreen = () => {
  const {
    mode,
    setMode,
    canGoBack,
    handleBack,
    // Buscador
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    isGettingLocation,
    permissionDenied,
    locationError,
    // Lista
    addresses,
    isLoadingAddresses,
    localSelectedId,
    canContinue,
    // Eliminación
    deletingAddressId,
    isDeleting,
    handlePressAddress,
    handleLongPressAddress,
    handleDeleteCancel,
    handleDeleteConfirm,
    // Mapa
    pendingAddress,
    region,
    isReverseGeocoding,
    isSaving,
    // Handlers
    handleUseCurrentLocation,
    handleSelectSearchResult,
    handleRegionChangeComplete,
    handleConfirmAddress,
    handleContinue,
    isSelecting,
  } = useAddressScreen();

  // ─── Modo mapa (pantalla completa) ──────────────────────────────────────────

  if (mode === "map") {
    return (
      <>
        <StatusBar style="dark" />
        <AddressMap
          region={region}
          pendingAddress={pendingAddress}
          isReverseGeocoding={isReverseGeocoding}
          isSaving={isSaving}
          onRegionChangeComplete={handleRegionChangeComplete}
          onConfirm={handleConfirmAddress}
          onBack={() => setMode("add")}
        />
      </>
    );
  }

  // ─── Modo buscador — "Ingresá tu dirección" ───────────────────────────────

  if (mode === "add") {
    return (
      <>
        <StatusBar style="dark" />
        <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <AddressSearch
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              searchResults={searchResults}
              isSearching={isSearching}
              isGettingLocation={isGettingLocation}
              permissionDenied={permissionDenied}
              locationError={locationError}
              onSelectResult={handleSelectSearchResult}
              onUseLocation={handleUseCurrentLocation}
              onBack={addresses.length > 0 ? () => setMode("list") : undefined}
            />
          </KeyboardAvoidingView>
        </SafeAreaView>
      </>
    );
  }

  // ─── Modo lista — "Mis Direcciones" ──────────────────────────────────────

  const deletingAddress = addresses.find((a) => a.id === deletingAddressId);

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 8,
              paddingTop: 20,
              paddingBottom: 8,
            }}
          >
            {canGoBack ? (
              <TouchableOpacity
                onPress={handleBack}
                style={{ padding: 8 }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icon name="chevron-left" size={24} color="primary-dark" />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 40 }} />
            )}
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 18,
                color: "#27500A",
                flex: 1,
                textAlign: "center",
              }}
            >
              Mis Direcciones
            </Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 20, paddingTop: 12, gap: 12 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Lista de direcciones */}
            <AddressList
              addresses={addresses}
              selectedId={localSelectedId}
              isLoading={isLoadingAddresses}
              onPressAddress={handlePressAddress}
              onLongPressAddress={handleLongPressAddress}
            />

            <View style={{ height: 8 }} />
          </ScrollView>

          {/* Footer fijo: "Agregar dirección" + "Guardar" */}
          <View
            style={{
              paddingHorizontal: 20,
              paddingBottom: 12,
              paddingTop: 8,
              gap: 10,
            }}
          >
            <Button
              variant="neutral"
              onPress={() => setMode("add")}
              leftIconName="plus"
            >
              Agregar dirección
            </Button>

            {addresses.length > 0 && (
              <Button
                disabled={!canContinue}
                loading={isSelecting}
                onPress={handleContinue}
              >
                Guardar
              </Button>
            )}
          </View>
        </KeyboardAvoidingView>

        {/* ActionSheet de confirmación de eliminación */}
        <ActionSheet
          visible={!!deletingAddressId}
          iconName="trash"
          iconColor="error"
          title="¿Eliminar dirección?"
          message={
            deletingAddress
              ? `"${deletingAddress.formatted_address}"\n\nEsta acción no se puede deshacer.`
              : "Esta acción no se puede deshacer."
          }
          confirmLabel="Sí, eliminar"
          confirmVariant="danger"
          onConfirm={handleDeleteConfirm}
          loading={isDeleting}
          cancelLabel="Cancelar"
          onCancel={handleDeleteCancel}
        />
      </SafeAreaView>
    </>
  );
};

export default AddressScreen;
