import { Text, TouchableOpacity, View } from "react-native";
import {
  KeyboardAvoidingView,
  KeyboardAwareScrollView,
} from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import PublishSuccess from "./PublishSuccess";
import Step1Info from "./Step1Info";
import Step2Price from "./Step2Price";
import StepIndicator from "./StepIndicator";
import { usePublishProductScreen } from "./usePublishProductScreen";

const PublishProductScreen = () => {
  const {
    headerTitle,
    control,
    step,
    photos,
    sortedCategories,
    selectedCategoryId,
    expiryDate,
    isDonation,
    isUploadingPhotos,
    isSubmitting,
    showSuccess,
    ctaLabel,
    ctaDisabled,
    onCtaPress,
    handleBack,
    handlePickPhoto,
    handleRemovePhoto,
    handleSelectCategory,
    handleSelectDate,
    handleToggleDonation,
    handleChangeFinalPrice,
    handleChangeOriginalPrice,
    handleSuccessDone,
  } = usePublishProductScreen();

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView edges={["top", "left", "right"]} className="bg-white">
        <View className="flex-row items-center px-2 pb-2 pt-4">
          <TouchableOpacity
            onPress={handleBack}
            className="p-2"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            testID="btn-back"
          >
            <Icon name="chevron-left" size={24} color="primary-dark" />
          </TouchableOpacity>
          <Text className="flex-1 text-center font-sans-semibold text-lg text-primary-dark">
            {headerTitle}
          </Text>
          <View className="w-10" />
        </View>
        <StepIndicator currentStep={step} />
      </SafeAreaView>

      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 16,
            paddingTop: 20,
            paddingBottom: 24,
          }}
          className="bg-surface"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bottomOffset={16}
        >
          {step === 1 ? (
            <Step1Info
              control={control}
              photos={photos}
              isUploadingPhotos={isUploadingPhotos}
              onPickPhoto={handlePickPhoto}
              onRemovePhoto={handleRemovePhoto}
              expiryDate={expiryDate}
              onSelectDate={handleSelectDate}
              categories={sortedCategories}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={handleSelectCategory}
            />
          ) : (
            <Step2Price
              control={control}
              isDonation={isDonation}
              onToggleDonation={handleToggleDonation}
              onChangeFinalPrice={handleChangeFinalPrice}
              onChangeOriginalPrice={handleChangeOriginalPrice}
            />
          )}
        </KeyboardAwareScrollView>

        <SafeAreaView
          edges={["bottom", "left", "right"]}
          className="bg-surface"
        >
          <View className="px-4 pb-2 pt-3">
            <Button
              onPress={onCtaPress}
              disabled={ctaDisabled}
              loading={isSubmitting}
              testID="btn-cta"
            >
              {ctaLabel}
            </Button>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>

      <PublishSuccess visible={showSuccess} onDone={handleSuccessDone} />
    </>
  );
};

export default PublishProductScreen;
