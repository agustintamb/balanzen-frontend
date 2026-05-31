import { ScrollView, Text, View } from "react-native";
import type { UserRole } from "@/api/users/users.types";
import Banner from "@/components/Banner";
import Button from "@/components/ui/Button";
import RoleCard, { type RoleOption } from "../RoleCard";
import { useRegisterRoleSection } from "./useRegisterRoleSection";

const ROLES: RoleOption[] = [
  {
    id: "CONSUMIDOR",
    iconName: "user",
    title: "Soy consumidor",
    description: "Explorá alimentos frescos a precios increíbles.",
    benefits: ["Ofertas cercanas", "Hasta 70% off", "Sin desperdicio"],
  },
  {
    id: "COMERCIO",
    iconName: "shopping-bag",
    title: "Soy comercio",
    description: "Publicá excedentes y reducí las pérdidas del negocio.",
    benefits: ["Menos pérdidas", "Más clientes", "Impacto positivo"],
  },
];

interface RegisterRoleSectionProps {
  onContinue: (role: UserRole) => void;
  onSwitchToLogin: () => void;
}

const RegisterRoleSection = ({
  onContinue,
  onSwitchToLogin,
}: RegisterRoleSectionProps) => {
  const { selectedRole, setSelectedRole } = useRegisterRoleSection();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Banner />
        <View style={{ padding: 20, paddingTop: 24, gap: 24 }}>
          <View style={{ gap: 4 }}>
            <Text className="font-sans-bold text-xl text-primary-dark">
              ¿Cómo querés usar BalanZen?
            </Text>
            <Text className="font-sans text-sm text-gray-500">
              Elegí tu perfil para personalizar tu experiencia
            </Text>
          </View>

          <View style={{ gap: 16 }}>
            {ROLES.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                selected={selectedRole === role.id}
                onPress={() => setSelectedRole(role.id)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Botón siempre visible al pie */}
      <View style={{ padding: 20, paddingTop: 12, gap: 12 }}>
        <Button
          disabled={!selectedRole}
          onPress={() => selectedRole && onContinue(selectedRole)}
          rightIconName="arrow-right"
        >
          Continuar
        </Button>
        <View className="flex-row items-center justify-center">
          <Text className="font-sans text-sm text-gray-500">
            ¿Ya tenés cuenta?{" "}
          </Text>
          <Button variant="textLink" size="sm" onPress={onSwitchToLogin}>
            Iniciar sesión
          </Button>
        </View>
      </View>
    </View>
  );
};

export default RegisterRoleSection;
