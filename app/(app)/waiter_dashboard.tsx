import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { collection, query, where, onSnapshot, updateDoc, doc, orderBy } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { Order } from "@/interfaces/AppInterfaces";
import Toast from "react-native-toast-message";

export default function Waiter_Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    // Se consultan las órdenes que estén en "Ready for Pickup" o "Delivered"
    const ordersRef = collection(db, "orders");
    const ordersQuery = query(
      ordersRef,
      where("status", "in", ["Ready for Pickup", "Delivered"]),
      orderBy("createdAt", "asc")
    );
    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const ordersData: Order[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Order[];
        setOrders(ordersData);
        setLoading(false);
      },
      (error) => {
        console.error("Error al cargar las órdenes:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdating(true);
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      Toast.show({
        type: "success",
        text1: "Estado actualizado",
        text2: `Orden actualizada a ${newStatus}`,
      });
    } catch (error) {
      console.error("Error al actualizar la orden:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo actualizar el estado de la orden.",
      });
    } finally {
      setUpdating(false);
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
        <Text style={styles.title}>Órdenes para Mesero</Text>
        {orders.length === 0 ? (
          <Text style={styles.noOrdersText}>No hay órdenes disponibles para actualizar</Text>
        ) : (
          orders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <Text style={styles.orderId}>Orden #{order.id}</Text>
              <Text style={styles.orderStatus}>Estado: {order.status}</Text>
              <Text style={styles.orderDate}>
                Fecha:{" "}
                {order.createdAt?.toDate
                  ? order.createdAt.toDate().toLocaleString()
                  : new Date(order.createdAt.seconds * 1000).toLocaleString()}
              </Text>
              <View style={styles.itemsContainer}>
                {order.items &&
                  order.items.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                    </View>
                  ))}
              </View>
              {order.status === "Ready for Pickup" && (
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => updateOrderStatus(order.id, "Delivered")}
                >
                  <Text style={styles.buttonText}>Mark as Delivered</Text>
                </TouchableOpacity>
              )}
              {order.status === "Delivered" && (
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => updateOrderStatus(order.id, "Ready for Payment")}
                >
                  <Text style={styles.buttonText}>Mark as Ready for Payment</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {updating && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
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
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  noOrdersText: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
  },
  orderCard: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
  },
  orderId: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  orderStatus: {
    fontSize: 16,
    marginBottom: 5,
  },
  orderDate: {
    fontSize: 14,
    marginBottom: 10,
    color: "#555",
  },
  itemsContainer: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  itemName: {
    fontSize: 16,
  },
  itemQuantity: {
    fontSize: 16,
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
});
