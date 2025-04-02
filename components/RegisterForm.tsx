import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { UserType, RegisterFormProps } from "@/interfaces/AppInterfaces";

export default function RegisterForm({ role, onSuccess }: RegisterFormProps) {
  const { register, login } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (email !== confirmEmail) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Los correos electrónicos no coinciden.",
      });
      return;
    }

    setLoading(true);
    const newUser: UserType = {
      email,
      password,
      name,
      phone,
      role,
    };

    try {
      await register(newUser);
      Toast.show({
        type: "success",
        text1: "Registro exitoso",
        text2: `Bienvenido ${name}!`,
      });

      // Solo se inicia sesión automáticamente si el rol es "client"
      if (role === "client") {
        try {
          await login(email, password);
        } catch (error) {
          console.error(error);
        }
      }

      // Si se pasa un callback onSuccess, se ejecuta, de lo contrario redirige al dashboard
      if (onSuccess) {
        onSuccess();
      } else {
        if (role === "client") {
          setTimeout(() => {
            router.replace("/(app)/client_dashboard");
          }, 1500);
        }
      }
    } catch (error: any) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Ocurrió un error durante el proceso de registro.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <View style={styles.container}>
        <View style={styles.modalContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            placeholderTextColor="white"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={styles.input}
            placeholder="Teléfono"
            placeholderTextColor="white"
            value={phone}
            keyboardType="phone-pad"
            onChangeText={setPhone}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="white"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Confirmar Email"
            placeholderTextColor="white"
            value={confirmEmail}
            onChangeText={setConfirmEmail}
            keyboardType="email-address"
          />

          <TextInput
            secureTextEntry
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="white"
            textContentType="password"
            value={password}
            onChangeText={setPassword}
          />

          <View style={styles.divider} />

          <TouchableOpacity
            style={[styles.registerButton, loading && { opacity: 0.6 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.registerText}>Registrar</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
      <Toast />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modalContainer: {
    width: "100%",
    backgroundColor: "#000",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingVertical: 20,
    alignItems: "center",
    paddingHorizontal: 20,
    position: "absolute",
    bottom: 0,
    gap: 15,
  },
  input: {
    width: "90%",
    height: 45,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: "#333",
    color: "#fff",
  },
  divider: {
    width: "80%",
    height: 1,
    backgroundColor: "#777",
    marginVertical: 15,
  },
  registerButton: {
    width: "90%",
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#fff",
    alignItems: "center",
  },
  registerText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});
