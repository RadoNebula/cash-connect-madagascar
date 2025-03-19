
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

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

// Mock user data for initial development before Supabase integration
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
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);

  // Fetch user data from Supabase and update state
  const fetchUserData = async (userId: string) => {
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Fetch company settings
      const { data: companyData, error: companyError } = await supabase
        .from('company_settings')
        .select('*')
        .eq('id', userId)
        .single();

      if (companyError && companyError.code !== 'PGRST116') throw companyError;

      // Fetch receipt settings
      const { data: receiptData, error: receiptError } = await supabase
        .from('receipt_settings')
        .select('*')
        .eq('id', userId)
        .single();

      if (receiptError && receiptError.code !== 'PGRST116') throw receiptError;

      // Construct user object
      const userData: User = {
        id: userId,
        name: profileData.name || '',
        phone: profileData.phone || '',
        email: profileData.email || '',
        balances: {
          mvola: 0,
          orangeMoney: 0,
          airtelMoney: 0,
        },
        contacts: [], // We'll implement contacts later
        company: companyData ? {
          name: companyData.name || '',
          address: companyData.address || '',
          phone: companyData.phone || '',
          email: companyData.email || '',
        } : undefined,
        receiptSettings: receiptData ? {
          showLogo: receiptData.show_logo,
          showContact: receiptData.show_contact,
          showCompanyInfo: receiptData.show_company_info,
          footerText: receiptData.footer_text || 'Merci de votre confiance!',
        } : undefined,
      };

      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error("Erreur lors du chargement des données utilisateur");
      return null;
    }
  };

  // Listen for authentication state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setIsLoading(true);
        
        if (session?.user) {
          setSupabaseUser(session.user);
          await fetchUserData(session.user.id);
        } else {
          setSupabaseUser(null);
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setSupabaseUser(session.user);
        await fetchUserData(session.user.id);
      }
      
      setIsLoading(false);
    };
    
    checkUser();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (phone: string, pin: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Format the phone number as a valid email for Supabase authentication
      const email = `user_${phone.replace(/\+|\s|-/g, '')}@cashpoint.app`;
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: pin,
      });
      
      if (error) {
        console.error('Login error:', error);
        
        // Afficher un message d'erreur spécifique en fonction du code d'erreur
        if (error.message === "Email not confirmed") {
          toast.error("Votre compte n'a pas été confirmé. Veuillez vérifier votre email.");
          return false;
        } else if (error.message === "Invalid login credentials") {
          toast.error("Numéro de téléphone ou code PIN incorrect.");
          return false;
        }
        
        throw error;
      }
      
      if (data.user) {
        await fetchUserData(data.user.id);
        toast.success("Connexion réussie!");
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast.error("Erreur de connexion. Veuillez réessayer.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, phone: string, pin: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Format the phone number as a valid email for Supabase authentication
      const email = `user_${phone.replace(/\+|\s|-/g, '')}@cashpoint.app`;
      
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: pin,
        options: {
          data: {
            name,
            phone,
          },
        },
      });
      
      if (error) {
        console.error('Signup error:', error);
        
        // Afficher un message d'erreur spécifique en fonction du code d'erreur
        if (error.message.includes("already registered")) {
          toast.error("Ce numéro de téléphone est déjà utilisé.");
          return false;
        }
        
        throw error;
      }
      
      if (data.user) {
        // Vérifier si l'email a besoin d'être confirmé
        if (data.user.identities && data.user.identities.length > 0) {
          const emailConfirmed = data.user.identities[0].identity_data.email_verified;
          
          if (emailConfirmed) {
            toast.success("Compte créé avec succès!");
          } else {
            toast.success("Compte créé! Vous pourrez vous connecter sans confirmation d'email.");
          }
        } else {
          toast.success("Compte créé avec succès!");
        }
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      toast.error("Erreur lors de la création du compte. Veuillez réessayer.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Logout error:', error);
      toast.error("Erreur lors de la déconnexion");
    } else {
      setUser(null);
      toast.success("Déconnexion réussie");
    }
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
    toast.success("Contact supprimé!");
  };

  const updateUser = async (updates: Partial<User>): Promise<boolean> => {
    try {
      if (!user || !supabaseUser) return false;
      
      // Update profile information if changed
      if (updates.name !== undefined || updates.email !== undefined || updates.phone !== undefined) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            name: updates.name || user.name,
            email: updates.email || user.email,
            phone: updates.phone || user.phone,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (profileError) throw profileError;
      }

      // Update company settings if changed
      if (updates.company) {
        const { error: companyError } = await supabase
          .from('company_settings')
          .update({
            name: updates.company.name,
            address: updates.company.address,
            phone: updates.company.phone,
            email: updates.company.email,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (companyError) throw companyError;
      }

      // Update receipt settings if changed
      if (updates.receiptSettings) {
        const { error: receiptError } = await supabase
          .from('receipt_settings')
          .update({
            show_logo: updates.receiptSettings.showLogo,
            show_contact: updates.receiptSettings.showContact,
            show_company_info: updates.receiptSettings.showCompanyInfo,
            footer_text: updates.receiptSettings.footerText,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (receiptError) throw receiptError;
      }
      
      // Update local user state
      const updatedUser: User = {
        ...user,
        ...updates,
      };
      
      setUser(updatedUser);
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
