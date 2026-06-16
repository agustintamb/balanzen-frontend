import { useRealtimeSync } from "@/hooks/useRealtimeSync";

const RealtimeProvider = ({ children }: { children: React.ReactNode }) => {
  useRealtimeSync();
  return <>{children}</>;
};

export default RealtimeProvider;
