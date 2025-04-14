import { User } from "firebase/auth";
import { ReactNode } from "react";

export interface UserType {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: "client" | "admin" | "chef" | "cashier" | "waiter";
}

export interface UserDb {
  id: string;
  createdAt: any;
  email: string;
  name: string;
  phone: string;
  role: string;
}

export interface ExtendedUser extends User {
  role?: "client" | "admin" | "chef" | "cashier" | "waiter";
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
  scanMode?: boolean;
  onScanComplete?: (data: string) => void;
}

export interface RegisterFormProps {
  role: "client" | "admin" | "chef" | "cashier" | "waiter";
  onSuccess?: () => void;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  available: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  createdAt: any;
  status: string;
  tableId: string;
  total: string;
}

export interface EditDishModalProps {
  visible: boolean;
  onClose: () => void;
  dish: {
    id: string;
    name: string;
    price: number;
    description: string;
    imageUrl: string;
  };
}
