import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔄 Cargar usuario guardado al iniciar la app
  useEffect(() => {
    const loadUser = async () => {
      try {
        const saved = await AsyncStorage.getItem('user');
        if (saved) {
          setUser(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Error cargando usuario:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // ✅ Iniciar sesión o guardar usuario tras registro
  const login = async (userData) => {
    try {
      if (!userData) {
        console.warn('⚠️ Intento de guardar usuario vacío en AsyncStorage');
        return;
      }
      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error guardando usuario:', error);
    }
  };

  // 🚪 Cerrar sesión
  const logout = async () => {
    try {
      setUser(null);
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Error eliminando usuario:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
