// components/CustomDrawerContent.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function CustomDrawerContent(props: any) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/home");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Obtenemos el rol del usuario, si no está definido se puede asignar un rol por defecto
  const role = user?.role || "client";

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
      <View style={styles.menu}>
        {/* Botones comunes para todos */}

        {/* Opciones para rol "admin" */}
        {role === "admin" && (
          <>
            <TouchableOpacity style={styles.button} onPress={() => router.push("/menu")}>
              <Text style={styles.text}>Manage Menu</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => router.push("/add_chef")}>
              <Text style={styles.text}>Add Chef</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Opciones para rol "chef" */}
        {role === "chef" && (
          <>
            <TouchableOpacity style={styles.button} onPress={() => router.push("/chef_dashboard")}>
              <Text style={styles.text}>Chef Dashboard</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Opciones para rol "cashier" */}
        {role === "cashier" && (
          <>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push("/cashier_dashboard")}
            >
              <Text style={styles.text}>Cashier Dashboard</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Opciones para rol "client" */}
        {role === "client" && (
          <>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push("/client_dashboard")}
            >
              <Text style={styles.text}>Client Dashboard</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={20} color="#ED8C8C" style={styles.icon} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "space-between" },
  menu: { paddingHorizontal: 10, marginTop: 20 },
  button: {
    padding: 15,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
  },
  text: { fontSize: 16 },
  logoutContainer: { padding: 15, borderTopColor: "#ccc", borderTopWidth: 1 },
  logoutButton: { flexDirection: "row", alignItems: "center" },
  icon: { marginRight: 10 },
  logoutText: { color: "#ED8C8C", fontSize: 16 },
});
