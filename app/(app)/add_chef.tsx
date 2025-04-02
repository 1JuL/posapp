import { View, Text } from "react-native";
import React from "react";
import RegisterForm from "@/components/RegisterForm";

export default function add_chef() {
  return (
    <View style={{ flex: 1 }}>
      <Text>Registro Chef</Text>
      <RegisterForm role="chef" />
    </View>
  );
}
