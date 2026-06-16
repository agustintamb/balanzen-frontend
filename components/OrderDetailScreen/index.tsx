import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import DeliverySuccess from "@/components/ProductDetail/DeliverySuccess";
import DetailCounterpartRow from "@/components/ProductDetail/DetailCounterpartRow";
import DetailHeaderActions from "@/components/ProductDetail/DetailHeaderActions";
import ProductDetailLayout from "@/components/ProductDetail/ProductDetailLayout";
import StatusNoticeBanner from "@/components/ProductDetail/StatusNoticeBanner";
import ActionSheet from "@/components/ui/ActionSheet";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { useOrderDetailScreen } from "./useOrderDetailScreen";

const CancelButton = ({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-error px-5 py-4"
    testID="btn-cancel"
  >
    <Icon name="x-circle" size={18} color="error" />
    <Text className="font-sans-semibold text-base text-error">{label}</Text>
  </TouchableOpacity>
);

const OrderDetailScreen = () => {
  const {
    isLoading,
    publication,
    showFavoriteShare,
    isFavorite,
    counterpart,
    infoItems,
    footerKind,
    statusNotice,
    hasUnreadChat,
    isCancelling,
    isDelivering,
    isRefetching,
    cancelVisible,
    deliverVisible,
    successVisible,
    handleBack,
    handleRefresh,
    handleChat,
    handleToggleFavorite,
    handleShare,
    handleCancelPress,
    handleCloseCancel,
    confirmCancel,
    handleDeliverPress,
    handleCloseDeliver,
    confirmDeliver,
    handleSuccessDone,
  } = useOrderDetailScreen();

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
          avatarUrl={counterpart.avatarUrl}
          chatEnabled={counterpart.chatEnabled}
          hasUnread={hasUnreadChat}
          onChatPress={handleChat}
        />
      }
      footer={
        footerKind !== "none" ? (
          <SafeAreaView
            edges={["bottom", "left", "right"]}
            className="bg-white"
          >
            <View className="flex-row items-center gap-3 border-t border-surface-dark px-5 pb-2 pt-3">
              {footerKind === "consumer-cancel" && (
                <CancelButton
                  label="Cancelar mi reserva"
                  onPress={handleCancelPress}
                />
              )}
              {footerKind === "commerce-actions" && (
                <>
                  <CancelButton
                    label="Cancelar reserva"
                    onPress={handleCancelPress}
                  />
                  <View className="flex-1">
                    <Button
                      onPress={handleDeliverPress}
                      leftIconName="package"
                      testID="btn-deliver"
                    >
                      Entregar pedido
                    </Button>
                  </View>
                </>
              )}
            </View>
          </SafeAreaView>
        ) : statusNotice ? (
          <StatusNoticeBanner {...statusNotice} />
        ) : null
      }
    >
      <ActionSheet
        visible={cancelVisible}
        iconName="x-circle"
        iconColor="error"
        title="¿Cancelar la reserva?"
        message="El producto volverá a estar disponible para otros usuarios."
        confirmLabel="Sí, cancelar"
        confirmVariant="danger"
        loading={isCancelling}
        onConfirm={confirmCancel}
        onCancel={handleCloseCancel}
      />

      <ActionSheet
        visible={deliverVisible}
        iconName="package"
        iconColor="primary"
        title="¿Marcar como entregado?"
        message="Confirmás que el pedido fue retirado por el consumidor. La publicación quedará entregada."
        confirmLabel="Sí, entregado"
        confirmVariant="primary"
        loading={isDelivering}
        onConfirm={confirmDeliver}
        onCancel={handleCloseDeliver}
      />

      <DeliverySuccess visible={successVisible} onDone={handleSuccessDone} />
    </ProductDetailLayout>
  );
};

export default OrderDetailScreen;
