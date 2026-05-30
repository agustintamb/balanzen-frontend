import { Redirect } from "expo-router";
import { useAuthStore } from "@/stores/auth.store";

const Index = () => {
  const { user, isInitialized } = useAuthStore();

  if (!isInitialized) return null;
  if (!user) return <Redirect href={"/(auth)" as any} />;
  if (!user.has_address)
    return <Redirect href={"/(onboarding)/address" as any} />;
  return (
    <Redirect
      href={
        (user.role === "COMERCIO"
          ? "/(commerce)/home"
          : "/(consumer)/home") as any
      }
    />
  );
};

export default Index;
