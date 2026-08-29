import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  enterDemo: (email: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  enterDemo: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const getDemoUser = (): User | null => {
    if (typeof window === "undefined") return null;
    const email = localStorage.getItem("nexol_demo_email");
    if (!email) return null;
    return {
      id: "demo-user",
      email,
      aud: "authenticated",
      role: "authenticated",
      app_metadata: {},
      user_metadata: { demo: true },
      created_at: new Date().toISOString(),
    } as User;
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? getDemoUser());
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? getDemoUser());
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    localStorage.removeItem("nexol_demo_email");
    await supabase.auth.signOut();
    setUser(null);
  };

  const enterDemo = (email: string) => {
    const demoEmail = email.trim() || "demo@nexolpay.app";
    localStorage.setItem("nexol_demo_email", demoEmail);
    setUser({
      id: "demo-user",
      email: demoEmail,
      aud: "authenticated",
      role: "authenticated",
      app_metadata: {},
      user_metadata: { demo: true },
      created_at: new Date().toISOString(),
    } as User);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, enterDemo }}>
      {children}
    </AuthContext.Provider>
  );
}
