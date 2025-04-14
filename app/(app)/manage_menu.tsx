import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/utils/firebase";
import Toast from "react-native-toast-message";
import EditDishModal from "@/components/EditDishModal";

export default function Manage_Menu() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const productsRef = collection(db, "products");
    const productsQuery = query(productsRef, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      productsQuery,
      (snapshot) => {
        const productsData = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setProducts(productsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error al cargar productos: ", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleDelete = async (productId: string) => {
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "products", productId));
      Toast.show({
        type: "success",
        text1: "Producto eliminado",
        text2: "El producto se ha eliminado correctamente.",
      });
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo eliminar el producto.",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (product: any) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  // Función para alternar la disponibilidad del producto
  const handleToggleAvailability = async (product: any) => {
    try {
      await updateDoc(doc(db, "products", product.id), {
        available: !product.available,
      });
      Toast.show({
        type: "success",
        text1: "Producto actualizado",
        text2: `El producto ahora está ${!product.available ? "Disponible" : "No disponible"}.`,
      });
    } catch (error) {
      console.error("Error al actualizar disponibilidad:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo actualizar la disponibilidad del producto.",
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10A37F" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Manage Menu</Text>
        {products.length === 0 ? (
          <Text style={styles.noProductsText}>No hay productos disponibles.</Text>
        ) : (
          products.map((product) => (
            <View key={product.id} style={styles.card}>
              {product.imageUrl ? (
                <Image source={{ uri: product.imageUrl }} style={styles.image} />
              ) : null}
              <View style={styles.cardContent}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productDescription}>{product.description}</Text>
                <Text style={styles.productPrice}>$ {product.price}</Text>
                <Text style={styles.productAvailability}>
                  {product.available ? "Disponible" : "No disponible"}
                </Text>
              </View>
              <View style={styles.buttonsContainer}>
                <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(product)}>
                  <Text style={styles.buttonText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(product.id)}
                >
                  <Text style={styles.buttonText}>Eliminar</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.availableContainer}>
                <TouchableOpacity
                  style={styles.toggleButton}
                  onPress={() => handleToggleAvailability(product)}
                >
                  <Text style={styles.buttonText}>
                    {product.available ? "Marcar como No disponible" : "Marcar como Disponible"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {deleting && (
        <View style={styles.deletingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}

      {/* Modal para edición */}
      {selectedProduct && (
        <EditDishModal
          visible={modalVisible}
          dish={selectedProduct}
          onClose={() => {
            setModalVisible(false);
            setSelectedProduct(null);
          }}
        />
      )}

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  noProductsText: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
  },
  card: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  image: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  cardContent: {
    marginBottom: 10,
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  productDescription: {
    fontSize: 14,
    marginBottom: 5,
    color: "#555",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#10A37F",
  },
  productAvailability: {
    fontSize: 16,
    marginTop: 5,
    color: "#333",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  availableContainer: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  editButton: {
    backgroundColor: "#FFA500",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
    marginRight: 5,
  },
  deleteButton: {
    backgroundColor: "#ED8C8C",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
    marginLeft: 5,
  },
  toggleButton: {
    backgroundColor: "#10A37F",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
    marginHorizontal: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  deletingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
});
