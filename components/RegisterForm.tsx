// components/RegisterForm.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { UserType, RegisterFormProps } from "@/interfaces/AppInterfaces";
import { auth } from "@/utils/firebase";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";

export default function RegisterForm({ role, onSuccess }: RegisterFormProps) {
  const { register, login, staffRegister } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");

  const newUser: UserType = {
    email,
    password,
    name,
    phone,
    role,
  };

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
    try {
      if (role === "client") {
        await register(newUser);
        Toast.show({
          type: "success",
          text1: "Registro exitoso",
          text2: `Bienvenido ${name}!`,
        });
        try {
          await login(email, password);
        } catch (error) {
          console.error(error);
        }
        setTimeout(() => {
          router.replace("/(app)/client_menu");
        }, 1500);
      } else {
        setModalVisible(true);
      }
    } catch (error: any) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Ocurrió un error durante el registro.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAdmin = async () => {
    setModalVisible(false);
    setLoading(true);
    try {
      const currentAdmin = auth.currentUser;
      if (!currentAdmin) {
        throw new Error("No hay un administrador autenticado.");
      }
      const adminEmail = currentAdmin.email;
      if (!adminEmail) {
        throw new Error("El correo electrónico del administrador no está disponible.");
      }
      const credential = EmailAuthProvider.credential(adminEmail, adminPassword);
      await reauthenticateWithCredential(currentAdmin, credential);

      await staffRegister(adminPassword, newUser);

      Toast.show({
        type: "success",
        text1: "Registro exitoso",
        text2: `Empleado ${name} registrado correctamente.`,
        visibilityTime: 2000,
      });
      setAdminPassword("");

      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          router.replace("/admin_dashboard");
        }
      }, 2000);
    } catch (error: any) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Ocurrió un error durante el registro.",
      });
    } finally {
      setName("");
      setPhone("");
      setEmail("");
      setConfirmEmail("");
      setPassword("");
      setAdminPassword;
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

      {/* Modal para confirmar la contraseña del administrador */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmar registro</Text>
            <Text style={styles.modalSubtitle}>
              Ingrese su contraseña de administrador para confirmar el registro.
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Contraseña de admin"
              placeholderTextColor="#ccc"
              secureTextEntry
              value={adminPassword}
              onChangeText={setAdminPassword}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleConfirmAdmin}
                disabled={loading}
              >
                <Text style={styles.modalButtonText}>Confirmar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setModalVisible(false)}
                disabled={loading}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#222",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#ccc",
    textAlign: "center",
    marginBottom: 15,
  },
  modalInput: {
    width: "100%",
    height: 45,
    paddingHorizontal: 15,
    borderRadius: 25,
    backgroundColor: "#333",
    color: "#fff",
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    marginRight: 5,
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalCancel: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: "#f44336",
    alignItems: "center",
    marginLeft: 5,
  },
  modalCancelText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
