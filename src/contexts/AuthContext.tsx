import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'uporabnik' | 'admin_restavracije';

export interface User {
  id: string;
  email: string;
  ime: string;
  vloga: UserRole;
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
        email: email,
        ime: 'Admin Restavracije',
        vloga: 'admin_restavracije',
        restavracija_id: 'rest_1'
      });
    } else {
      setUser({
        id: '2',
        email: email,
        ime: 'Test Uporabnik',
        vloga: 'uporabnik'
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
      email: email,
      ime: ime,
      vloga: 'uporabnik'
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