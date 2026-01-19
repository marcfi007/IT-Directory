import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, UserRole, AuthState } from "@/types";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  verify2FA: (code: string) => Promise<boolean>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USERS: Record<string, { password: string; user: User }> = {
  "admin@itmarkt.de": {
    password: "admin123",
    user: {
      id: "1",
      email: "admin@itmarkt.de",
      name: "Max Admin",
      role: "admin",
      twoFactorEnabled: true,
      createdAt: new Date().toISOString(),
    },
  },
  "dev@itmarkt.de": {
    password: "dev123",
    user: {
      id: "2",
      email: "dev@itmarkt.de",
      name: "Anna Entwickler",
      role: "developer",
      twoFactorEnabled: true,
      createdAt: new Date().toISOString(),
    },
  },
  "tech@itmarkt.de": {
    password: "tech123",
    user: {
      id: "3",
      email: "tech@itmarkt.de",
      name: "Thomas Techniker",
      role: "user",
      twoFactorEnabled: false,
      createdAt: new Date().toISOString(),
    },
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const [pendingUser, setPendingUser] = useState<User | null>(null);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("@auth_user");
      if (storedUser) {
        const user = JSON.parse(storedUser) as User;
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const demoUser = DEMO_USERS[email.toLowerCase()];
    if (demoUser && demoUser.password === password) {
      if (demoUser.user.twoFactorEnabled) {
        setPendingUser(demoUser.user);
        return true;
      } else {
        await AsyncStorage.setItem("@auth_user", JSON.stringify(demoUser.user));
        setState({
          user: demoUser.user,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      }
    }
    return false;
  };

  const verify2FA = async (code: string): Promise<boolean> => {
    if (code === "123456" && pendingUser) {
      await AsyncStorage.setItem("@auth_user", JSON.stringify(pendingUser));
      setState({
        user: pendingUser,
        isAuthenticated: true,
        isLoading: false,
      });
      setPendingUser(null);
      return true;
    }
    return false;
  };

  const logout = async () => {
    await AsyncStorage.removeItem("@auth_user");
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    setPendingUser(null);
  };

  const switchRole = (role: UserRole) => {
    if (state.user) {
      const updatedUser = { ...state.user, role };
      setState((prev) => ({ ...prev, user: updatedUser }));
      AsyncStorage.setItem("@auth_user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        verify2FA,
        logout,
        switchRole,
      }}
    >
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
