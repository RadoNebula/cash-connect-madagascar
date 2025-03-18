
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";

export type User = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  balances: {
    mvola: number;
    orangeMoney: number;
    airtelMoney: number;
  };
  contacts: Contact[];
  company?: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  receiptSettings?: {
    showLogo: boolean;
    showContact: boolean;
    showCompanyInfo: boolean;
    footerText: string;
  };
};

export type Contact = {
  id: string;
  name: string;
  phone: string;
  favorite: boolean;
  category: 'family' | 'friends' | 'business' | 'other';
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (phone: string, pin: string) => Promise<boolean>;
  signup: (name: string, phone: string, pin: string) => Promise<boolean>;
  logout: () => void;
  addContact: (contact: Omit<Contact, 'id'>) => void;
  updateContact: (id: string, updates: Partial<Omit<Contact, 'id'>>) => void;
  removeContact: (id: string) => void;
  updateUser: (updates: Partial<User>) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for demonstration
const mockUser: User = {
  id: "user-1",
  name: "Rakoto Jean",
  phone: "+261 34 00 000 00",
  email: "rakoto@example.com",
  balances: {
    mvola: 150000,
    orangeMoney: 75000,
    airtelMoney: 30000,
  },
  contacts: [
    {
      id: "contact-1",
      name: "Marie",
      phone: "+261 32 11 222 33",
      favorite: true,
      category: 'family',
    },
    {
      id: "contact-2",
      name: "Pierre",
      phone: "+261 33 22 333 44",
      favorite: false,
      category: 'friends',
    },
    {
      id: "contact-3",
      name: "Boutique Centrale",
      phone: "+261 34 33 444 55",
      favorite: true,
      category: 'business',
    },
  ],
  company: {
    name: "Kioska Nakà",
    address: "Lot 34 Ambondrona, Antananarivo",
    phone: "+261 34 00 000 00",
    email: "contact@kioskanaka.mg"
  },
  receiptSettings: {
    showLogo: true,
    showContact: true,
    showCompanyInfo: true,
    footerText: "Merci de votre confiance!"
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Simulate loading user from local storage on app start
  useEffect(() => {
    const storedUser = localStorage.getItem('cashpoint_user');
    
    // Simulate network delay
    const timer = setTimeout(() => {
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const login = async (phone: string, pin: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo, we'll accept any phone/pin and return mock data
      setUser(mockUser);
      localStorage.setItem('cashpoint_user', JSON.stringify(mockUser));
      toast.success("Connexion réussie!");
      return true;
    } catch (error) {
      toast.error("Erreur de connexion. Veuillez réessayer.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, phone: string, pin: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create new user based on mock data but with provided details
      const newUser: User = {
        ...mockUser,
        id: `user-${Date.now()}`,
        name,
        phone,
      };
      
      setUser(newUser);
      localStorage.setItem('cashpoint_user', JSON.stringify(newUser));
      toast.success("Compte créé avec succès!");
      return true;
    } catch (error) {
      toast.error("Erreur lors de la création du compte. Veuillez réessayer.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cashpoint_user');
    toast.success("Déconnexion réussie");
  };

  const addContact = (contact: Omit<Contact, 'id'>) => {
    if (!user) return;
    
    const newContact: Contact = {
      ...contact,
      id: `contact-${Date.now()}`,
    };
    
    const updatedUser: User = {
      ...user,
      contacts: [...user.contacts, newContact],
    };
    
    setUser(updatedUser);
    localStorage.setItem('cashpoint_user', JSON.stringify(updatedUser));
    toast.success(`Contact ${contact.name} ajouté!`);
  };

  const updateContact = (id: string, updates: Partial<Omit<Contact, 'id'>>) => {
    if (!user) return;
    
    const updatedContacts = user.contacts.map(contact => 
      contact.id === id ? { ...contact, ...updates } : contact
    );
    
    const updatedUser: User = {
      ...user,
      contacts: updatedContacts,
    };
    
    setUser(updatedUser);
    localStorage.setItem('cashpoint_user', JSON.stringify(updatedUser));
    toast.success("Contact mis à jour!");
  };

  const removeContact = (id: string) => {
    if (!user) return;
    
    const updatedContacts = user.contacts.filter(contact => contact.id !== id);
    
    const updatedUser: User = {
      ...user,
      contacts: updatedContacts,
    };
    
    setUser(updatedUser);
    localStorage.setItem('cashpoint_user', JSON.stringify(updatedUser));
    toast.success("Contact supprimé!");
  };

  const updateUser = async (updates: Partial<User>): Promise<boolean> => {
    try {
      if (!user) return false;
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const updatedUser: User = {
        ...user,
        ...updates,
      };
      
      setUser(updatedUser);
      localStorage.setItem('cashpoint_user', JSON.stringify(updatedUser));
      return true;
    } catch (error) {
      console.error("Error updating user:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      signup, 
      logout,
      addContact,
      updateContact,
      removeContact,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
