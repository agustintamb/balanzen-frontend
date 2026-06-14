import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export interface FilterSheetProps {
  visible: boolean;
  title?: string;
  onClose: () => void;
  onApply: () => void;
  onReset: () => void;
  children: React.ReactNode;
}

const FilterSheet = ({
  visible,
  title = "Filtros",
  onClose,
  onApply,
  onReset,
  children,
}: FilterSheetProps) => {
  const { bottom } = useSafeAreaInsets();
  const [shouldRender, setShouldRender] = useState(false);

  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 220,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: 240,
          useNativeDriver: true,
        }),
      ]).start(() => setShouldRender(false));
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!shouldRender) return null;

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      <TouchableWithoutFeedback
        onPress={onClose}
        testID="filter-sheet-backdrop"
      >
        <Animated.View
          style={[styles.backdrop, { opacity: backdropOpacity }]}
        />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.sheet,
          { paddingBottom: bottom + 20, transform: [{ translateY }] },
        ]}
        testID="filter-sheet"
      >
        <View style={styles.pill} />

        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity
            onPress={onReset}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            testID="filter-sheet-reset"
          >
            <Text style={styles.resetLink}>Restablecer</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ maxHeight: SCREEN_HEIGHT * 0.55 }}
        >
          <View style={styles.content}>{children}</View>
        </ScrollView>

        <Button variant="primary" onPress={onApply} testID="filter-sheet-apply">
          Aplicar filtros
        </Button>
      </Animated.View>
    </View>
  );
};

export default FilterSheet;

// ─── Filter section ───────────────────────────────────────────────────────────

export interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
}

export const FilterSection = ({ title, children }: FilterSectionProps) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

// ─── Filter option chips ──────────────────────────────────────────────────────

export interface FilterOptionChipsProps<T extends string = string> {
  options: { key: T; label: string }[];
  selected: T;
  onSelect: (key: T) => void;
}

export function FilterOptionChips<T extends string>({
  options,
  selected,
  onSelect,
}: Readonly<FilterOptionChipsProps<T>>) {
  return (
    <View style={styles.chipsContainer}>
      {options.map(({ key, label }) => (
        <TouchableOpacity
          key={key}
          onPress={() => onSelect(key)}
          activeOpacity={0.7}
          style={[styles.chip, selected === key && styles.chipActive]}
        >
          <Text
            style={[
              styles.chipLabel,
              selected === key && styles.chipLabelActive,
            ]}
          >
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Filter option list ───────────────────────────────────────────────────────

export interface FilterOptionListProps<T extends string = string> {
  options: { key: T; label: string }[];
  selected: T;
  onSelect: (key: T) => void;
}

export function FilterOptionList<T extends string>({
  options,
  selected,
  onSelect,
}: Readonly<FilterOptionListProps<T>>) {
  return (
    <View style={styles.listContainer}>
      {options.map(({ key, label }) => {
        const isSelected = selected === key;
        return (
          <TouchableOpacity
            key={key}
            onPress={() => onSelect(key)}
            activeOpacity={0.7}
            style={[styles.listItem, isSelected && styles.listItemActive]}
          >
            <Text
              style={[
                styles.listItemLabel,
                isSelected && styles.listItemLabelActive,
              ]}
            >
              {label}
            </Text>
            {isSelected && <Icon name="check" size={18} color="primary" />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Filter option row (legacy) ───────────────────────────────────────────────

export interface FilterOptionRowProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export const FilterOptionRow = ({
  label,
  selected,
  onPress,
}: FilterOptionRowProps) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={styles.optionRow}
  >
    <Text style={[styles.optionLabel, selected && styles.optionLabelActive]}>
      {label}
    </Text>
    <View style={[styles.optionCircle, selected && styles.optionCircleActive]}>
      {selected && (
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 11,
            fontFamily: "Inter_700Bold",
          }}
        >
          ✓
        </Text>
      )}
    </View>
  </TouchableOpacity>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 12,
  },
  pill: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E7EB",
    alignSelf: "center",
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: "#27500A",
  },
  resetLink: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: "#639922",
  },
  content: {
    width: "100%",
    marginBottom: 20,
  },
  section: {
    marginBottom: 4,
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    paddingTop: 12,
    paddingBottom: 2,
  },
  listContainer: {
    gap: 8,
    paddingTop: 10,
    paddingBottom: 4,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  listItemActive: {
    backgroundColor: "#EAF3DE",
    borderColor: "#639922",
  },
  listItemLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#374151",
  },
  listItemLabelActive: {
    fontFamily: "Inter_500Medium",
    color: "#27500A",
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingTop: 10,
    paddingBottom: 4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  chipActive: {
    backgroundColor: "#639922",
    borderColor: "#639922",
  },
  chipLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: "#374151",
  },
  chipLabelActive: {
    color: "#FFFFFF",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  optionLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#374151",
  },
  optionLabelActive: {
    fontFamily: "Inter_600SemiBold",
    color: "#27500A",
  },
  optionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  optionCircleActive: {
    backgroundColor: "#639922",
    borderColor: "#639922",
  },
});
