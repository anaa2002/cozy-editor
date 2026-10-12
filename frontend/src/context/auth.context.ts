import { createContext } from "react";
import type { IUser } from "../types/auth.types";

export interface IAuthContext {
  user: IUser | null;
  isLoading: boolean;
  login: (userData: { email: string; password: string }) => Promise<void>;
  signup: (userData: {
    username: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<IAuthContext | null>(null);
