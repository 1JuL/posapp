import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { collection, onSnapshot, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { CartItem, Product } from "@/interfaces/AppInterfaces";

export default function Client_Menu() {
  const [menuItems, setMenuItems] = useState<Product[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [ordering, setOrdering] = useState(false);
  const { user } = useAuth(); // Obtenemos el usuario actual

  // Listener en tiempo real para actualizaciones en la colección "products"
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        const products: Product[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          description: doc.data().description,
          price: doc.data().price,
          imageUrl: doc.data().imageUrl,
        }));
        setMenuItems(products);
        setLoadingMenu(false);
      },
      (error) => {
        console.error("Error fetching products: ", error);
        setLoadingMenu(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Función para agregar un producto al carrito
  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart((prevCart) =>
        prevCart.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
      );
    }
  };

  // Enviar el pedido a Firestore (colección "orders")
  const handleOrder = async () => {
    if (cart.length === 0) {
      Alert.alert("Carrito vacío", "Por favor agrega productos a tu pedido.");
      return;
    }
    if (!user) {
      Alert.alert("Usuario no autenticado", "Debes iniciar sesión para ordenar.");
      return;
    }
    setOrdering(true);
    try {
      // Consulta para verificar si el usuario ya tiene 2 órdenes pendientes
      const ordersQuery = query(
        collection(db, "orders"),
        where("userId", "==", user.uid),
        where("status", "==", "Ordered")
      );
      const ordersSnapshot = await getDocs(ordersQuery);
      if (ordersSnapshot.docs.length >= 2) {
        Alert.alert("Límite de pedidos", "No puedes crear más de dos pedidos pendientes.");
        setOrdering(false);
        return;
      }

      const orderData = {
        userId: user.uid, // Se añade el id del usuario actual
        items: cart.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
        })),
        createdAt: new Date(),
        status: "Ordered",
      };
      await addDoc(collection(db, "orders"), orderData);
      Alert.alert("Pedido realizado", "Tu pedido ha sido enviado a la cocina.");
      setCart([]);
    } catch (error) {
      console.error("Error sending order: ", error);
      Alert.alert("Error", "Hubo un problema al enviar tu pedido.");
    }
    setOrdering(false);
  };

  return (
    <View style={styles.container}>
      {(loadingMenu || ordering) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#10A37F" />
        </View>
      )}
      <ScrollView style={styles.menuContainer}>
        <Text style={styles.sectionTitle}>Menú</Text>
        {menuItems.map((product) => (
          <View key={product.id} style={styles.card}>
            {product.imageUrl ? (
              <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
            ) : null}
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.description}>{product.description}</Text>
            <Text style={styles.price}>${product.price.toFixed(2)}</Text>
            <TouchableOpacity style={styles.button} onPress={() => addToCart(product)}>
              <Text style={styles.buttonText}>Agregar al carrito</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      <View style={styles.cartContainer}>
        <Text style={styles.sectionTitle}>Carrito</Text>
        {cart.length === 0 ? (
          <Text style={styles.emptyCart}>Tu carrito está vacío</Text>
        ) : (
          cart.map((item) => (
            <View key={item.product.id} style={styles.cartItem}>
              <Text style={styles.productName}>{item.product.name}</Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                  style={styles.quantityButton}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <TouchableOpacity
                  onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                  style={styles.quantityButton}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => removeFromCart(item.product.id)}
                style={styles.removeButton}
              >
                <Text style={styles.removeButtonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
        <TouchableOpacity style={styles.orderButton} onPress={handleOrder}>
          <Text style={styles.orderButtonText}>Ordenar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  menuContainer: {
    flex: 1,
    padding: 10,
  },
  card: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    padding: 15,
    marginBottom: 15,
  },
  productImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  description: {
    fontSize: 14,
    color: "#555",
    marginVertical: 5,
  },
  price: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007bff",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#10A37F",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  cartContainer: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    backgroundColor: "#fff",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  emptyCart: {
    fontStyle: "italic",
    color: "#888",
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 10,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  quantityButton: {
    backgroundColor: "#eee",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  quantityButtonText: {
    fontSize: 18,
  },
  quantityText: {
    marginHorizontal: 10,
    fontSize: 16,
  },
  removeButton: {
    marginLeft: "auto",
    padding: 5,
  },
  removeButtonText: {
    color: "#FF0000",
    fontSize: 14,
  },
  orderButton: {
    backgroundColor: "#10A37F",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
  },
  orderButtonText: {
    color: "#fff",
    fontSize: 18,
  },
});
