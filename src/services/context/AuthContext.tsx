import { createContext, useContext, ReactNode } from "react";
import { useUser, useLogin, useLogout, User } from "@/hooks/useAuth";

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: ReturnType<typeof useLogin>["mutateAsync"];
  logout: ReturnType<typeof useLogout>["mutate"];
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useUser();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined);
  };

  const value: AuthContextType = {
    user: (user as User) || null,
    isAuthenticated: !!user,
    isLoading,
    login: loginMutation.mutateAsync,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
