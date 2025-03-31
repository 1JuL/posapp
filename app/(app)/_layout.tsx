import { Stack } from "expo-router";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";

export default function AppLayout() {
  useProtectedRoute();

  return (
    <Stack screenOptions={{}}>
      {/* Rutas protegidas */}
      <Stack.Screen name="dashboard" options={{}} />
    </Stack>
  );
}
