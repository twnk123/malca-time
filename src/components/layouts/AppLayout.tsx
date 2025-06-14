import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, User } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { RestaurantsPage } from '@/pages/user/RestaurantsPage';
import { MenuPage } from '@/pages/user/MenuPage';
import { ProfilePage } from '@/pages/user/ProfilePage';
import { AdminMenuPage } from '@/pages/admin/AdminMenuPage';
import { AdminOrdersPage } from '@/pages/admin/AdminOrdersPage';
import { AdminAnalyticsPage } from '@/pages/admin/AdminAnalyticsPage';
import { AdminRestaurantPage } from '@/pages/admin/AdminRestaurantPage';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Database } from '@/integrations/supabase/types';

type Restavracija = Database['public']['Tables']['restavracije']['Row'];

type AuthMode = 'login' | 'register' | 'forgot-password' | 'reset-password';
type UserView = 'restaurants' | 'menu' | 'profile';
type AdminView = 'menu' | 'orders' | 'analytics' | 'restaurant';

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
    return <LoadingScreen />;
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
            <div className="flex justify-between items-center">
              <nav className="flex space-x-1">
                <button
                  onClick={() => setAdminView('menu')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    adminView === 'menu'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Meni
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
                <button
                  onClick={() => setAdminView('analytics')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    adminView === 'analytics'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Analitika
                </button>
                <button
                  onClick={() => setAdminView('restaurant')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    adminView === 'restaurant'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Settings className="w-4 h-4 inline mr-1" />
                  Restavracija
                </button>
              </nav>
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Admin Content */}
        {adminView === 'menu' ? <AdminMenuPage /> : 
         adminView === 'orders' ? <AdminOrdersPage /> : 
         adminView === 'analytics' ? <AdminAnalyticsPage /> :
         <AdminRestaurantPage />}
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
          onProfileClick={() => setUserView('profile')}
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
          onProfileClick={() => setUserView('profile')}
        />
      );
    } else if (userView === 'profile') {
      return (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          transition={{ duration: 0.3 }}
        >
          <ProfilePage onBack={() => setUserView(selectedRestaurant ? 'menu' : 'restaurants')} />
        </motion.div>
      );
    }
  }

  return null;
};