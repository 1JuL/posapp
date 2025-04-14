import { View, Text, StyleSheet, Image } from "react-native";
import React from "react";
import RegisterForm from "@/components/RegisterForm";

export default function Add_Waiter() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro de Mesero</Text>
      <Image
        source={require("@/assets/images/waiter_icon.png")}
        style={styles.image}
        resizeMode="contain"
      />
      <RegisterForm role="waiter" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    alignItems: "center",
    backgroundColor: "#f8f8f8",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
});
