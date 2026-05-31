import React, { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type TextInputProps,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { cn } from "@/utils/cn";

type InputType = "text" | "email" | "password" | "number" | "phone";

export interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  type?: InputType;
  label?: string;
  leftIcon?: React.ReactNode;
  hint?: string;
  error?: string;
  disabled?: boolean;
  returnKeyType?: TextInputProps["returnKeyType"];
  onSubmitEditing?: () => void;
  autoCapitalize?: TextInputProps["autoCapitalize"];
  className?: string;
  testID?: string;
}

const TYPE_CONFIG: Record<InputType, Partial<TextInputProps>> = {
  text: {},
  email: {
    keyboardType: "email-address",
    autoCapitalize: "none",
    autoCorrect: false,
  },
  password: { autoCapitalize: "none", autoCorrect: false },
  number: { keyboardType: "numeric" },
  phone: { keyboardType: "phone-pad" },
};

const Input = React.forwardRef<TextInput, InputProps>(
  (
    {
      value,
      onChangeText,
      placeholder,
      type = "text",
      label,
      leftIcon,
      hint,
      error,
      disabled = false,
      returnKeyType,
      onSubmitEditing,
      autoCapitalize,
      className,
      testID,
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const typeConfig = TYPE_CONFIG[type];
    const isPassword = type === "password";

    let borderClass = "border-gray-200";
    if (error) borderClass = "border-error";
    else if (isFocused) borderClass = "border-primary";

    const containerClass = cn(
      "bg-white rounded-2xl border px-4 flex-row items-center",
      borderClass,
      disabled ? "bg-surface opacity-70" : "",
      className,
    );

    return (
      <View testID={testID}>
        {!!label && (
          <Text className="font-sans-medium text-xs text-gray-500 uppercase tracking-wider mb-1.5">
            {label}
          </Text>
        )}
        <View className={containerClass}>
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          <TextInput
            ref={ref}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            className="flex-1 font-sans text-base text-primary-dark"
            style={{ paddingVertical: 14, paddingHorizontal: 0 }}
            editable={!disabled}
            secureTextEntry={isPassword && !isPasswordVisible}
            returnKeyType={returnKeyType}
            onSubmitEditing={onSubmitEditing}
            autoCapitalize={autoCapitalize ?? typeConfig.autoCapitalize}
            autoCorrect={typeConfig.autoCorrect}
            keyboardType={typeConfig.keyboardType}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          {isPassword && (
            <TouchableOpacity
              onPress={() => setIsPasswordVisible((v) => !v)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather
                name={isPasswordVisible ? "eye" : "eye-off"}
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          )}
        </View>
        {(error ?? hint) ? (
          <Text
            className={cn(
              "mt-1 ml-1 font-sans text-xs",
              error ? "text-error" : "text-gray-400",
            )}
          >
            {error ?? hint}
          </Text>
        ) : null}
      </View>
    );
  },
);

Input.displayName = "Input";

export default Input;
