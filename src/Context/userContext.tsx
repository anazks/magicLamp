import axios from "axios";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode, Dispatch, SetStateAction } from "react";
import CryptoJS from "crypto-js";

/* =========================
   CONSTANTS
========================= */

const SECRET_KEY = "your_secret_key_123";

/* =========================
   TYPES
========================= */

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  user: any;
  setUser: Dispatch<SetStateAction<any>>;
  isAdmin: boolean;
  setIsAdmin: Dispatch<SetStateAction<boolean>>;
}

interface AuthProviderProps {
  children: ReactNode;
}

/* =========================
   CONTEXT
========================= */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* =========================
   PROVIDER
========================= */

const AuthProvider = ({ children }: AuthProviderProps) => {
  /* ---------- Helpers ---------- */

  const getDecryptedToken = (): string | null => {
    if (typeof window === "undefined") return null;

    const encryptedToken = localStorage.getItem("token");
    if (!encryptedToken) return null;

    try {
      const bytes = CryptoJS.AES.decrypt(encryptedToken, SECRET_KEY);
      const decryptedToken = bytes.toString(CryptoJS.enc.Utf8);
      return decryptedToken || null;
    } catch (error) {
      console.error("Token decryption failed:", error);
      return null;
    }
  };

  /* ---------- State ---------- */

  const [token, setTokenState] = useState<string | null>(getDecryptedToken);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  /* ---------- Token Setter ---------- */

  const setToken = (newToken: string | null) => {
    if (typeof window === "undefined") return;

    if (newToken) {
      const encrypted = CryptoJS.AES.encrypt(
        newToken,
        SECRET_KEY
      ).toString();
      localStorage.setItem("token", encrypted);
    } else {
      localStorage.removeItem("token");
    }

    setTokenState(newToken);
  };

  /* ---------- Axios Auth Header ---------- */

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common.Authorization;
    }
  }, [token]);

  /* ---------- Memoized Context ---------- */

  const contextValue = useMemo<AuthContextType>(
    () => ({
      token,
      setToken,
      user,
      setUser,
      isAdmin,
      setIsAdmin,
    }),
    [token, user, isAdmin]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/* =========================
   HOOK
========================= */

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthProvider;
