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
      <Drawer.Screen name="view_receipts" options={{ title: "Receipts" }} />
      <Drawer.Screen name="chef_dashboard" options={{ title: "Client Orders" }} />
      <Drawer.Screen name="waiter_dashboard" options={{ title: "Dashboard" }} />
      <Drawer.Screen name="cashier_dashboard" options={{ title: "Dashboard" }} />
      <Drawer.Screen name="manage_menu" options={{ title: "Menu Management" }} />
      <Drawer.Screen name="new_dish" options={{ title: "Add a New Dish" }} />
      <Drawer.Screen name="view_menu" options={{ title: "Menu" }} />
      <Drawer.Screen name="client_menu" options={{ title: "Make an Order" }} />
      <Drawer.Screen name="view_orders" options={{ title: "Your Orders" }} />
      <Drawer.Screen name="add_chef" options={{ title: "Registrar Chef" }} />
      <Drawer.Screen name="add_cashier" options={{ title: "Registrar Cajero" }} />
      <Drawer.Screen name="add_waiter" options={{ title: "Registrar Mesero" }} />
    </Drawer>
  );
}
