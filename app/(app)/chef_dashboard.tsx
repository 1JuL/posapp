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

export default function Chef_Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    let isMounted = true;
    const tick = () => {
      if (isMounted) {
        setNow(Date.now());
        setTimeout(tick, 1000);
      }
    };
    tick();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const ordersRef = collection(db, "orders");
    const ordersQuery = query(
      ordersRef,
      where("status", "in", ["Ordered", "Cooking"]),
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
        console.error("Error fetching orders: ", error);
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
      console.error("Error updating order: ", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo actualizar el estado de la orden.",
      });
    } finally {
      setUpdating(false);
    }
  };

  // Calcula los minutos transcurridos usando el estado "now"
  const getMinutesSinceOrder = (createdAt: any, currentTime: number): number => {
    let orderDate: Date;
    if (createdAt && createdAt.toDate) {
      orderDate = createdAt.toDate();
    } else if (createdAt && createdAt.seconds) {
      orderDate = new Date(createdAt.seconds * 1000);
    } else {
      orderDate = new Date();
    }
    const diffMs = currentTime - orderDate.getTime();
    return Math.floor(diffMs / 60000);
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
        <Text style={styles.title}>Órdenes Pendientes</Text>
        {orders.length === 0 ? (
          <Text style={styles.noOrdersText}>No hay órdenes pendientes</Text>
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
              <Text style={styles.orderTime}>
                {getMinutesSinceOrder(order.createdAt, now)} minutos transcurridos
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
              <View style={styles.itemsContainer}>
                <Text style={styles.orderId}>{order.tableId}</Text>
                <Text style={styles.orderStatus}>Total: {order.total}</Text>
              </View>
              {order.status === "Ordered" && (
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => updateOrderStatus(order.id, "Cooking")}
                >
                  <Text style={styles.buttonText}>Start Cooking</Text>
                </TouchableOpacity>
              )}
              {order.status === "Cooking" && (
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => updateOrderStatus(order.id, "Ready for Pickup")}
                >
                  <Text style={styles.buttonText}>Ready for pick up</Text>
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
    marginBottom: 5,
    color: "#555",
  },
  orderTime: {
    fontSize: 14,
    marginBottom: 5,
    color: "#333",
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
