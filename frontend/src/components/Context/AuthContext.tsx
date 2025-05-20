import React, { createContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

export interface AuthContextType {
  currentUserId: string;
  userName: string;
  userDesignation: string;
  employeeRfid: string;
  employeeCode: string;
  employeeId: string;
  authorized: boolean;
  userEmail: string;
  loading: boolean;
  login: (user: { email: string; password: string }) => Promise<void>;
  register: (user: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  verifySession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
// context file 
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const backend_URI = import.meta.env.VITE_Backend_URI;
  const [authState, setAuthState] = useState({
    currentUserId: "",
    userName: "",
    userDesignation: "",
    authorized: false,
    userEmail: "",
    employeeId: "",
    employeeCode: "",
    employeeRfid: "",
    token:""
  });
  
  const [loading, setLoading] = useState(true);

  // Verify session using the HTTP‑only cookie.
  const verifySession = async () => {
    try {
      const { data } = await axios.get(`${backend_URI}/api/auth/verify`, {
        withCredentials: true,
      });
      setAuthState({
        currentUserId: data.id,
        userName: data.name,
        userDesignation: data.designation,
        employeeId: data.employeeId,
        employeeCode: data.empcode,
        employeeRfid: data.rfidcardno,
        authorized: true,
        userEmail: data.email,
        token:data.token
      });
    } catch (error) {
      setAuthState({
        currentUserId: "",
        userName: "",
        userDesignation: "",
        authorized: false,
        userEmail: "",
        token:"",
        employeeId: "",
        employeeCode: "",
        employeeRfid: "",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verifySession();
  }, []);

  // Login: Calls backend and then re‑verify session.
  const login = async (user: { email: string; password: string }) => {
    try {
      await axios.post(`${backend_URI}/api/auth/login`, user, { withCredentials: true });
      await verifySession();
    } catch (error) {
      throw new Error("Login failed");
    }
  };

  // Registration function.
  const register = async (user: { name: string; email: string; password: string }) => {
    try {
      await axios.post(`${backend_URI}/api/auth/register`, user, { withCredentials: true });
    } catch (error) {
      throw new Error("Registration failed");
    }
  };

  // Logout clears the authentication state.
  const logout = async () => {
    try {
      await axios.post(`${backend_URI}/api/auth/logout`, {}, { withCredentials: true });
      setAuthState({
        currentUserId: "",
        userName: "",
        userDesignation: "",
        authorized: false,
        userEmail: "",
        token:"",
        employeeId: "",
        employeeCode: "",
        employeeRfid: "",
      });
    } catch (error) {
      throw new Error("Logout failed");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        loading,
        login,
        register,
        logout,
        verifySession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  const isAdmin = context.authorized && context.userDesignation.toLowerCase() === "admin";
  return { ...context, isAdmin };
};
