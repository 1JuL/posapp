import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/utils/firebase";

export default function View_Menu() {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Se establece el listener en tiempo real
    const unsubscribe = onSnapshot(
      collection(db, "products"),
      (querySnapshot) => {
        const items = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMenuItems(items);
        setLoading(false);
      },
      (error) => {
        console.error("Error escuchando la colección: ", error);
        setLoading(false);
      }
    );

    // Se limpia la suscripción al desmontar el componente
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {menuItems.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.title}>{item.name}</Text>
          {item.imageUrl && (
            <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
          )}
          <Text style={styles.description}>{item.description}</Text>
          <Text style={styles.price}>${parseFloat(item.price).toFixed(2)}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
  },
  price: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007bff",
  },
});
