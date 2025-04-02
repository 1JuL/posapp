import { Stack } from "expo-router";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { Drawer } from "expo-router/drawer";
import CustomDrawerContent from "../../components/CustomDrawer";

export default function AppLayout() {
  //useProtectedRoute();

  return (
    <Drawer drawerContent={(props) => <CustomDrawerContent {...props} />}>
      {/* Define las pantallas que tendrán Drawer */}

      <Drawer.Screen name="admin_dashboard" options={{ title: "" }} />
      <Drawer.Screen name="chef_dashboard" options={{ title: "" }} />
      <Drawer.Screen name="cashier_dashboard" options={{ title: "" }} />
      <Drawer.Screen name="client_dashboard" options={{ title: "" }} />
      <Drawer.Screen name="menu" options={{ title: "" }} />
      <Drawer.Screen name="add_chef" options={{ title: "" }} />
    </Drawer>
  );
}
