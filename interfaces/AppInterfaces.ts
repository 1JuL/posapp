import { User } from "firebase/auth";
import { ReactNode } from "react";

export interface UserType {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: "Client" | "Admin" | "Chef" | "Cashier";
}

export interface AuthContextType {
  user: User | null;
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
