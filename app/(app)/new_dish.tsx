import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { supabase } from "@/utils/supabase";
import CameraModal from "@/components/CameraModal";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer"; // Importa el método decode

export default function New_Dish() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Callback para recibir la imagen seleccionada desde el CameraModal
  const handleImageSelected = (uri: string) => {
    setImageUri(uri);
    setModalVisible(false);
  };

  // Función para subir la imagen a Supabase y obtener la URL pública
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
      console.error("Error subiendo la imagen: ", error);
      return null;
    }
  };

  // Función para agregar el producto a Firestore
  const addProduct = async () => {
    if (!name || !price || !description || !imageUri) {
      Alert.alert("Por favor completa todos los campos y selecciona una imagen.");
      return;
    }
    setLoading(true);
    try {
      const imageUrl = await uploadImageToSupabase(imageUri);
      if (!imageUrl) {
        Alert.alert("Error al subir la imagen");
        setLoading(false);
        return;
      }
      await addDoc(collection(db, "products"), {
        name,
        price: parseFloat(price),
        description,
        imageUrl,
        createdAt: new Date(),
      });
      Alert.alert("Producto agregado exitosamente.");
      // Reiniciar formulario
      setName("");
      setPrice("");
      setDescription("");
      setImageUri(null);
    } catch (error) {
      console.error("Error agregando producto: ", error);
      Alert.alert("Error agregando producto.");
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      {/* Spinner de pantalla completa */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#10A37F" />
        </View>
      )}
      <Text style={styles.title}>Agregar un Platillo Nuevo</Text>
      <View style={styles.form}>
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
        <Button
          title={loading ? "Agregando..." : "Agregar Plato"}
          onPress={addProduct}
          disabled={loading}
        />
      </View>
      <CameraModal
        isVisible={modalVisible}
        onImageSelected={handleImageSelected}
        onCancel={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  form: {
    flex: 1,
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
});
