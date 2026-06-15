import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import DeliverySuccess from "@/components/ProductDetail/DeliverySuccess";
import DetailBody from "@/components/ProductDetail/DetailBody";
import DetailCounterpartRow from "@/components/ProductDetail/DetailCounterpartRow";
import DetailHeaderActions from "@/components/ProductDetail/DetailHeaderActions";
import DetailImageCarousel from "@/components/ProductDetail/DetailImageCarousel";
import DetailInfoCard from "@/components/ProductDetail/DetailInfoCard";
import ActionSheet from "@/components/ui/ActionSheet";
import AppRefreshControl from "@/components/ui/AppRefreshControl";
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
    <View className="flex-1 bg-white">
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <AppRefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
          />
        }
      >
        <DetailImageCarousel
          photos={publication.photos}
          onBack={handleBack}
          rightActions={
            showFavoriteShare ? (
              <DetailHeaderActions
                isFavorite={isFavorite}
                onToggleFavorite={handleToggleFavorite}
                onShare={handleShare}
              />
            ) : undefined
          }
        />

        <View className="gap-5 px-5 pt-5">
          <DetailCounterpartRow
            title={counterpart.title}
            subtitle={counterpart.subtitle}
            initials={counterpart.initials}
            avatarUrl={counterpart.avatarUrl}
            chatEnabled={counterpart.chatEnabled}
            onChatPress={handleChat}
          />
          <DetailBody publication={publication} />
          <DetailInfoCard items={infoItems} />
        </View>
      </ScrollView>

      {footerKind !== "none" && (
        <SafeAreaView edges={["bottom", "left", "right"]} className="bg-white">
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
      )}

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
    </View>
  );
};

export default OrderDetailScreen;
