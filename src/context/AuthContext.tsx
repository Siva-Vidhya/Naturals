"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  onboardingComplete: boolean | null;
  signOut: () => Promise<void>;
  checkOnboardingStatus: (userId?: string) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  onboardingComplete: null,
  signOut: async () => {},
  checkOnboardingStatus: async () => false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const router = useRouter();

  const checkOnboardingStatus = useCallback(async (userId?: string) => {
    const id = userId || user?.id;
    if (!id) return false;

    try {
      const { data } = await supabase
        .from('onboarding_preferences')
        .select('id')
        .eq('user_id', id)
        .maybeSingle();
      
      const complete = !!data;
      setOnboardingComplete(complete);
      return complete;
    } catch (error) {
      console.error("[AuthContext] Error checking onboarding status:", error);
      return false;
    }
  }, [user?.id]);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          if (initialSession?.user) {
            await checkOnboardingStatus(initialSession.user.id);
          } else {
            setOnboardingComplete(null);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error("[AuthContext] Auth initialization error:", error);
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (mounted) {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          await checkOnboardingStatus(currentSession.user.id);
        } else {
          setOnboardingComplete(null);
        }
        
        setLoading(false);
        
        if (event === 'SIGNED_IN') {
          router.refresh();
        }
        if (event === 'SIGNED_OUT') {
          router.refresh();
          router.push('/auth/login');
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router, checkOnboardingStatus]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setOnboardingComplete(null);
    router.refresh();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, onboardingComplete, signOut, checkOnboardingStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
