import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLogin } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/auth.store";
import { persistSession } from "@/utils/auth";
import { EMAIL_REGEX } from "@/utils/validation";

const schema = z.object({
  email: z
    .string()
    .min(1, "Ingresá tu correo")
    .refine((v) => EMAIL_REGEX.test(v), { message: "Correo electrónico inválido" }),
  password: z.string().min(1, "Ingresá tu contraseña"),
});

type Values = z.infer<typeof schema>;

export const useLoginSection = () => {
  const { mutate, isPending } = useLogin();
  const { setUser, setAccessToken } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit((data) => {
    mutate(
      { email: data.email, password: data.password },
      {
        onSuccess: async (response) => {
          await persistSession(
            response,
            {
              id: response.user.id,
              email: response.user.email,
              role: response.user.role,
              first_name: response.user.first_name,
              last_name: response.user.last_name,
              has_address: response.user.has_address,
              photo_url: response.user.photo_url,
            },
            setAccessToken,
            setUser,
          );
          if (response.user.has_address) {
            router.replace(
              (response.user.role === "COMERCIO"
                ? "/(commerce)/home"
                : "/(consumer)/home") as never,
            );
          } else {
            router.replace("/(onboarding)/address" as never);
          }
        },
      },
    );
  });

  return { control, onSubmit, isValid, isPending };
};

// Expo Router requires a default export in app/ — this file is a hook, not a screen
// eslint-disable-next-line import/no-default-export
export default function _() { return null; }
