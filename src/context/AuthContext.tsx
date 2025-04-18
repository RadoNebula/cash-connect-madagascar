import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js'; // Import the User type from Supabase
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

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
  signup: (name: string, phone: string, pin: string, email?: string) => Promise<{data?: any, error?: any}>;
  logout: () => void;
  addContact: (contact: Omit<Contact, 'id'>) => void;
  updateContact: (id: string, updates: Partial<Omit<Contact, 'id'>>) => void;
  removeContact: (id: string) => void;
  updateUser: (updates: Partial<User>) => Promise<boolean>;
  updateProfile: (userData: Partial<Tables<'profiles'>>) => Promise<Tables<'profiles'>>;
  updateCompanySettings: (settingsData: Partial<Tables<'company_settings'>>) => Promise<Tables<'company_settings'>>;
  updateReceiptSettings: (settingsData: Partial<Tables<'receipt_settings'>>) => Promise<Tables<'receipt_settings'>>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);

  const fetchUserData = async (userId: string) => {
    try {
      const { data: userAccountData, error: userAccountError } = await supabase
        .from('user_accounts')
        .select('*')
        .eq('auth_id', userId)
        .maybeSingle();

      if (userAccountError && userAccountError.code !== 'PGRST116') {
        throw userAccountError;
      }

      let userProfile = userAccountData;
      if (!userProfile) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }
        
        if (profileData) {
          userProfile = {
            ...profileData,
            auth_id: profileData.id,
          };
        }
      }

      if (!userProfile) {
        console.error("No user or profile found for ID:", userId);
        return null;
      }

      const { data: companyData, error: companyError } = await supabase
        .from('company_settings')
        .select('*')
        .eq('id', userId)
        .single();

      if (companyError && companyError.code !== 'PGRST116') throw companyError;

      const { data: receiptData, error: receiptError } = await supabase
        .from('receipt_settings')
        .select('*')
        .eq('id', userId)
        .single();

      if (receiptError && receiptError.code !== 'PGRST116') throw receiptError;

      const userData: User = {
        id: userId,
        name: userProfile.name || '',
        phone: userProfile.phone || '',
        email: userProfile.email || '',
        balances: {
          mvola: 0,
          orangeMoney: 0,
          airtelMoney: 0,
        },
        contacts: [],
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
      console.log("Attempting direct login with phone and PIN");
      
      const { data: directAuthData, error: directAuthError } = await supabase.rpc(
        'check_user_account_credentials',
        { phone_param: phone, pin_param: pin }
      );
      
      console.log("Direct auth result:", directAuthData, directAuthError);
      
      if (directAuthData) {
        const email = `user_${phone.replace(/\+|\s|-/g, '')}@cashpoint.app`;
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: pin,
        });
        
        if (error) {
          console.error("Auth error after direct verification:", error);
          
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: email,
            password: pin,
            options: {
              data: {
                name: phone,
                phone: phone,
                pin: pin
              },
              emailRedirectTo: null,
            }
          });
          
          if (signUpError) {
            toast.error("Erreur lors de l'authentification: " + signUpError.message);
            return false;
          }
          
          const { data: reLoginData, error: reLoginError } = await supabase.auth.signInWithPassword({
            email: email,
            password: pin,
          });
          
          if (reLoginError) {
            toast.error("Erreur lors de l'authentification: " + reLoginError.message);
            return false;
          }
          
          if (reLoginData.user) {
            await fetchUserData(reLoginData.user.id);
            toast.success("Connexion réussie!");
            return true;
          }
        }
        
        if (data.user) {
          await fetchUserData(data.user.id);
          toast.success("Connexion réussie!");
          return true;
        }
      }
      
      const email = `user_${phone.replace(/\+|\s|-/g, '')}@cashpoint.app`;
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: pin,
      });
      
      if (error) {
        console.error('Login error:', error);
        
        if (error.message === "Invalid login credentials") {
          console.log("Attempting to create account with same credentials");
          
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: email,
            password: pin,
            options: {
              data: {
                name: `Utilisateur ${phone}`,
                phone: phone,
                pin: pin
              },
              emailRedirectTo: null,
            }
          });
          
          if (signUpError) {
            if (signUpError.message.includes("already registered")) {
              toast.error("Connexion impossible. Veuillez réessayer avec un code PIN différent.");
            } else {
              toast.error("Erreur lors de la création du compte: " + signUpError.message);
            }
            return false;
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { data: reLoginData, error: reLoginError } = await supabase.auth.signInWithPassword({
            email: email,
            password: pin,
          });
          
          if (reLoginError) {
            toast.error("Compte créé mais connexion impossible. Veuillez réessayer dans quelques instants.");
            return false;
          }
          
          if (reLoginData.user) {
            await fetchUserData(reLoginData.user.id);
            toast.success("Compte créé et connecté avec succès!");
            return true;
          }
        } else {
          toast.error("Erreur de connexion: " + error.message);
        }
        
        return false;
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

  const signup = async (name: string, phone: string, pin: string, email?: string): Promise<{data?: any, error?: any}> => {
    setIsLoading(true);
    
    try {
      const generatedEmail = `user_${phone.replace(/\+|\s|-/g, '')}@cashpoint.app`;
      
      const { data, error } = await supabase.auth.signUp({
        email: email || generatedEmail,
        password: pin,
        options: {
          data: {
            name,
            phone,
            pin
          },
          emailRedirectTo: null,
        }
      });
      
      if (error) {
        console.error('Signup error:', error);
        
        if (error.message.includes("already registered")) {
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: generatedEmail,
            password: pin,
          });
          
          if (!loginError && loginData.user) {
            await fetchUserData(loginData.user.id);
            toast.success("Connexion réussie!");
            return { data: loginData };
          } else {
            toast.error("Ce numéro de téléphone est déjà utilisé avec un autre code PIN.");
          }
        } else {
          toast.error("Erreur lors de la création du compte: " + error.message);
        }
        
        return { error };
      }
      
      if (data.user) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: email || generatedEmail,
          password: pin,
        });
        
        if (!loginError && loginData.user) {
          await fetchUserData(loginData.user.id);
          toast.success("Compte créé et connecté avec succès!");
        } else {
          console.log("Immediate login after signup failed:", loginError);
          toast.success("Compte créé avec succès! Vous pouvez maintenant vous connecter.");
        }
      }
      
      return { data };
    } catch (error) {
      console.error('Signup error:', error);
      toast.error("Erreur lors de la création du compte. Veuillez réessayer.");
      return { error };
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
      
      if (updates.name !== undefined || updates.email !== undefined || updates.phone !== undefined) {
        const { data: userData, error: userCheckError } = await supabase
          .from('user_accounts')
          .select('*')
          .eq('auth_id', user.id)
          .maybeSingle();
          
        if (userData) {
          const { error: userUpdateError } = await supabase
            .from('user_accounts')
            .update({
              name: updates.name || user.name,
              email: updates.email || user.email,
              phone: updates.phone || user.phone,
              updated_at: new Date().toISOString(),
            })
            .eq('auth_id', user.id);

          if (userUpdateError) throw userUpdateError;
        } else {
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
      }

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

  const updateProfile = async (userData: Partial<Tables<'profiles'>>) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(userData)
        .eq('id', user?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const updateCompanySettings = async (settingsData: Partial<Tables<'company_settings'>>) => {
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .update(settingsData)
        .eq('id', user?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating company settings:', error);
      throw error;
    }
  };

  const updateReceiptSettings = async (settingsData: Partial<Tables<'receipt_settings'>>) => {
    try {
      const { data, error } = await supabase
        .from('receipt_settings')
        .update(settingsData)
        .eq('id', user?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating receipt settings:', error);
      throw error;
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
      updateUser,
      updateProfile,
      updateCompanySettings,
      updateReceiptSettings
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
