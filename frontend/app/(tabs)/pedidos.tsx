import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Platform } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';

const API_BASE = Platform.OS === 'web'
  ? 'http://localhost:3000'
  : 'http://192.168.1.71:3000';

export default function Pedidos() {
  const { user } = useAuth();
  const router = useRouter();
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.replace('/');
      return;
    }

    const fetchPedidos = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/pedidos`);
        const data = await res.json();
        setPedidos(data);
      } catch {
        console.error('Error cargando pedidos');
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
  }, [user]);

  if (loading) return <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 40 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📦 Lista de Pedidos</Text>
      <FlatList
        data={pedidos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.subtitle}>{item.titulo}</Text>
            <Text>Cliente: {item.cliente}</Text>
            <Text>Estado: {item.estado_actual}</Text>
            <Text>Fecha Promesa: {new Date(item.fecha_promesa).toLocaleDateString()}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  card: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  subtitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
});
