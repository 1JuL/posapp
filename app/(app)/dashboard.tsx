import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";

export default function dashboard() {
  const { logout, user } = useAuth();
  console.log("user:", user);
  const router = useRouter();
  return (
    <View>
      <Text>dashboard</Text>
      <TouchableOpacity
        style={[styles.button, styles.lastButton]}
        onPress={async () => {
          try {
            await logout();
            router.replace("/home");
          } catch (error) {
            console.error("Error al cerrar sesión:", error);
          }
        }}
      >
        <View style={styles.buttonContent}>
          <MaterialCommunityIcons name="logout" size={20} color="#ED8C8C" style={styles.icon} />
          <Text style={styles.redText}>Logout</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    height: 52,
    backgroundColor: "#303134",
    padding: 15,
    marginVertical: 5,
    borderRadius: 5,
    alignItems: "flex-start",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  redText: {
    color: "#ED8C8C",
    fontSize: 16,
    fontFamily: "Raleway",
  },
  lastButton: {
    marginBottom: 0,
    width: "100%",
    backgroundColor: "#303134",
    padding: 15,
    marginVertical: 5,
    borderRadius: 5,
    alignItems: "flex-start",
  },
  icon: {
    marginRight: 10,
  },
});
