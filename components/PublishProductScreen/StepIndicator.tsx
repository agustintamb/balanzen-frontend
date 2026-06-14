import { Fragment } from "react";
import { Text, View } from "react-native";
import Icon from "@/components/ui/Icon";
import { cn } from "@/utils/cn";

interface StepIndicatorProps {
  currentStep: 1 | 2;
}

const STEPS = [
  { n: 1, label: "Información" },
  { n: 2, label: "Precio y stock" },
] as const;

const StepIndicator = ({ currentStep }: StepIndicatorProps) => (
  <View className="flex-row items-center px-4 py-3">
    {STEPS.map((step, index) => {
      const isDone = step.n < currentStep;
      const isActive = step.n === currentStep;
      const isActiveOrDone = isDone || isActive;

      return (
        <Fragment key={step.n}>
          <View className="flex-row items-center">
            <View
              className={cn(
                "h-6 w-6 items-center justify-center rounded-full",
                isActiveOrDone ? "bg-primary" : "bg-surface-dark",
              )}
            >
              {isDone ? (
                <Icon name="check" size={14} color="white" />
              ) : (
                <Text
                  className={cn(
                    "font-sans-bold text-xs",
                    isActive ? "text-white" : "text-gray-400",
                  )}
                >
                  {step.n}
                </Text>
              )}
            </View>
            <Text
              className={cn(
                "ml-2 font-sans-medium text-sm",
                isActiveOrDone ? "text-primary" : "text-gray-400",
              )}
            >
              {step.label}
            </Text>
          </View>

          {index === 0 && (
            <View
              className={cn(
                "mx-3 h-[2px] flex-1",
                currentStep >= 2 ? "bg-primary" : "bg-surface-dark",
              )}
            />
          )}
        </Fragment>
      );
    })}
  </View>
);

export default StepIndicator;
