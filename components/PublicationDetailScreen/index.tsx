import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import DetailCounterpartRow from "@/components/ProductDetail/DetailCounterpartRow";
import DetailHeaderActions from "@/components/ProductDetail/DetailHeaderActions";
import ProductDetailLayout from "@/components/ProductDetail/ProductDetailLayout";
import ActionSheet from "@/components/ui/ActionSheet";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { usePublicationDetailScreen } from "./usePublicationDetailScreen";

const PublicationDetailScreen = () => {
  const {
    isLoading,
    publication,
    showFavoriteShare,
    isFavorite,
    counterpart,
    infoItems,
    footerKind,
    isReserving,
    isDeleting,
    isRefetching,
    reserveVisible,
    deleteVisible,
    handleBack,
    handleRefresh,
    handleToggleFavorite,
    handleShare,
    handleReservePress,
    handleCloseReserve,
    confirmReserve,
    handleDeletePress,
    handleCloseDelete,
    confirmDelete,
    handleEdit,
  } = usePublicationDetailScreen();

  if (isLoading || !publication || !counterpart) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#639922" />
      </View>
    );
  }

  return (
    <ProductDetailLayout
      publication={publication}
      onBack={handleBack}
      isRefreshing={isRefetching}
      onRefresh={handleRefresh}
      infoItems={infoItems}
      headerActions={
        showFavoriteShare ? (
          <DetailHeaderActions
            isFavorite={isFavorite}
            onToggleFavorite={handleToggleFavorite}
            onShare={handleShare}
          />
        ) : undefined
      }
      counterpart={
        <DetailCounterpartRow
          title={counterpart.title}
          subtitle={counterpart.subtitle}
          initials={counterpart.initials}
          leftIcon={counterpart.leftIcon}
          chatEnabled={counterpart.chatEnabled}
        />
      }
      footer={
        footerKind !== "none" ? (
          <SafeAreaView
            edges={["bottom", "left", "right"]}
            className="bg-white"
          >
            <View className="border-t border-surface-dark px-5 pb-2 pt-3">
              {footerKind === "reserve" && (
                <Button
                  onPress={handleReservePress}
                  leftIconName="shopping-bag"
                  testID="btn-reserve"
                >
                  Reservar ahora
                </Button>
              )}
              {footerKind === "commerce" && (
                <View className="flex-row items-center gap-3">
                  <TouchableOpacity
                    onPress={handleDeletePress}
                    activeOpacity={0.8}
                    className="flex-row items-center justify-center gap-2 rounded-2xl border border-error px-5 py-4"
                    testID="btn-delete"
                  >
                    <Icon name="trash-2" size={18} color="error" />
                    <Text className="font-sans-semibold text-base text-error">
                      Eliminar
                    </Text>
                  </TouchableOpacity>
                  <View className="flex-1">
                    <Button
                      onPress={handleEdit}
                      leftIconName="edit-2"
                      testID="btn-edit"
                    >
                      Editar publicación
                    </Button>
                  </View>
                </View>
              )}
            </View>
          </SafeAreaView>
        ) : null
      }
    >
      <ActionSheet
        visible={reserveVisible}
        iconName="shopping-bag"
        iconColor="primary"
        title="Confirmar reserva"
        message="Estás por reservar este producto. Podrás cancelar antes de retirarlo."
        confirmLabel="Reservar ahora"
        confirmVariant="primary"
        loading={isReserving}
        onConfirm={confirmReserve}
        onCancel={handleCloseReserve}
      />

      <ActionSheet
        visible={deleteVisible}
        iconName="alert-triangle"
        iconColor="error"
        title="¿Eliminar publicación?"
        message="Esta acción no se puede deshacer."
        confirmLabel="Sí, eliminar"
        confirmVariant="danger"
        loading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={handleCloseDelete}
      />
    </ProductDetailLayout>
  );
};

export default PublicationDetailScreen;
