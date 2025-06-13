import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { RestaurantsPage } from '@/pages/user/RestaurantsPage';
import { MenuPage } from '@/pages/user/MenuPage';
import { AdminMenuPage } from '@/pages/admin/AdminMenuPage';
import { AdminOrdersPage } from '@/pages/admin/AdminOrdersPage';
import { Restavracija } from '@/data/mockData';

type AuthMode = 'login' | 'register';
type UserView = 'restaurants' | 'menu';
type AdminView = 'menu' | 'orders';

export const AppLayout: React.FC = () => {
  const { user } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restavracija | null>(null);
  const [userView, setUserView] = useState<UserView>('restaurants');
  const [adminView, setAdminView] = useState<AdminView>('menu');

  // Auth stranice
  if (!user) {
    if (authMode === 'login') {
      return (
        <LoginPage onSwitchToRegister={() => setAuthMode('register')} />
      );
    } else {
      return (
        <RegisterPage onSwitchToLogin={() => setAuthMode('login')} />
      );
    }
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

  return null;
};