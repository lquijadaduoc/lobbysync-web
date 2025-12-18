import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { loginRequest, fetchProfile } from '../api/authService';

const AuthContext = createContext(null);

const decodeRole = (token) => {
  try {
    const decoded = jwtDecode(token) || {};
    const directRole =
      decoded.role || decoded.rol || decoded.authority || decoded.roleName;
    const arrayRole = Array.isArray(decoded.authorities)
      ? decoded.authorities[0]
      : null;
    let role = directRole || arrayRole || decoded?.scope || 'GUEST';
    if (typeof role === 'string') {
      role = role.replace(/^ROLE_/i, '').toUpperCase();
    }
    const email =
      decoded.email || decoded.sub || decoded.username || decoded.user?.email || decoded.mail || null;

    return {
      ...decoded,
      role,
      email,
    };
  } catch (error) {
    console.warn('No se pudo decodificar el token', error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const setSession = (newToken, decodedUser = null) => {
    if (newToken) {
      localStorage.setItem('lobbysync_token', newToken);
      const decoded = decodedUser || decodeRole(newToken);
      if (!decoded) {
        localStorage.removeItem('lobbysync_token');
        setToken(null);
        setUser(null);
        return;
      }
      setToken(newToken);
      setUser(decoded);
    } else {
      localStorage.removeItem('lobbysync_token');
      setToken(null);
      setUser(null);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('lobbysync_token');
    if (storedToken) {
      setSession(storedToken);
    }
    setInitializing(false);
  }, []);

  const login = async (credentials) => {
    const { data } = await loginRequest(credentials);
    const receivedToken =
      data?.token || data?.accessToken || data?.access_token || data?.jwt || data?.data?.token || data?.data || data;
    if (!receivedToken) {
      throw new Error('No se recibio un token desde el backend.');
    }
    const decoded = decodeRole(receivedToken);
    setSession(receivedToken, decoded);
    try {
      await fetchProfile();
    } catch (error) {
      console.warn('Perfil no disponible todavia', error);
    }
    setInitializing(false);
    return decoded;
  };

  const logout = () => {
    setSession(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      role: user?.role,
      isAuthenticated: Boolean(token),
      initializing,
      login,
      logout,
    }),
    [token, user, initializing],
  );

  return (
    <AuthContext.Provider value={value}>
      {initializing ? (
        <div className="vh-100 d-flex align-items-center justify-content-center text-muted">
          Inicializando sesion...
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
