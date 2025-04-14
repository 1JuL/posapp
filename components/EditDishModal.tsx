import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { supabase } from "@/utils/supabase";
import CameraModal from "@/components/CameraModal";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";
import { EditDishModalProps } from "@/interfaces/AppInterfaces";

export default function EditDishModal({ visible, onClose, dish }: EditDishModalProps) {
  const [name, setName] = useState(dish.name);
  const [price, setPrice] = useState(String(dish.price));
  const [description, setDescription] = useState(dish.description);
  const [imageUri, setImageUri] = useState<string | null>(dish.imageUrl);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Actualizamos los estados si cambia el dish recibido (por ejemplo, al abrir el modal con otro producto)
  useEffect(() => {
    setName(dish.name);
    setPrice(String(dish.price));
    setDescription(dish.description);
    setImageUri(dish.imageUrl);
  }, [dish]);

  // Callback para recibir la imagen seleccionada en el CameraModal
  const handleImageSelected = (uri: string) => {
    setImageUri(uri);
    setModalVisible(false);
  };

  // Función para subir la imagen a Supabase y obtener la URL pública (similar a new_dish)
  const uploadImageToSupabase = async (uri: string) => {
    try {
      // Leer el archivo como base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      // Convertir la cadena base64 a ArrayBuffer
      const binaryData = decode(base64);
      // Generar un nombre único para la imagen
      const filename = `dishes/${Date.now()}.jpg`;
      // Subir la imagen al bucket "dishes-images"
      const { error: uploadError } = await supabase.storage
        .from("dishes-images")
        .upload(filename, binaryData, {
          contentType: "image/jpeg",
        });
      if (uploadError) throw uploadError;
      // Obtener la URL pública de la imagen
      const { data } = supabase.storage.from("dishes-images").getPublicUrl(filename);
      return data.publicUrl;
    } catch (error) {
      console.error("Error subiendo la imagen:", error);
      return null;
    }
  };

  // Función para actualizar el producto en Firestore
  const updateProduct = async () => {
    if (!name || !price || !description || !imageUri) {
      Alert.alert("Por favor, completa todos los campos y selecciona una imagen.");
      return;
    }
    setLoading(true);
    try {
      let finalImageUrl = dish.imageUrl;
      // Si la imagen se cambió (la uri es distinta a la URL original), se sube la nueva imagen
      if (imageUri !== dish.imageUrl) {
        const uploadedUrl = await uploadImageToSupabase(imageUri);
        if (!uploadedUrl) {
          Alert.alert("Error al subir la imagen");
          setLoading(false);
          return;
        }
        finalImageUrl = uploadedUrl;
      }
      // Actualizar el documento en Firestore
      const productRef = doc(db, "products", dish.id);
      await updateDoc(productRef, {
        name,
        price: parseFloat(price),
        description,
        imageUrl: finalImageUrl,
        updatedAt: new Date(),
      });
      Alert.alert("Producto actualizado correctamente.");
      onClose(); // Cerrar el modal tras la actualización
    } catch (error) {
      console.error("Error actualizando producto:", error);
      Alert.alert("Error actualizando producto.");
    }
    setLoading(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#10A37F" />
            </View>
          )}
          <Text style={styles.title}>Editar Platillo</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre del plato"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Precio"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="Descripción"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.imageButton}>
            <Text style={styles.imageButtonText}>
              {imageUri ? "Cambiar imagen" : "Seleccionar imagen"}
            </Text>
          </TouchableOpacity>
          {imageUri && (
            <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="contain" />
          )}
          <View style={styles.buttonsRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={updateProduct}>
              <Text style={styles.buttonText}>Guardar Cambios</Text>
            </TouchableOpacity>
          </View>
          <CameraModal
            isVisible={modalVisible}
            onImageSelected={handleImageSelected}
            onCancel={() => setModalVisible(false)}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  multiline: {
    height: 100,
    textAlignVertical: "top",
  },
  imageButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  imageButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    marginBottom: 10,
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    backgroundColor: "#ED8C8C",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
    marginRight: 5,
  },
  saveButton: {
    backgroundColor: "#10A37F",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
    marginLeft: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
});
