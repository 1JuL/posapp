import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  Modal,
  Button,
} from "react-native";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/utils/firebase";
import Toast from "react-native-toast-message";
import { Picker } from "@react-native-picker/picker";
import { UserDb } from "@/interfaces/AppInterfaces";

export default function Admin_Dashboard() {
  const [users, setUsers] = useState<UserDb[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  // Estados para el modal de edición
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDb | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRole, setEditRole] = useState("");

  const roles = ["client", "admin", "chef", "cashier", "waiter"];

  // Obtención de usuarios desde Firestore
  useEffect(() => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const usersData: UserDb[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as UserDb[];
        setUsers(usersData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching users: ", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Filtrar usuarios por nombre y rol
  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesRole = selectedRole ? user.role === selectedRole : true;
    return matchesSearch && matchesRole;
  });

  // Función para abrir el modal de edición con los datos del usuario
  const openEditModal = (user: UserDb) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPhone(user.phone);
    setEditRole(user.role);
    setEditModalVisible(true);
  };

  // Función para actualizar el usuario
  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      const userDocRef = doc(db, "users", editingUser.id);
      await updateDoc(userDocRef, {
        name: editName,
        email: editEmail,
        phone: editPhone,
        role: editRole,
      });
      Toast.show({
        type: "success",
        text1: "Usuario actualizado",
      });
      setEditModalVisible(false);
    } catch (error) {
      console.error("Error updating user: ", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo actualizar el usuario.",
      });
    }
  };

  // Función para eliminar un usuario
  const handleDeleteUser = (userId: string) => {
    Alert.alert("Confirmar eliminación", "¿Estás seguro de eliminar este usuario?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "users", userId));
            Toast.show({
              type: "success",
              text1: "Usuario eliminado",
            });
          } catch (error) {
            console.error("Error deleting user: ", error);
            Toast.show({
              type: "error",
              text1: "Error",
              text2: "No se pudo eliminar el usuario.",
            });
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10A37F" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Barra de búsqueda */}
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar por nombre..."
        value={searchText}
        onChangeText={(text) => setSearchText(text)}
      />

      {/* Filtro por rol */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, selectedRole === "" && styles.filterButtonActive]}
          onPress={() => setSelectedRole("")}
        >
          <Text style={styles.filterButtonText}>Todos</Text>
        </TouchableOpacity>
        {roles.map((role) => (
          <TouchableOpacity
            key={role}
            style={[styles.filterButton, selectedRole === role && styles.filterButtonActive]}
            onPress={() => setSelectedRole(role)}
          >
            <Text style={styles.filterButtonText}>{role}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.cardsContainer}>
        {filteredUsers.length === 0 ? (
          <Text style={styles.noUsersText}>No se encontraron usuarios</Text>
        ) : (
          filteredUsers.map((user) => (
            <View key={user.id} style={styles.card}>
              <Text style={styles.userName}>Nombre: {user.name}</Text>
              <Text style={styles.userInfo}>Email: {user.email}</Text>
              <Text style={styles.userInfo}>Teléfono: {user.phone}</Text>
              <Text style={styles.userInfo}>Rol: {user.role}</Text>
              <Text style={styles.userInfo}>
                Creado:{" "}
                {user.createdAt?.toDate
                  ? user.createdAt.toDate().toLocaleString()
                  : new Date(user.createdAt.seconds * 1000).toLocaleString()}
              </Text>
              <View style={styles.buttonsContainer}>
                <TouchableOpacity style={styles.editButton} onPress={() => openEditModal(user)}>
                  <Text style={styles.buttonText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteUser(user.id)}
                >
                  <Text style={styles.buttonText}>Borrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal para editar usuario */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Editar Usuario</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nombre"
              value={editName}
              onChangeText={setEditName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Email"
              value={editEmail}
              onChangeText={setEditEmail}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Teléfono"
              value={editPhone}
              onChangeText={setEditPhone}
            />
            {/* Combobox para seleccionar rol */}
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Rol:</Text>
              <Picker
                selectedValue={editRole}
                style={styles.picker}
                onValueChange={(itemValue) => setEditRole(itemValue)}
              >
                {roles.map((role) => (
                  <Picker.Item key={role} label={role} value={role} />
                ))}
              </Picker>
            </View>
            <View style={styles.modalButtons}>
              <Button title="Guardar" onPress={handleUpdateUser} />
              <Button title="Cancelar" onPress={() => setEditModalVisible(false)} color="#ff4444" />
            </View>
          </View>
        </View>
      </Modal>

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  searchInput: {
    margin: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  filterButton: {
    backgroundColor: "#ccc",
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 8,
  },
  filterButtonActive: {
    backgroundColor: "#10A37F",
  },
  filterButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  cardsContainer: {
    padding: 15,
  },
  noUsersText: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
  },
  card: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  userInfo: {
    fontSize: 16,
    marginBottom: 3,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  editButton: {
    backgroundColor: "#10A37F",
    padding: 10,
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: "#ff4444",
    padding: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  pickerContainer: {
    marginBottom: 10,
  },
  pickerLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  picker: {
    height: 50,
    width: "100%",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
});
