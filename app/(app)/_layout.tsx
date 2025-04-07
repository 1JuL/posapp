import { Stack } from "expo-router";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { Drawer } from "expo-router/drawer";
import CustomDrawerContent from "../../components/CustomDrawer";

export default function AppLayout() {
  useProtectedRoute();

  return (
    <Drawer drawerContent={(props) => <CustomDrawerContent {...props} />}>
      {/* Define las pantallas que tendrán Drawer */}
      <Drawer.Screen name="admin_dashboard" options={{ title: "Dashboard" }} />
      <Drawer.Screen name="chef_dashboard" options={{ title: "Dashboard" }} />
      <Drawer.Screen name="cashier_dashboard" options={{ title: "Dashboard" }} />
      <Drawer.Screen name="client_dashboard" options={{ title: "Dashboard" }} />
      <Drawer.Screen name="admin_menu" options={{ title: "Menu Management" }} />
      <Drawer.Screen name="menu_view" options={{ title: "Menu" }} />
      <Drawer.Screen name="add_chef" options={{ title: "Registrar Chef" }} />
      <Drawer.Screen name="add_cashier" options={{ title: "Registrar Cajero" }} />
    </Drawer>
  );
}
