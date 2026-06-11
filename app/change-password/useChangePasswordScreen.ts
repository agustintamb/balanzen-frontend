import { useRouter } from "expo-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useChangePassword } from "@/hooks/useAuth";
import { useToast } from "@/stores/ui.store";

const schema = z
  .object({
    current_password: z.string().min(1, "Requerido"),
    new_password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[a-zA-Z]/, "Debe incluir letras")
      .regex(/[0-9]/, "Debe incluir números"),
    confirm_password: z.string().min(1, "Requerido"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Las contraseñas no coinciden",
    path: ["confirm_password"],
  });

type FormValues = z.infer<typeof schema>;

export const useChangePasswordScreen = () => {
  const router = useRouter();
  const { mutateAsync: changePassword } = useChangePassword();
  const { showSuccess } = useToast();

  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const handleBack = () => router.back();

  const handleSave = handleSubmit(async (values) => {
    try {
      await changePassword({
        current_password: values.current_password,
        new_password: values.new_password,
        confirm_password: values.confirm_password,
      });
      showSuccess("Contraseña actualizada");
      router.back();
    } catch {
      // Error toast shown automatically by QueryProvider
    }
  });

  return {
    control,
    isValid,
    isSubmitting,
    handleBack,
    handleSave,
  };
};

// Expo Router requires a default export in app/ — this is a hook, not a screen
export default function _() {
  return null;
}
