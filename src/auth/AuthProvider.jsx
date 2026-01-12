import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { loginRequest, fetchProfile, syncUserWithBackend } from '../api/authService';
import { auth } from '../config/firebaseConfig';
import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth';

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
  const [firebaseUser, setFirebaseUser] = useState(null);

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

  // Listener de Firebase Authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        console.log('🔥 Firebase user authenticated:', fbUser.email);
        setFirebaseUser(fbUser);
        
        try {
          // Obtener token de Firebase
          const firebaseToken = await fbUser.getIdToken();
          
          // Sincronizar con backend
          const backendUser = await syncUserWithBackend(firebaseToken);
          
          // Guardar token y usuario
          setSession(firebaseToken, {
            email: fbUser.email,
            role: backendUser.role || 'RESIDENT',
            userId: backendUser.id,
            firebaseUid: fbUser.uid,
            name: fbUser.displayName || fbUser.email
          });
        } catch (error) {
          console.error('Error syncing with backend:', error);
          // Fallback con datos de Firebase
          setSession(null, {
            email: fbUser.email,
            role: 'RESIDENT',
            firebaseUid: fbUser.uid,
            name: fbUser.displayName || fbUser.email
          });
        }
      } else {
        console.log('🔥 Firebase user logged out');
        setFirebaseUser(null);
        setSession(null);
      }
      setInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async ({ email, password }) => {
    try {
      console.log('🔑 Attempting Firebase login:', email);
      
      // Autenticar con Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseToken = await userCredential.user.getIdToken();
      
      console.log('✅ Firebase login successful');
      
      // Sincronizar con backend
      const backendUser = await syncUserWithBackend(firebaseToken);
      
      const userData = {
        email: userCredential.user.email,
        role: backendUser.role || 'RESIDENT',
        userId: backendUser.id,
        firebaseUid: userCredential.user.uid,
        name: userCredential.user.displayName || userCredential.user.email
      };
      
      setSession(firebaseToken, userData);
      
      return userData;
    } catch (error) {
      console.error('❌ Firebase login error:', error);
      
      // Mensajes de error amigables
      let errorMessage = 'Error al iniciar sesión';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Usuario no encontrado';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Contraseña incorrecta';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Correo electrónico inválido';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Demasiados intentos. Intenta más tarde';
      }
      
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setSession(null);
      setFirebaseUser(null);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Forzar logout local aunque Firebase falle
      setSession(null);
      setFirebaseUser(null);
    }
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
