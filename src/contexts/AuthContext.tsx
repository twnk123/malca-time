import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole, Profil } from '@/types/database';

export interface User extends Profil {
  restavracija_id?: string; // Za admin_restavracije
}

interface AuthContextType {
  user: User | null;
  prijava: (email: string, geslo: string) => Promise<void>;
  odjava: () => void;
  registracija: (email: string, geslo: string, ime: string) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth mora biti uporabljen znotraj AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const prijava = async (email: string, geslo: string) => {
    setIsLoading(true);
    
    // Mock prijava - simulacija različnih uporabnikov
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email === 'admin@restavracija.si') {
      setUser({
        id: '1',
        user_id: '1',
        email: email,
        ime: 'Admin',
        priimek: 'Restavracije',
        telefon: null,
        vloga: 'admin_restavracije',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        restavracija_id: 'rest_1'
      });
    } else {
      setUser({
        id: '2',
        user_id: '2',
        email: email,
        ime: 'Test',
        priimek: 'Uporabnik',
        telefon: null,
        vloga: 'uporabnik',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    
    setIsLoading(false);
  };

  const registracija = async (email: string, geslo: string, ime: string) => {
    setIsLoading(true);
    
    // Mock registracija
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setUser({
      id: Date.now().toString(),
      user_id: Date.now().toString(),
      email: email,
      ime: ime,
      priimek: '',
      telefon: null,
      vloga: 'uporabnik',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    setIsLoading(false);
  };

  const odjava = () => {
    setUser(null);
  };

  const value = {
    user,
    prijava,
    odjava,
    registracija,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};