import { Text, TouchableOpacity, View } from "react-native";
import type { Category } from "@/api/categories/categories.types";
import Icon from "@/components/ui/Icon";
import { cn } from "@/utils/cn";

interface CategorySelectorProps {
  categories: Category[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const CategorySelector = ({
  categories,
  selectedId,
  onSelect,
}: CategorySelectorProps) => (
  <View>
    <View className="mb-2 flex-row items-center gap-1.5">
      <Icon name="tag" size={16} color="primary" />
      <Text className="font-sans-semibold text-sm text-primary-dark">
        Categoría
      </Text>
    </View>

    <View className="flex-row flex-wrap gap-2">
      {categories.map((category) => {
        const isSelected = category.id === selectedId;
        return (
          <TouchableOpacity
            key={category.id}
            onPress={() => onSelect(category.id)}
            activeOpacity={0.7}
            className={cn(
              "rounded-full border px-4 py-2",
              isSelected
                ? "border-primary bg-primary"
                : "border-gray-200 bg-white",
            )}
            testID={`category-chip-${category.id}`}
          >
            <Text
              className={cn(
                "font-sans-medium text-sm",
                isSelected ? "text-white" : "text-primary-dark",
              )}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

export default CategorySelector;
