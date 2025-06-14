import React, { useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { RestaurantsPage } from '@/pages/user/RestaurantsPage';
import { MenuPage } from '@/pages/user/MenuPage';
import { AdminMenuPage } from '@/pages/admin/AdminMenuPage';
import { AdminOrdersPage } from '@/pages/admin/AdminOrdersPage';
import { Database } from '@/integrations/supabase/types';

type Restavracija = Database['public']['Tables']['restavracije']['Row'];

type AuthMode = 'login' | 'register' | 'forgot-password' | 'reset-password';
type UserView = 'restaurants' | 'menu';
type AdminView = 'menu' | 'orders';

export const AppLayout: React.FC = () => {
  const { user, isLoading } = useAuthContext();
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restavracija | null>(null);
  const [userView, setUserView] = useState<UserView>('restaurants');
  const [adminView, setAdminView] = useState<AdminView>('menu');

  // Check URL hash for reset-password mode
  React.useEffect(() => {
    const hash = window.location.hash;
    const searchParams = new URLSearchParams(window.location.search);
    
    // Check for Supabase auth parameters or reset-password hash
    if (hash === '#reset-password' || 
        hash.includes('reset-password') || 
        searchParams.get('type') === 'recovery' ||
        hash.includes('access_token')) {
      setAuthMode('reset-password');
    }
  }, []);

  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto animate-pulse">
            <span className="text-primary-foreground font-bold text-2xl">M</span>
          </div>
          <p className="text-muted-foreground">Nalagam...</p>
        </div>
      </div>
    );
  }

  // Auth stranice
  if (!user) {
    if (authMode === 'register') {
      return <RegisterPage onSwitchToLogin={() => setAuthMode('login')} />;
    } else if (authMode === 'forgot-password') {
      return <ForgotPasswordPage onBackToLogin={() => setAuthMode('login')} />;
    } else if (authMode === 'reset-password') {
      return <ResetPasswordPage onSuccess={() => setAuthMode('login')} />;
    } else {
      return (
        <LoginPage 
          onSwitchToRegister={() => setAuthMode('register')}
          onSwitchToForgotPassword={() => {
            console.log('AppLayout: Switching to forgot-password');
            setAuthMode('forgot-password');
          }}
        />
      );
    }
  }

  // Admin stranice
  if (user.vloga === 'admin_restavracije') {
    return (
      <div className="min-h-screen bg-background">
        {/* Admin Navigation */}
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4">
            <nav className="flex space-x-1">
              <button
                onClick={() => setAdminView('menu')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  adminView === 'menu'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Upravljanje menija
              </button>
              <button
                onClick={() => setAdminView('orders')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  adminView === 'orders'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Naročila
              </button>
            </nav>
          </div>
        </div>

        {/* Admin Content */}
        {adminView === 'menu' ? <AdminMenuPage /> : <AdminOrdersPage />}
      </div>
    );
  }
  
  // Uporabniške stranice
  if (user.vloga === 'uporabnik') {
    if (userView === 'restaurants' || !selectedRestaurant) {
      return (
        <RestaurantsPage
          onSelectRestaurant={(restaurant) => {
            setSelectedRestaurant(restaurant);
            setUserView('menu');
          }}
        />
      );
    } else if (userView === 'menu' && selectedRestaurant) {
      return (
        <MenuPage
          restaurant={selectedRestaurant}
          onBack={() => {
            setUserView('restaurants');
            setSelectedRestaurant(null);
          }}
        />
      );
    }
  }

  return null;
};