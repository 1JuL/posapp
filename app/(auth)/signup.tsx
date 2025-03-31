import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/utils/firebase";
import Toast from "react-native-toast-message";
import { UserType } from "@/interfaces/AppInterfaces";

export default function Signup() {
  const { register, login } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const changeScreen = () => {
    router.replace("/dashboard");
  };

  const handleSignup = async () => {
    if (email !== confirmEmail) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Los correos electrónicos no coinciden.",
      });
      return;
    }
    setLoading(true);
    const new_user: UserType = {
      email: email,
      password: password,
      name: name,
      phone: phone,
      role: "Client",
    };
    try {
      await register(new_user);
      Toast.show({
        type: "success",
        text1: "Registro exitoso",
        text2: `Bienvenido ${name}!`,
      });
      try {
        await login(email, password);
      } catch (error) {
        console.log({ error });
      }
      setTimeout(() => {
        changeScreen();
      }, 1500);
    } catch (error: any) {
      console.log({ error });
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
      <View style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.modalContainer}>
            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor="white"
              value={name}
              onChangeText={setName}
            />

            <TextInput
              style={styles.input}
              placeholder="Phone"
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
              secureTextEntry={true}
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="white"
              textContentType="password"
              value={password}
              onChangeText={setPassword}
            />

            <View style={styles.divider} />

            <TouchableOpacity
              style={[styles.logInButton, loading && { opacity: 0.6 }]}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.logInText}>Sign Up</Text>
              )}
            </TouchableOpacity>
          </View>
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
  logInButton: {
    width: "90%",
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#fff",
    alignItems: "center",
  },
  logInText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});
