import { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../utils/firebase";
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { AuthContextType, AuthProviderProps, UserType } from "@/interfaces/AppInterfaces";
import { doc, setDoc } from "firebase/firestore";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  const register = async (user: UserType): Promise<void> => {
    const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
    const firebaseUser = userCredential.user;
    await updateProfile(firebaseUser, { displayName: user.name });
    await userCredential.user.reload();

    await setDoc(doc(db, "users", firebaseUser.uid), {
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role || "client",
      createdAt: new Date(),
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
