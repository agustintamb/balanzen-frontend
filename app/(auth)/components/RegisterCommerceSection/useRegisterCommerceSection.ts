import { router } from "expo-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRegister } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/auth.store";
import { useRegistrationStore } from "@/stores/registration.store";
import { persistSession } from "@/utils/auth";
import { CUIT_REGEX } from "@/utils/validation";
import type { CommerceFormValues } from "../CommerceForm";

// superRefine garantiza que el error se propague correctamente en Zod v4
export const commerceRegistrationSchema = z
  .object({
    businessName: z.string().min(2, "Ingresá el nombre del comercio"),
    cuit: z.string().min(1, "Ingresá el CUIT"),
    acceptTerms: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.cuit && !CUIT_REGEX.test(data.cuit)) {
      ctx.addIssue({
        code: "custom",
        message: "Formato inválido (XX-XXXXXXXX-X)",
        path: ["cuit"],
      });
    }
    if (!data.acceptTerms) {
      ctx.addIssue({
        code: "custom",
        message: "Debés aceptar los términos",
        path: ["acceptTerms"],
      });
    }
  });

export const useRegisterCommerceSection = () => {
  const personalData = useRegistrationStore((s) => s.personalData);
  const clear = useRegistrationStore((s) => s.clear);
  const { setUser, setAccessToken } = useAuthStore();
  const { mutate, isPending } = useRegister();

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<CommerceFormValues>({
    resolver: zodResolver(commerceRegistrationSchema),
    mode: "onChange",
    defaultValues: { businessName: "", cuit: "", acceptTerms: false },
  });

  const onSubmit = handleSubmit(async (data) => {
    if (!personalData) return;
    mutate(
      {
        role: "COMERCIO",
        first_name: personalData.firstName,
        last_name: personalData.lastName,
        email: personalData.email,
        password: personalData.password,
        confirm_password: personalData.password,
        phone: personalData.phone,
        dni: personalData.dni,
        business_name: data.businessName,
        cuit: data.cuit,
      },
      {
        onSuccess: async (response) => {
          await persistSession(
            response,
            {
              id: response.id,
              email: response.email,
              role: response.role,
              first_name: response.first_name,
              last_name: response.last_name,
              has_address: false,
              has_selected_address: false,
              photo_url: null,
            },
            setAccessToken,
            setUser,
          );
          clear();
          router.replace("/(onboarding)/address" as never);
        },
      },
    );
  });

  return { control, onSubmit, isValid, isPending };
};

// Expo Router requires a default export in app/ — this file is a hook, not a screen
const _ = () => null;
export default _;
