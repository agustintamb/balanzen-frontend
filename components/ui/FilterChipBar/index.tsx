import { ScrollView, Text, TouchableOpacity } from "react-native";
import { cn } from "@/utils/cn";

export interface FilterOption<T extends string = string> {
  key: T;
  label: string;
}

interface FilterChipBarProps<T extends string> {
  filters: FilterOption<T>[];
  activeFilter: T;
  onFilterChange: (key: T) => void;
}

function FilterChipBar<T extends string>({
  filters,
  activeFilter,
  onFilterChange,
}: FilterChipBarProps<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ flexGrow: 0, paddingVertical: 10 }}
      contentContainerStyle={{
        paddingHorizontal: 16,
        gap: 6,
        alignItems: "center",
      }}
    >
      {filters.map(({ key, label }) => {
        const isSelected = activeFilter === key;
        return (
          <TouchableOpacity
            key={key}
            onPress={() => onFilterChange(key)}
            className={cn(
              "rounded-full px-3 py-2 border",
              isSelected
                ? "bg-primary border-primary"
                : "bg-white border-gray-200",
            )}
            activeOpacity={0.75}
            testID={`filter-${key}`}
          >
            <Text
              className={cn(
                "font-sans-medium text-sm",
                isSelected ? "text-white" : "text-gray-500",
              )}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

export default FilterChipBar;
