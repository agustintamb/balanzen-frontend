import { useState } from "react";
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Controller } from "react-hook-form";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import Input from "@/components/ui/Input";
import UserAvatar from "@/components/UserAvatar";
import { useEditProfileScreen } from "./useEditProfileScreen";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const EditProfile = () => {
  const [viewerVisible, setViewerVisible] = useState(false);

  const {
    control,
    isDirty,
    isValid,
    isSubmitting,
    isPhotoUploading,
    isCommerce,
    androidKeyboardPad,
    displayPhotoUrl,
    displayPhotoFullUrl,
    initials,
    businessNameRef,
    firstNameRef,
    lastNameRef,
    emailRef,
    phoneRef,
    descriptionRef,
    handleBack,
    handleAvatarPress,
    handleSave,
  } = useEditProfileScreen();

  const canSave = isDirty && isValid && !isPhotoUploading;

  const formContent = (
    <>
      <ScrollView
        style={{ flex: 1 }}
        className="bg-surface"
        contentContainerClassName="px-4 pt-6 pb-4 gap-4"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {isCommerce && (
          <Controller
            control={control}
            name="business_name"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <Input
                ref={businessNameRef}
                label="Nombre del comercio"
                value={value ?? ""}
                onChangeText={onChange}
                placeholder="Tu comercio"
                autoCapitalize="words"
                leftIcon={<Icon name="briefcase" size={18} color="muted" />}
                error={error?.message}
                returnKeyType="next"
                onSubmitEditing={() => firstNameRef.current?.focus()}
                testID="input-business-name"
              />
            )}
          />
        )}

        <Controller
          control={control}
          name="first_name"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <Input
              ref={isCommerce ? firstNameRef : undefined}
              label="Nombre"
              value={value}
              onChangeText={onChange}
              placeholder="Tu nombre"
              autoCapitalize="words"
              leftIcon={<Icon name="user" size={18} color="muted" />}
              error={error?.message}
              returnKeyType="next"
              onSubmitEditing={() => lastNameRef.current?.focus()}
              testID="input-first-name"
            />
          )}
        />

        <Controller
          control={control}
          name="last_name"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <Input
              ref={lastNameRef}
              label="Apellido"
              value={value}
              onChangeText={onChange}
              placeholder="Tu apellido"
              autoCapitalize="words"
              leftIcon={<Icon name="user" size={18} color="muted" />}
              error={error?.message}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              testID="input-last-name"
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <Input
              ref={emailRef}
              label="Email"
              value={value}
              onChangeText={onChange}
              placeholder="correo@ejemplo.com"
              type="email"
              leftIcon={<Icon name="mail" size={18} color="muted" />}
              error={error?.message}
              returnKeyType="next"
              onSubmitEditing={() => phoneRef.current?.focus()}
              testID="input-email"
            />
          )}
        />

        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <Input
              ref={phoneRef}
              label="Teléfono"
              value={value}
              onChangeText={(text) => onChange(text.replace(/\D/g, ""))}
              placeholder="1155667788"
              type="phone"
              leftIcon={<Icon name="phone" size={18} color="muted" />}
              error={error?.message}
              returnKeyType={isCommerce ? "next" : "done"}
              onSubmitEditing={
                isCommerce ? () => descriptionRef.current?.focus() : undefined
              }
              testID="input-phone"
            />
          )}
        />

        {isCommerce && (
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <Input
                ref={descriptionRef}
                label="Descripción"
                value={value ?? ""}
                onChangeText={onChange}
                placeholder="Contá algo sobre tu negocio…"
                leftIcon={<Icon name="file-text" size={18} color="muted" />}
                multiline
                numberOfLines={5}
                error={error?.message}
                testID="input-description"
              />
            )}
          />
        )}

      </ScrollView>

      <SafeAreaView edges={["bottom", "left", "right"]} className="bg-surface">
        <View className="px-4 pt-3 pb-2">
          <Button
            onPress={handleSave}
            disabled={!canSave}
            loading={isSubmitting}
            testID="btn-save-profile"
          >
            Guardar
          </Button>
        </View>
      </SafeAreaView>
    </>
  );

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView edges={["top", "left", "right"]} className="bg-white">
        <View className="flex-row items-center px-2 pt-2 pb-1">
          <TouchableOpacity
            onPress={handleBack}
            className="p-2"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            testID="btn-back"
          >
            <Icon name="chevron-left" size={24} color="primary-dark" />
          </TouchableOpacity>
          <Text className="flex-1 text-center font-sans-semibold text-lg text-primary-dark">
            Editar Perfil
          </Text>
          <View className="w-10" />
        </View>

        <View className="items-center pt-6 pb-8">
          <UserAvatar
            photoUrl={displayPhotoUrl}
            initials={initials}
            size={128}
            isLoading={isPhotoUploading}
            editable
            onPress={
              displayPhotoFullUrl && !isPhotoUploading
                ? () => setViewerVisible(true)
                : undefined
            }
            onEditPress={handleAvatarPress}
            testID="edit-profile-avatar"
          />
        </View>
      </SafeAreaView>

      {displayPhotoFullUrl !== null && (
        <Modal
          visible={viewerVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setViewerVisible(false)}
        >
          <StatusBar style="light" />
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.92)",
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => setViewerVisible(false)}
            activeOpacity={1}
            testID="photo-viewer-backdrop"
          >
            <Image
              source={{ uri: displayPhotoFullUrl }}
              style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }}
              resizeMode="contain"
              testID="photo-viewer-image"
            />
          </TouchableOpacity>
        </Modal>
      )}

      {Platform.OS === "ios" ? (
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
          {formContent}
        </KeyboardAvoidingView>
      ) : (
        <View style={{ flex: 1, paddingBottom: androidKeyboardPad }}>
          {formContent}
        </View>
      )}
    </>
  );
};

export default EditProfile;
