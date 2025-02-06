"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from "react";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
}

interface Tenant {
  id: string;
  name: string;
  title: string;
  credit: number;
}

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  setAuth: (user: User | null, tenant: Tenant | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);

  useEffect(() => {
    // Sayfa yüklendiğinde localStorage'dan kullanıcı bilgilerini al
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setTenant(parsedUser.tenant);
    }
  }, []);

  const setAuth = (newUser: User | null, newTenant: Tenant | null) => {
    setUser(newUser);
    setTenant(newTenant);
  };

  return (
    <AuthContext.Provider value={{ user, tenant, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
} 