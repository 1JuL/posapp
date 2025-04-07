import { User } from "firebase/auth";
import { ReactNode } from "react";

export interface UserType {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: "client" | "admin" | "chef" | "cashier";
}

export interface ExtendedUser extends User {
  role?: "client" | "admin" | "chef" | "cashier";
}

export interface AuthContextType {
  user: ExtendedUser | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  register: (user: UserType) => Promise<void>;
  staffRegister: (adminPassword: string, userData: UserType) => Promise<void>;
}

export interface AuthProviderProps {
  children: ReactNode;
}

export interface CameraModalProps {
  isVisible: boolean;
  image?: any;
  onImageSelected: (uri: string) => void;
  onCancel: () => void;
}

export interface RegisterFormProps {
  role: "client" | "admin" | "chef" | "cashier";
  onSuccess?: () => void;
}
