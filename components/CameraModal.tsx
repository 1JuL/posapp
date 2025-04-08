import React, { useState, useRef } from "react";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { View, Text, Modal, Button, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { CameraModalProps } from "@/interfaces/AppInterfaces";

export default function CameraModal(props: CameraModalProps) {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [image, setImage] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);

  if (!permission) {
    // Los permisos aún se están cargando.
    return <View />;
  }

  if (!permission.granted) {
    // Los permisos no han sido otorgados.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  const takePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        setImage(photo.uri);
        // Notificar a la pantalla padre que se tomó una foto.
        props.onImageSelected(photo.uri);
      } catch (error) {
        console.error("Error taking photo:", error);
      }
    }
  };

  const searchGallery = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImage(uri);
      // Notificar a la pantalla padre con la URI de la imagen seleccionada.
      props.onImageSelected(uri);
    }
  };

  return (
    <Modal visible={props.isVisible} animationType="slide">
      <View style={styles.modalContainer}>
        <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={takePhoto}>
              <MaterialCommunityIcons name="camera" size={20} color="#FFFFFF" style={styles.icon} />
              <Text style={styles.text}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={searchGallery}>
              <MaterialCommunityIcons
                name="file-image"
                size={20}
                color="#FFFFFF"
                style={styles.icon}
              />
              <Text style={styles.text}>Search Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
              <MaterialCommunityIcons
                name="camera-flip"
                size={20}
                color="#FFFFFF"
                style={styles.icon}
              />
              <Text style={styles.text}>Flip Camera</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
        <TouchableOpacity style={styles.cancelButton} onPress={props.onCancel}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  container: {
    flex: 1,
    justifyContent: "center",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  icon: {
    marginRight: 10,
  },
  cancelButton: {
    backgroundColor: "#ff4444",
    padding: 15,
    alignItems: "center",
  },
  cancelText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
