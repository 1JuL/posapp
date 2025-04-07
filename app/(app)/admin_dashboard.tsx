import { View, Text } from "react-native";
import React from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function Admin_Dashboard() {
  const { user } = useAuth();

  // Si no hay usuario, mostramos mensaje o null
  if (!user) {
    return (
      <View>
        <Text>Cargando usuario...</Text>
      </View>
    );
  }

  const username = user.displayName || "Usuario sin nombre";

  return (
    <View>
      <Text>admin_dashboard</Text>
      <Text>{username}</Text>
    </View>
  );
}
