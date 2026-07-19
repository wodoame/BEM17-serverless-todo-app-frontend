import { useEffect, useState, type ReactNode } from "react"
import {
  getCurrentUser,
  signIn as amplifySignIn,
  signOut as amplifySignOut,
  signUp as amplifySignUp,
} from "aws-amplify/auth"
import { AuthContext } from "@/lib/auth-context-value"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [email, setEmail] = useState<string | null>(null)

  async function refresh() {
    try {
      const user = await getCurrentUser()
      setIsAuthenticated(true)
      setEmail(user.signInDetails?.loginId ?? user.username)
    } catch {
      setIsAuthenticated(false)
      setEmail(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- check session on mount, isLoading starts true already
    refresh()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        email,
        signIn: async (username, password) => {
          await amplifySignIn({ username, password })
          await refresh()
        },
        signUp: async (username, password) => {
          const result = await amplifySignUp({
            username,
            password,
            options: { userAttributes: { email: username } },
          })

          if (result.nextStep.signUpStep === "DONE") {
            await amplifySignIn({ username, password })
            await refresh()
          }
        },
        signOut: async () => {
          await amplifySignOut()
          setIsAuthenticated(false)
          setEmail(null)
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
