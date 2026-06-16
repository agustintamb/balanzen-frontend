import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type ListRenderItemInfo,
} from "react-native";
import {
  KeyboardAvoidingView,
  useReanimatedKeyboardAnimation,
} from "react-native-keyboard-controller";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import AppRefreshControl from "@/components/ui/AppRefreshControl";
import Icon from "@/components/ui/Icon";
import UserAvatar from "@/components/UserAvatar";
import MessageBubble from "./MessageBubble";
import TypingBubble from "./TypingBubble";
import { useChatScreen, type ChatBubble } from "./useChatScreen";

const renderItem = ({ item }: ListRenderItemInfo<ChatBubble>) => (
  <MessageBubble message={item} />
);

const ChatScreen = () => {
  const {
    isLoading,
    isRefreshing,
    counterpartName,
    counterpartInitials,
    counterpartPhotoUrl,
    isOtherTyping,
    messages,
    draft,
    isSending,
    isAttaching,
    onChangeDraft,
    handleSend,
    handleAttach,
    handleRefresh,
    handleBack,
  } = useChatScreen();

  const insets = useSafeAreaInsets();
  const { progress } = useReanimatedKeyboardAnimation();
  const canSend = draft.trim().length > 0 && !isSending;

  const inputBarStyle = useAnimatedStyle(() => ({
    paddingBottom: 8 + insets.bottom * (1 - progress.value),
  }));

  return (
    <View className="flex-1 bg-surface">
      <StatusBar style="dark" />

      <SafeAreaView edges={["top", "left", "right"]} className="bg-white">
        <View className="flex-row items-center gap-2.5 border-b border-surface-dark px-3 py-2.5">
          <TouchableOpacity
            onPress={handleBack}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="p-1"
            testID="btn-back"
          >
            <Icon name="arrow-left" size={22} color="primary-dark" />
          </TouchableOpacity>

          <UserAvatar
            photoUrl={counterpartPhotoUrl}
            initials={counterpartInitials}
            size={38}
          />

          <Text
            className="flex-1 font-sans-semibold text-base text-black"
            numberOfLines={1}
          >
            {counterpartName}
          </Text>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#639922" />
          </View>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View className="h-2" />}
            contentContainerStyle={{ padding: 16, flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={isOtherTyping ? <TypingBubble /> : null}
            refreshControl={
              <AppRefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
              />
            }
            testID="messages-list"
          />
        )}

        <Animated.View style={[styles.inputBar, inputBarStyle]}>
          <TouchableOpacity
            onPress={handleAttach}
            disabled={isAttaching}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="h-10 w-10 items-center justify-center rounded-full bg-surface"
            testID="btn-attach"
          >
            {isAttaching ? (
              <ActivityIndicator size="small" color="#639922" />
            ) : (
              <Icon name="paperclip" size={20} color="primary" />
            )}
          </TouchableOpacity>

          <TextInput
            value={draft}
            onChangeText={onChangeDraft}
            placeholder="Escribí un mensaje..."
            placeholderTextColor="#9CA3AF"
            multiline
            className="max-h-24 flex-1 rounded-2xl bg-surface px-4 py-2.5 font-sans text-sm text-primary-dark"
            testID="chat-input"
          />

          <TouchableOpacity
            onPress={handleSend}
            disabled={!canSend}
            activeOpacity={0.8}
            className={
              canSend
                ? "rounded-full bg-primary p-3"
                : "rounded-full bg-surface-dark p-3"
            }
            testID="btn-send"
          >
            <Icon name="send" size={18} color={canSend ? "white" : "muted"} />
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#E3E0D8",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingTop: 8,
  },
});

export default ChatScreen;
