import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, UserRole, AuthState, StoredUser } from "@/types";

const USERS_KEY = "@stored_users_v2";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  verify2FA: (code: string) => Promise<boolean>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  addUser: (userData: Omit<StoredUser, "id" | "createdAt" | "isActive">) => Promise<StoredUser>;
  getUsers: () => Promise<StoredUser[]>;
  toggleUserActive: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_USERS: StoredUser[] = [
  {
    id: "1",
    email: "admin@rewe-group.de",
    password: "admin123",
    name: "Max Admin",
    role: "admin",
    twoFactorEnabled: true,
    createdAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: "2",
    email: "dev@rewe-group.de",
    password: "dev123",
    name: "Anna Entwickler",
    role: "developer",
    twoFactorEnabled: true,
    createdAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: "3",
    email: "tech@rewe-group.de",
    password: "tech123",
    name: "Thomas Techniker",
    role: "user",
    twoFactorEnabled: false,
    createdAt: new Date().toISOString(),
    isActive: true,
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const usersRef = useRef<StoredUser[]>(DEFAULT_USERS);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      await AsyncStorage.removeItem("@stored_users");
      
      const stored = await AsyncStorage.getItem(USERS_KEY);
      if (stored) {
        usersRef.current = JSON.parse(stored);
      } else {
        usersRef.current = DEFAULT_USERS;
        await AsyncStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
      }

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
      usersRef.current = DEFAULT_USERS;
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const users = usersRef.current;
    const foundUser = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password && u.isActive
    );

    if (foundUser) {
      const user: User = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role,
        twoFactorEnabled: foundUser.twoFactorEnabled,
        createdAt: foundUser.createdAt,
      };

      if (foundUser.twoFactorEnabled) {
        setPendingUser(user);
        return true;
      } else {
        await AsyncStorage.setItem("@auth_user", JSON.stringify(user));
        setState({
          user,
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

  const addUser = async (userData: Omit<StoredUser, "id" | "createdAt" | "isActive">): Promise<StoredUser> => {
    const newUser: StoredUser = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    const updatedUsers = [...usersRef.current, newUser];
    usersRef.current = updatedUsers;
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    return newUser;
  };

  const getUsers = async (): Promise<StoredUser[]> => {
    return usersRef.current;
  };

  const toggleUserActive = async (userId: string): Promise<void> => {
    const updatedUsers = usersRef.current.map((u) =>
      u.id === userId ? { ...u, isActive: !u.isActive } : u
    );
    usersRef.current = updatedUsers;
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        verify2FA,
        logout,
        switchRole,
        addUser,
        getUsers,
        toggleUserActive,
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
