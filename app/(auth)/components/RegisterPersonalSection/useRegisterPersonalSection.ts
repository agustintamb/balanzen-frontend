import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { UserRole } from "@/api/users/users.types";
import { useRegister } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/auth.store";
import { useRegistrationStore } from "@/stores/registration.store";
import { persistSession } from "@/utils/auth";
import { DIGITS_REGEX, EMAIL_REGEX, NAME_REGEX } from "@/utils/validation";
import type { PersonalFormValues } from "../PersonalForm";

const schema = z
  .object({
    firstName: z
      .string()
      .min(2, "Ingresá tu nombre")
      .refine((v) => NAME_REGEX.test(v), { message: "Solo se permiten letras" }),
    lastName: z
      .string()
      .min(2, "Ingresá tu apellido")
      .refine((v) => NAME_REGEX.test(v), { message: "Solo se permiten letras" }),
    email: z
      .string()
      .min(1, "Ingresá tu correo")
      .refine((v) => EMAIL_REGEX.test(v), { message: "Correo electrónico inválido" }),
    password: z.string().min(6, "La contraseña es muy corta"),
    confirmPassword: z.string().min(1, "Confirmá tu contraseña"),
    phone: z
      .string()
      .min(8, "Teléfono inválido")
      .refine((v) => DIGITS_REGEX.test(v), { message: "Solo se permiten números" }),
    dni: z
      .string()
      .min(7, "DNI inválido")
      .max(15, "DNI inválido")
      .refine((v) => DIGITS_REGEX.test(v), { message: "Solo se permiten números" }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Las contraseñas no coinciden",
        path: ["confirmPassword"],
      });
    }
  });

export const useRegisterPersonalSection = (
  role: UserRole,
  onComercioComplete: () => void,
) => {
  const { setUser, setAccessToken } = useAuthStore();
  const setPersonalData = useRegistrationStore((s) => s.setPersonalData);
  const personalData = useRegistrationStore((s) => s.personalData);
  const { mutate, isPending } = useRegister();

  const isConsumidor = role === "CONSUMIDOR";

  const {
    control,
    handleSubmit,
    trigger,
    formState: { isValid },
  } = useForm<PersonalFormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      firstName: personalData?.firstName ?? "",
      lastName: personalData?.lastName ?? "",
      email: personalData?.email ?? "",
      password: personalData?.password ?? "",
      // confirmPassword igual a password porque ya fueron validados como iguales
      confirmPassword: personalData?.password ?? "",
      phone: personalData?.phone ?? "",
      dni: personalData?.dni ?? "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    if (isConsumidor) {
      mutate(
        {
          role: "CONSUMIDOR",
          first_name: data.firstName.trim(),
          last_name: data.lastName.trim(),
          email: data.email,
          password: data.password,
          confirm_password: data.confirmPassword,
          phone: data.phone,
          dni: data.dni,
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
                photo_url: null,
              },
              setAccessToken,
              setUser,
            );
            router.replace("/(onboarding)/address" as never);
          },
        },
      );
    } else {
      setPersonalData({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email,
        password: data.password,
        phone: data.phone,
        dni: data.dni,
      });
      onComercioComplete();
    }
  });

  return { control, trigger, onSubmit, isValid, isPending, isConsumidor };
};

// Expo Router requires a default export in app/ — this file is a hook, not a screen
// eslint-disable-next-line import/no-default-export
export default function _() { return null; }
