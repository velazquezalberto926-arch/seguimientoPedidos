import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Platform,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';

const API_BASE =
  Platform.OS === 'web'
    ? 'http://localhost:3000'
    : 'http://192.168.1.11:3000';

export default function Pedidos() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => {
    if (!authLoading && !user) router.replace('/');
  }, [authLoading, user]);

  useEffect(() => {
    if (!user) return;
    const fetchPedidos = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/pedidos`);
        const data = await res.json();
        setPedidos(data);
      } catch (err) {
        console.error('❌ Error cargando pedidos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPedidos();
  }, [user]);

  if (authLoading || loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );

  if (!user)
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 18, color: 'gray' }}>
          🚫 Inicia sesión para ver tus pedidos
        </Text>
      </View>
    );

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return '#ffb703';
      case 'en_proceso':
        return '#219ebc';
      case 'enviado':
        return '#3a86ff';
      case 'entregado':
        return '#06d6a0';
      case 'cancelado':
        return '#ef233c';
      default:
        return '#adb5bd';
    }
  };

  const pedidosFiltrados =
    filtro === 'todos'
      ? pedidos
      : pedidos.filter((p) => p.estado_actual === filtro);

  const botones = [
    { estado: 'todos', label: '🔁 Todos', color: '#495057' },
    { estado: 'pendiente', label: '🟡 Pendiente', color: '#ffb703' },
    { estado: 'en_proceso', label: '🔵 En proceso', color: '#219ebc' },
    { estado: 'enviado', label: '📦 Enviado', color: '#3a86ff' },
    { estado: 'entregado', label: '✅ Entregado', color: '#06d6a0' },
    { estado: 'cancelado', label: '❌ Cancelado', color: '#ef233c' },
  ];

  const EstadoChip = ({ estado }: { estado: string }) => (
    <View
      style={[
        styles.chip,
        { backgroundColor: getEstadoColor(estado) + '20', borderColor: getEstadoColor(estado) },
      ]}
    >
      <View
        style={[
          styles.dot,
          { backgroundColor: getEstadoColor(estado) },
        ]}
      />
      <Text style={[styles.chipText, { color: getEstadoColor(estado) }]}>
        {estado}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>📦 Lista de Pedidos</Text>

        {/* 🔘 Filtros */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtrosContainer}
        >
          {botones.map((btn) => (
            <TouchableOpacity
              key={btn.estado}
              onPress={() => setFiltro(btn.estado)}
              style={[
                styles.botonFiltro,
                filtro === btn.estado && {
                  backgroundColor: btn.color,
                  borderColor: btn.color,
                },
              ]}
            >
              <Text
                style={[
                  styles.textoFiltro,
                  filtro === btn.estado && { color: '#fff' },
                ]}
              >
                {btn.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 🧾 Lista */}
        <FlatList
          data={pedidosFiltrados}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View
              style={[
                styles.card,
                { borderLeftColor: getEstadoColor(item.estado_actual) },
              ]}
            >
              <View style={styles.rowBetween}>
                <Text style={styles.subtitle}>{item.titulo}</Text>
                <EstadoChip estado={item.estado_actual} />
              </View>
              <Text style={styles.info}>👤 {item.cliente}</Text>
              <Text style={styles.info}>
                📅 {new Date(item.fecha_promesa).toLocaleDateString()}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>No hay pedidos para este estado</Text>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
  container: { flex: 1, padding: 16 },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 14,
    marginTop: 10,
  },
  filtrosContainer: {
    marginBottom: 16,
    paddingHorizontal: 6,
  },
  botonFiltro: {
    borderWidth: 1,
    borderColor: '#adb5bd',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginHorizontal: 4,
    backgroundColor: '#fff',
  },
  textoFiltro: { fontWeight: '600', color: '#495057' },
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  subtitle: { fontWeight: 'bold', fontSize: 17, color: '#212529' },
  info: { color: '#495057', marginTop: 3, fontSize: 15 },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  empty: {
    textAlign: 'center',
    color: '#6c757d',
    fontSize: 16,
    marginTop: 30,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // 🧩 Etiqueta (“chip”) de estado
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  chipText: {
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
});
