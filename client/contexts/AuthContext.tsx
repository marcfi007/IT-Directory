import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  User,
  UserRole,
  AuthState,
  StoredUser,
  PendingRegistration,
  TwoFactorMethod,
} from "@/types";

const USERS_KEY = "@stored_users_v3";
const PENDING_REGISTRATIONS_KEY = "@pending_registrations";
const TOTP_CODES_KEY = "@totp_codes";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<LoginResult>;
  verify2FA: (code: string) => Promise<boolean>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  register: (
    email: string,
    password: string,
    name: string,
  ) => Promise<RegistrationResult>;
  addUser: (
    userData: Omit<StoredUser, "id" | "createdAt" | "isActive" | "registrationStatus">,
  ) => Promise<StoredUser>;
  getUsers: () => Promise<StoredUser[]>;
  getPendingRegistrations: () => Promise<PendingRegistration[]>;
  approveRegistration: (
    registrationId: string,
    role: UserRole,
    approverId: string,
  ) => Promise<void>;
  rejectRegistration: (registrationId: string) => Promise<void>;
  toggleUserActive: (userId: string) => Promise<void>;
  setup2FA: (method: TwoFactorMethod) => Promise<TwoFASetupResult>;
  send2FACode: () => Promise<boolean>;
  pendingUser: User | null;
  requires2FASetup: boolean;
}

interface LoginResult {
  success: boolean;
  requires2FA: boolean;
  requires2FASetup: boolean;
  error?: string;
}

interface RegistrationResult {
  success: boolean;
  message: string;
}

interface TwoFASetupResult {
  success: boolean;
  secret?: string;
  qrCode?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Generate a simple TOTP secret (in production, use a proper library)
const generateTOTPSecret = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let secret = "";
  for (let i = 0; i < 16; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
};

// Generate a simple 6-digit code
const generate6DigitCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Simple TOTP verification (in production, use a proper library)
const verifyTOTP = (secret: string, code: string): boolean => {
  // For demo purposes, we'll store and check codes
  // In production, implement proper TOTP algorithm
  return true; // Will be verified against stored code
};

const DEFAULT_USERS: StoredUser[] = [
  {
    id: "1",
    email: "admin@rewe-group.de",
    password: "admin123",
    name: "Max Admin",
    role: "admin",
    twoFactorEnabled: true,
    twoFactorMethod: "totp",
    twoFactorSecret: generateTOTPSecret(),
    createdAt: new Date().toISOString(),
    isActive: true,
    registrationStatus: "approved",
  },
  {
    id: "2",
    email: "dev@rewe-group.de",
    password: "dev123",
    name: "Anna Entwickler",
    role: "developer",
    twoFactorEnabled: true,
    twoFactorMethod: "totp",
    twoFactorSecret: generateTOTPSecret(),
    createdAt: new Date().toISOString(),
    isActive: true,
    registrationStatus: "approved",
  },
  {
    id: "3",
    email: "tech@rewe-group.de",
    password: "tech123",
    name: "Thomas Techniker",
    role: "user",
    twoFactorEnabled: true,
    twoFactorMethod: "email",
    createdAt: new Date().toISOString(),
    isActive: true,
    registrationStatus: "approved",
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [requires2FASetup, setRequires2FASetup] = useState(false);
  const [currentTOTPCode, setCurrentTOTPCode] = useState<string | null>(null);
  const usersRef = useRef<StoredUser[]>(DEFAULT_USERS);
  const pendingRegistrationsRef = useRef<PendingRegistration[]>([]);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Clear old user storage
      await AsyncStorage.removeItem("@stored_users");
      await AsyncStorage.removeItem("@stored_users_v2");

      const stored = await AsyncStorage.getItem(USERS_KEY);
      if (stored) {
        usersRef.current = JSON.parse(stored);
      } else {
        usersRef.current = DEFAULT_USERS;
        await AsyncStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
      }

      const pendingRegs = await AsyncStorage.getItem(PENDING_REGISTRATIONS_KEY);
      if (pendingRegs) {
        pendingRegistrationsRef.current = JSON.parse(pendingRegs);
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
    } catch {
      usersRef.current = DEFAULT_USERS;
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const login = async (
    email: string,
    password: string,
  ): Promise<LoginResult> => {
    const users = usersRef.current;
    const foundUser = users.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.password === password,
    );

    if (!foundUser) {
      return { success: false, requires2FA: false, requires2FASetup: false, error: "Ungueltige Anmeldedaten" };
    }

    if (!foundUser.isActive) {
      return { success: false, requires2FA: false, requires2FASetup: false, error: "Konto ist deaktiviert" };
    }

    if (foundUser.registrationStatus === "pending") {
      return { success: false, requires2FA: false, requires2FASetup: false, error: "Registrierung noch nicht freigegeben" };
    }

    if (foundUser.registrationStatus === "rejected") {
      return { success: false, requires2FA: false, requires2FASetup: false, error: "Registrierung wurde abgelehnt" };
    }

    const user: User = {
      id: foundUser.id,
      email: foundUser.email,
      name: foundUser.name,
      role: foundUser.role,
      twoFactorEnabled: foundUser.twoFactorEnabled,
      twoFactorMethod: foundUser.twoFactorMethod,
      createdAt: foundUser.createdAt,
    };

    // 2FA is mandatory for all users
    if (!foundUser.twoFactorEnabled || !foundUser.twoFactorMethod) {
      setPendingUser(user);
      setRequires2FASetup(true);
      return { success: true, requires2FA: false, requires2FASetup: true };
    }

    setPendingUser(user);
    setRequires2FASetup(false);

    // Generate and store code for email-based 2FA
    if (foundUser.twoFactorMethod === "email") {
      const code = generate6DigitCode();
      setCurrentTOTPCode(code);
      await AsyncStorage.setItem(
        TOTP_CODES_KEY,
        JSON.stringify({ code, expiresAt: Date.now() + 5 * 60 * 1000 }),
      );
      console.log(`[2FA Email] Code fuer ${email}: ${code}`);
    } else {
      // For TOTP, generate a time-based code (simplified for demo)
      const code = generate6DigitCode();
      setCurrentTOTPCode(code);
      await AsyncStorage.setItem(
        TOTP_CODES_KEY,
        JSON.stringify({ code, expiresAt: Date.now() + 30 * 1000 }),
      );
      console.log(`[2FA TOTP] Code fuer ${email}: ${code}`);
    }

    return { success: true, requires2FA: true, requires2FASetup: false };
  };

  const verify2FA = async (code: string): Promise<boolean> => {
    if (!pendingUser) return false;

    const storedCodeData = await AsyncStorage.getItem(TOTP_CODES_KEY);
    if (storedCodeData) {
      const { code: storedCode, expiresAt } = JSON.parse(storedCodeData);
      if (Date.now() > expiresAt) {
        return false; // Code expired
      }
      if (code === storedCode) {
        await AsyncStorage.setItem("@auth_user", JSON.stringify(pendingUser));
        setState({
          user: pendingUser,
          isAuthenticated: true,
          isLoading: false,
        });
        setPendingUser(null);
        setCurrentTOTPCode(null);
        await AsyncStorage.removeItem(TOTP_CODES_KEY);
        return true;
      }
    }
    return false;
  };

  const send2FACode = async (): Promise<boolean> => {
    if (!pendingUser) return false;

    const foundUser = usersRef.current.find((u) => u.id === pendingUser.id);
    if (!foundUser) return false;

    const code = generate6DigitCode();
    setCurrentTOTPCode(code);
    await AsyncStorage.setItem(
      TOTP_CODES_KEY,
      JSON.stringify({ code, expiresAt: Date.now() + 5 * 60 * 1000 }),
    );
    console.log(`[2FA] Neuer Code fuer ${foundUser.email}: ${code}`);
    return true;
  };

  const setup2FA = async (method: TwoFactorMethod): Promise<TwoFASetupResult> => {
    if (!pendingUser) return { success: false };

    const secret = generateTOTPSecret();
    const code = generate6DigitCode();

    // Update user with 2FA settings
    const updatedUsers = usersRef.current.map((u) =>
      u.id === pendingUser.id
        ? {
            ...u,
            twoFactorEnabled: true,
            twoFactorMethod: method,
            twoFactorSecret: secret,
          }
        : u,
    );
    usersRef.current = updatedUsers;
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));

    // Store verification code
    setCurrentTOTPCode(code);
    await AsyncStorage.setItem(
      TOTP_CODES_KEY,
      JSON.stringify({ code, expiresAt: Date.now() + 5 * 60 * 1000 }),
    );

    console.log(`[2FA Setup] Code fuer ${pendingUser.email}: ${code}`);

    setRequires2FASetup(false);

    return {
      success: true,
      secret: method === "totp" ? secret : undefined,
      qrCode:
        method === "totp"
          ? `otpauth://totp/IT-Markt:${pendingUser.email}?secret=${secret}&issuer=IT-Markt`
          : undefined,
    };
  };

  const logout = async () => {
    await AsyncStorage.removeItem("@auth_user");
    await AsyncStorage.removeItem(TOTP_CODES_KEY);
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    setPendingUser(null);
    setCurrentTOTPCode(null);
    setRequires2FASetup(false);
  };

  const switchRole = (role: UserRole) => {
    if (state.user) {
      const updatedUser = { ...state.user, role };
      setState((prev) => ({ ...prev, user: updatedUser }));
      AsyncStorage.setItem("@auth_user", JSON.stringify(updatedUser));
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
  ): Promise<RegistrationResult> => {
    // Check if email already exists
    const existingUser = usersRef.current.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );
    if (existingUser) {
      return { success: false, message: "E-Mail-Adresse bereits registriert" };
    }

    const existingRegistration = pendingRegistrationsRef.current.find(
      (r) => r.email.toLowerCase() === email.toLowerCase(),
    );
    if (existingRegistration) {
      return { success: false, message: "Registrierung bereits beantragt" };
    }

    const newRegistration: PendingRegistration = {
      id: Date.now().toString(),
      email: email.toLowerCase(),
      password,
      name,
      requestedAt: new Date().toISOString(),
      status: "pending",
    };

    pendingRegistrationsRef.current = [
      ...pendingRegistrationsRef.current,
      newRegistration,
    ];
    await AsyncStorage.setItem(
      PENDING_REGISTRATIONS_KEY,
      JSON.stringify(pendingRegistrationsRef.current),
    );

    return {
      success: true,
      message:
        "Registrierung erfolgreich beantragt. Ein Administrator wird Ihre Anfrage pruefen.",
    };
  };

  const addUser = async (
    userData: Omit<StoredUser, "id" | "createdAt" | "isActive" | "registrationStatus">,
  ): Promise<StoredUser> => {
    const newUser: StoredUser = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      isActive: true,
      registrationStatus: "approved",
      twoFactorEnabled: true, // 2FA is mandatory
    };

    const updatedUsers = [...usersRef.current, newUser];
    usersRef.current = updatedUsers;
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    return newUser;
  };

  const getUsers = async (): Promise<StoredUser[]> => {
    return usersRef.current;
  };

  const getPendingRegistrations = async (): Promise<PendingRegistration[]> => {
    return pendingRegistrationsRef.current.filter((r) => r.status === "pending");
  };

  const approveRegistration = async (
    registrationId: string,
    role: UserRole,
    approverId: string,
  ): Promise<void> => {
    const registration = pendingRegistrationsRef.current.find(
      (r) => r.id === registrationId,
    );
    if (!registration) return;

    // Create new user from registration
    const newUser: StoredUser = {
      id: Date.now().toString(),
      email: registration.email,
      password: registration.password,
      name: registration.name,
      role,
      twoFactorEnabled: false, // Will be set up on first login
      createdAt: new Date().toISOString(),
      createdBy: approverId,
      isActive: true,
      registrationStatus: "approved",
      approvedBy: approverId,
      approvedAt: new Date().toISOString(),
    };

    // Add user
    const updatedUsers = [...usersRef.current, newUser];
    usersRef.current = updatedUsers;
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));

    // Update registration status
    pendingRegistrationsRef.current = pendingRegistrationsRef.current.map((r) =>
      r.id === registrationId ? { ...r, status: "approved" as const } : r,
    );
    await AsyncStorage.setItem(
      PENDING_REGISTRATIONS_KEY,
      JSON.stringify(pendingRegistrationsRef.current),
    );
  };

  const rejectRegistration = async (registrationId: string): Promise<void> => {
    pendingRegistrationsRef.current = pendingRegistrationsRef.current.map((r) =>
      r.id === registrationId ? { ...r, status: "rejected" as const } : r,
    );
    await AsyncStorage.setItem(
      PENDING_REGISTRATIONS_KEY,
      JSON.stringify(pendingRegistrationsRef.current),
    );
  };

  const toggleUserActive = async (userId: string): Promise<void> => {
    const updatedUsers = usersRef.current.map((u) =>
      u.id === userId ? { ...u, isActive: !u.isActive } : u,
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
        register,
        addUser,
        getUsers,
        getPendingRegistrations,
        approveRegistration,
        rejectRegistration,
        toggleUserActive,
        setup2FA,
        send2FACode,
        pendingUser,
        requires2FASetup,
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
