import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profil, UserRole } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export interface AuthUser extends Profil {
  restavracija_id?: string;
}

interface UseAuthReturn {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string, ime: string, priimek: string, telefon?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Cleanup auth state
  const cleanupAuthState = () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
  };

  // Load user profile
  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profil, error } = await supabase
        .from('profili')
        .select(`
          *
        `)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error loading user profile:', error);
        return null;
      }

      // If no profile exists, it means user was deleted from profili but still exists in auth
      // This should not happen in normal flow, but handle it gracefully
      if (!profil) {
        console.warn('User authenticated but no profile found. This indicates data inconsistency.');
        // Sign out the user to force clean state
        await supabase.auth.signOut({ scope: 'global' });
        return null;
      }

      // Check if user is admin by looking at admin_restavracije table
      let restavracija_id = undefined;
      let actualRole = profil.vloga; // Start with profile role
      
      try {
        const { data: adminData, error: adminError } = await supabase
          .from('admin_restavracije')
          .select('restavracija_id')
          .eq('admin_id', userId)
          .maybeSingle();
        
        if (adminError) {
          console.error('Error loading admin restaurant:', adminError);
        } else if (adminData) {
          // If user has admin_restavracije record, they are admin regardless of profile role
          actualRole = 'admin_restavracije';
          restavracija_id = adminData.restavracija_id;
        }
      } catch (error) {
        console.error('Error in admin restaurant query:', error);
      }

      // Create auth user with actual role and restaurant connection
      const authUser: AuthUser = {
        ...profil,
        vloga: actualRole, // Use determined role
        restavracija_id
      };

      return authUser;
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        
        if (session?.user) {
          // Defer profile loading
          setTimeout(async () => {
            const profile = await loadUserProfile(session.user.id);
            setUser(profile);
            setIsLoading(false);
          }, 0);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user.id).then((profile) => {
          setUser(profile);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, ime: string, priimek: string, telefon?: string) => {
    try {
      setIsLoading(true);
      cleanupAuthState();

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            ime,
            priimek,
            telefon: telefon || null
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Registracija uspešna!",
          description: "Dobrodošli v MalcaTime aplikaciji.",
        });
        // Trigger will automatically create profile
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast({
        title: "Napaka pri registraciji",
        description: error.message || "Prišlo je do napake pri registraciji.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      cleanupAuthState();

      // Attempt global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Prijava uspešna!",
          description: "Dobrodošli nazaj!",
        });
        // Force page reload for clean state
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast({
        title: "Napaka pri prijavi",
        description: error.message || "Preverite email in geslo.",
        variant: "destructive"
      });
      setIsLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      cleanupAuthState();
      await supabase.auth.signOut({ scope: 'global' });
      toast({
        title: "Odjava uspešna",
        description: "Uspešno ste se odjavili.",
      });
      // Force page reload
      window.location.href = '/';
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: "Napaka pri odjavi",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      // Use the app URL without hash - Supabase will handle the redirect
      const appUrl = 'https://plcyhxyquhdvrozikiss.supabase.co';
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: appUrl,
      });

      if (error) throw error;

      toast({
        title: "E-pošta poslana",
        description: "Preverite svojo e-pošto za navodila za ponastavitev gesla.",
      });
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast({
        title: "Napaka pri pošiljanju e-pošte",
        description: error.message || "Prišlo je do napake. Poskusite znova.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      toast({
        title: "Geslo posodobljeno",
        description: "Vaše geslo je bilo uspešno posodobljeno.",
      });
    } catch (error: any) {
      console.error('Update password error:', error);
      toast({
        title: "Napaka pri posodabljanju gesla",
        description: error.message || "Prišlo je do napake. Poskusite znova.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    session,
    isLoading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword
  };
};