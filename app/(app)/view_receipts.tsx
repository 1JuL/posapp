import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { collection, query, orderBy, onSnapshot, where, doc, getDoc } from "firebase/firestore";
import { db } from "@/utils/firebase";
import DateTimePicker from "@react-native-community/datetimepicker";
import Toast from "react-native-toast-message";

export default function ViewReceipts() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  // Diccionario para almacenar los nombres de usuario: { userId: userName }
  const [usersMap, setUsersMap] = useState<{ [key: string]: string }>({});

  // Consulta de recibos, con filtro por fecha si se selecciona alguno
  useEffect(() => {
    setLoading(true);
    const receiptsRef = collection(db, "receipts");
    let receiptsQuery;
    if (filterDate) {
      // Calcula el inicio y fin del día seleccionado
      const start = new Date(filterDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(filterDate);
      end.setHours(23, 59, 59, 999);
      receiptsQuery = query(
        receiptsRef,
        where("createdAt", ">=", start),
        where("createdAt", "<=", end),
        orderBy("createdAt", "desc")
      );
    } else {
      receiptsQuery = query(receiptsRef, orderBy("createdAt", "desc"));
    }

    const unsubscribe = onSnapshot(
      receiptsQuery,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReceipts(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching receipts: ", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "No se pudieron cargar los recibos.",
        });
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [filterDate]);

  // Cada vez que se actualicen los recibos, extraer los userId únicos y obtener el nombre desde la colección "users"
  useEffect(() => {
    const fetchUsers = async () => {
      const uniqueUserIds = Array.from(new Set(receipts.map((r) => r.userId)));
      const newUsersMap = { ...usersMap };
      await Promise.all(
        uniqueUserIds.map(async (uid) => {
          if (!newUsersMap[uid]) {
            const userDoc = await getDoc(doc(db, "users", uid));
            if (userDoc.exists()) {
              newUsersMap[uid] = userDoc.data().name;
            } else {
              newUsersMap[uid] = "Usuario desconocido";
            }
          }
        })
      );
      setUsersMap(newUsersMap);
    };
    if (receipts.length > 0) {
      fetchUsers();
    }
  }, [receipts]);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFilterDate(selectedDate);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Filtro por Fecha */}
      <View style={styles.filterContainer}>
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.filterButtonText}>
            {filterDate ? `Filtrar: ${filterDate.toLocaleDateString()}` : "Seleccionar Fecha"}
          </Text>
        </TouchableOpacity>
        {filterDate && (
          <TouchableOpacity style={styles.clearButton} onPress={() => setFilterDate(null)}>
            <Text style={styles.clearButtonText}>Limpiar Filtro</Text>
          </TouchableOpacity>
        )}
      </View>
      {showDatePicker && (
        <DateTimePicker
          value={filterDate || new Date()}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10A37F" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          {receipts.length === 0 ? (
            <Text style={styles.noReceiptsText}>No hay recibos</Text>
          ) : (
            receipts.map((receipt) => (
              <View key={receipt.id} style={styles.receiptCard}>
                <Text style={styles.receiptId}>Recibo #{receipt.orderId}</Text>
                <Text style={styles.receiptUser}>Usuario: {receipt.userId}</Text>
                <Text style={styles.receiptUser}>Nombre: {usersMap[receipt.userId]}</Text>
                <Text style={styles.receiptDate}>
                  {receipt.createdAt?.toDate
                    ? receipt.createdAt.toDate().toLocaleString()
                    : new Date(receipt.createdAt.seconds * 1000).toLocaleString()}
                </Text>
                <View style={styles.receiptItems}>
                  {receipt.items &&
                    receipt.items.map((item: any, idx: number) => (
                      <View key={idx} style={styles.itemRow}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemQuantity}>
                          {item.quantity} x ${item.price.toFixed(2)}
                        </Text>
                      </View>
                    ))}
                </View>
                <View style={styles.billContainer}>
                  <Text style={styles.billText}>Subtotal: ${receipt.subtotal.toFixed(2)}</Text>
                  <Text style={styles.billText}>Impuesto: ${receipt.tax.toFixed(2)}</Text>
                  <Text style={[styles.billText, styles.billTotal]}>
                    Total: ${receipt.finalTotal.toFixed(2)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  filterButton: {
    backgroundColor: "#10A37F",
    padding: 10,
    borderRadius: 8,
  },
  filterButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  clearButton: {
    backgroundColor: "#ff4444",
    padding: 10,
    borderRadius: 8,
  },
  clearButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  container: {
    padding: 15,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noReceiptsText: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
  },
  receiptCard: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
  },
  receiptId: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  receiptUser: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
  },
  receiptDate: {
    fontSize: 14,
    marginBottom: 10,
    color: "#555",
  },
  receiptItems: {
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
  billContainer: {
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    paddingTop: 10,
  },
  billText: {
    fontSize: 16,
    marginBottom: 5,
  },
  billTotal: {
    fontWeight: "bold",
  },
});
