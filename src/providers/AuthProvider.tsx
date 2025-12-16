"use client";

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useTRPC } from "@/trpc";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  isActive: boolean;
  emailVerified: string | null;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  signOutAll: () => Promise<void>;
  refetch: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const hasSetupListeners = useRef(false);
  const isCurrentlyOnline = useRef(true);

  // Fetch current user
  const {
    data: user,
    isLoading,
    isFetched,
    refetch,
  } = useQuery({
    ...trpc.auth.me.queryOptions(),
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Sign out mutation
  const signOutMutation = useMutation(
    trpc.auth.signOut.mutationOptions({
      onSuccess: () => {
        queryClient.clear();
        router.push("/auth/signin");
        router.refresh();
      },
    })
  );

  // Sign out all mutation
  const signOutAllMutation = useMutation(
    trpc.auth.signOutAll.mutationOptions({
      onSuccess: () => {
        queryClient.clear();
        router.push("/auth/signin");
        router.refresh();
      },
    })
  );

  // Online/offline mutations
  const setOnlineMutation = useMutation(trpc.auth.setOnline.mutationOptions());
  const setOfflineMutation = useMutation(
    trpc.auth.setOffline.mutationOptions()
  );

  const signOut = useCallback(async () => {
    await signOutMutation.mutateAsync();
  }, [signOutMutation]);

  const signOutAll = useCallback(async () => {
    await signOutAllMutation.mutateAsync();
  }, [signOutAllMutation]);

  // Track online/offline status
  useEffect(() => {
    // Only setup once when user is authenticated
    if (!user || hasSetupListeners.current) return;
    hasSetupListeners.current = true;

    const setOnline = () => {
      if (!isCurrentlyOnline.current) {
        isCurrentlyOnline.current = true;
        setOnlineMutation.mutate();
      }
    };

    const setOffline = () => {
      if (isCurrentlyOnline.current) {
        isCurrentlyOnline.current = false;
        setOfflineMutation.mutate();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setOffline();
      } else {
        setOnline();
      }
    };

    const handleBeforeUnload = () => {
      // Use sendBeacon for reliable offline status on tab close
      navigator.sendBeacon("/api/trpc/auth.setOffline", "");
    };

    const handleFocus = () => setOnline();
    const handleBlur = () => setOffline();

    // Add event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      hasSetupListeners.current = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const value: AuthContextType = useMemo(
    () => ({
      user: user ?? null,
      isLoading: !isFetched || isLoading,
      isAuthenticated: !!user,
      signOut,
      signOutAll,
      refetch: () => refetch(),
    }),
    [user, isFetched, isLoading, signOut, signOutAll, refetch]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
