import { createContext } from "react"

export interface AuthContextValue {
  isAuthenticated: boolean
  isLoading: boolean
  email: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
