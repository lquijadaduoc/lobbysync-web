// Firebase Configuration para LobbySync
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// TODO: Reemplazar estos valores con las credenciales reales del proyecto lobbysync-91db0
// Obtener desde: https://console.firebase.google.com/project/lobbysync-91db0/settings/general
const firebaseConfig = {
  apiKey: "AIzaSyDyZyZ80gNbSCdCpAseFVEvLLwDaTqOcPw",
  authDomain: "lobbysync-91db0.firebaseapp.com",
  projectId: "lobbysync-91db0",
  storageBucket: "lobbysync-91db0.firebasestorage.app",
  messagingSenderId: "946690131650",
  appId: "1:946690131650:web:a13554da588121e43f9d5b"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar instancia de autenticación
export const auth = getAuth(app);
