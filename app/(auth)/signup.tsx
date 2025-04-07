import { View, Text } from "react-native";
import React from "react";
import RegisterForm from "@/components/RegisterForm";

export default function Signup() {
  return (
    <View style={{ flex: 1 }}>
      <RegisterForm role="client" />
    </View>
  );
}
