import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "@/utils/firebase";
import { Order } from "@/interfaces/AppInterfaces";
import Toast from "react-native-toast-message";

const TAX_RATE = 0.1;

export default function Cashier_Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    // Filtra únicamente las órdenes en estado "Ready for Payment"
    const ordersRef = collection(db, "orders");
    const ordersQuery = query(
      ordersRef,
      where("status", "==", "Ready for Payment"),
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

  // Función para calcular el desglose del recibo
  const calculateBill = (order: Order) => {
    const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * TAX_RATE;
    const finalTotal = subtotal + tax;
    return { subtotal, tax, finalTotal };
  };

  // Función para marcar la orden como pagada, generar el recibo y mover la orden a completadas
  const markOrderAsPaid = async (orderId: string) => {
    setUpdating(true);
    try {
      // Obtener la orden actual
      const orderDocRef = doc(db, "orders", orderId);
      const orderDocSnap = await getDoc(orderDocRef);
      if (!orderDocSnap.exists()) {
        throw new Error("La orden no existe.");
      }
      const orderData = orderDocSnap.data();

      // Calcular el desglose usando los items de la orden
      const { subtotal, tax, finalTotal } = orderData.items.reduce(
        (acc: { subtotal: number; tax: number; finalTotal: number }, item: any) => {
          const itemTotal = item.price * item.quantity;
          return {
            subtotal: acc.subtotal + itemTotal,
            tax: 0,
            finalTotal: 0,
          };
        },
        { subtotal: 0, tax: 0, finalTotal: 0 }
      );
      const computedTax = subtotal * TAX_RATE;
      const computedFinalTotal = subtotal + computedTax;

      // Actualizar el estado de la orden a "Paid" y agregar el timestamp de pago
      const updatedOrder = { ...orderData, status: "Paid", paidAt: new Date() };

      // Generar el recibo: Guardarlo en la colección "receipts"
      const receiptData = {
        orderId,
        userId: orderData.userId,
        tableId: orderData.tableId,
        items: orderData.items,
        subtotal,
        tax: computedTax,
        finalTotal: computedFinalTotal,
        createdAt: new Date(),
      };
      await addDoc(collection(db, "receipts"), receiptData);

      // Guardar la orden actualizada en "completedOrders"
      const completedDocRef = doc(db, "completedOrders", orderId);
      await setDoc(completedDocRef, updatedOrder);

      // Eliminar la orden de la colección "orders"
      await deleteDoc(orderDocRef);

      Toast.show({
        type: "success",
        text1: "Orden actualizada",
        text2: "La orden se marcó como Pagada y se movió a completadas.",
      });
    } catch (error) {
      console.error("Error al actualizar la orden: ", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo actualizar la orden.",
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
        <Text style={styles.title}>Órdenes para Cajero</Text>
        {orders.length === 0 ? (
          <Text style={styles.noOrdersText}>No hay órdenes listas para el pago</Text>
        ) : (
          orders.map((order) => {
            const { subtotal, tax, finalTotal } = calculateBill(order);
            return (
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
                        <Text style={styles.itemQuantity}>
                          {item.quantity} x ${item.price.toFixed(2)}
                        </Text>
                        <Text style={styles.itemTotal}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </Text>
                      </View>
                    ))}
                </View>
                <View style={styles.billContainer}>
                  <Text style={styles.billText}>Subtotal: ${subtotal.toFixed(2)}</Text>
                  <Text style={styles.billText}>Impuesto (10%): ${tax.toFixed(2)}</Text>
                  <Text style={[styles.billText, styles.billTotal]}>
                    Total: ${finalTotal.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.itemsContainer}>
                  <Text style={styles.orderId}>{order.tableId}</Text>
                </View>
                <TouchableOpacity style={styles.button} onPress={() => markOrderAsPaid(order.id)}>
                  <Text style={styles.buttonText}>Mark as Paid</Text>
                </TouchableOpacity>
              </View>
            );
          })
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
    flex: 1,
  },
  itemQuantity: {
    fontSize: 16,
    flex: 1,
    textAlign: "center",
  },
  itemTotal: {
    fontSize: 16,
    flex: 1,
    textAlign: "right",
  },
  billContainer: {
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    paddingTop: 10,
    marginBottom: 10,
  },
  billText: {
    fontSize: 16,
    marginBottom: 5,
  },
  billTotal: {
    fontWeight: "bold",
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
