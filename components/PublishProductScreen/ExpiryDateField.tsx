import { useState } from "react";
import { Text, TouchableOpacity } from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import Icon from "@/components/ui/Icon";
import { cn } from "@/utils/cn";

interface ExpiryDateFieldProps {
  value: Date | null;
  onChange: (date: Date) => void;
}

const formatDate = (date: Date): string => {
  const day = `${date.getDate()}`.padStart(2, "0");
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
};

const ExpiryDateField = ({ value, onChange }: ExpiryDateFieldProps) => {
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  const handleChange = (event: DateTimePickerEvent, selected?: Date) => {
    setIsPickerVisible(false);
    if (event.type === "set" && selected) onChange(selected);
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsPickerVisible(true)}
        activeOpacity={0.7}
        className="flex-row items-center rounded-2xl border border-gray-200 bg-white px-4 py-4"
        testID="expiry-date-field"
      >
        <Icon name="calendar" size={18} color="muted" />
        <Text
          className={cn(
            "ml-2 flex-1 font-sans text-base",
            value ? "text-primary-dark" : "text-gray-400",
          )}
        >
          {value ? formatDate(value) : "Fecha de vencimiento"}
        </Text>
      </TouchableOpacity>

      {isPickerVisible && (
        <DateTimePicker
          value={value ?? new Date()}
          mode="date"
          minimumDate={new Date()}
          onChange={handleChange}
        />
      )}
    </>
  );
};

export default ExpiryDateField;
