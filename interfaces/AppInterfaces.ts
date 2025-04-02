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
}

export interface AuthProviderProps {
  children: ReactNode;
}

export interface CameraModalProps {
  isVisible: boolean;
  image?: any;
}

export interface RegisterFormProps {
  role: "client" | "admin" | "chef" | "cashier";
  onSuccess?: () => void;
}
