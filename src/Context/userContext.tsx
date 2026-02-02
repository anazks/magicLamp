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
  setIsAdmin: (value: boolean) => void;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

/* =========================
   CONTEXT
========================= */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* =========================
   HELPERS
========================= */

const decryptToken = (): string | null => {
  const encrypted = localStorage.getItem("token");

  if (!encrypted) return null;

  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8) || null;
  } catch {
    return null;
  }
};

const getStoredAdmin = (): boolean => {
  return localStorage.getItem("isAdmin") === "true";
};

/* =========================
   PROVIDER
========================= */

const AuthProvider = ({ children }: AuthProviderProps) => {

  /* ---------- State ---------- */

  const [token, setTokenState] = useState<string | null>(decryptToken);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdminState] = useState<boolean>(getStoredAdmin);

  /* ---------- Token Setter ---------- */

  const setToken = (newToken: string | null) => {

    if (newToken) {
      const encrypted = CryptoJS.AES.encrypt(
        newToken,
        SECRET_KEY
      ).toString();

      localStorage.setItem("token", encrypted);
      setTokenState(newToken);
    } else {
      localStorage.removeItem("token");
      setTokenState(null);
    }
  };

  /* ---------- Admin Setter ---------- */

  const setIsAdmin = (value: boolean) => {
    localStorage.setItem("isAdmin", value.toString());
    setIsAdminState(value);
  };

  /* ---------- Logout (VERY IMPORTANT) ---------- */

  const logout = () => {
    localStorage.clear();

    setTokenState(null);
    setUser(null);
    setIsAdminState(false);

    delete axios.defaults.headers.common.Authorization;

    // Optional redirect
    window.location.href = "/login";
  };

  /* ---------- Axios Header ---------- */

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common.Authorization;
    }
  }, [token]);

  /* ---------- Memo ---------- */

  const contextValue = useMemo<AuthContextType>(
    () => ({
      token,
      setToken,
      user,
      setUser,
      isAdmin,
      setIsAdmin,
      logout,
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
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};

export default AuthProvider;
