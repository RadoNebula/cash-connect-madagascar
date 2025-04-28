
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  UserIcon, 
  BuildingIcon, 
  PrinterIcon, 
  CheckIcon,
  SaveIcon, 
  Loader2Icon
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";

const Settings = () => {
  const navigate = useNavigate();
  const { user, updateUser, updateProfile, updateCompanySettings, updateReceiptSettings } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  
  // Mock user data if no real user is logged in
  const mockUser = {
    id: "mock-user",
    name: "Utilisateur Demo",
    phone: "034 00 000 00",
    email: "user@example.com",
    company: {
      name: "Ma Boutique",
      address: "Antananarivo, Madagascar",
      phone: "034 00 000 00",
      email: "boutique@example.com"
    },
    receiptSettings: {
      showLogo: true,
      showContact: true,
      showCompanyInfo: true,
      footerText: "Merci de votre confiance!"
    }
  };
  
  const activeUser = user || mockUser;
  const isDemo = !user;
  
  // User profile settings
  const [name, setName] = useState(activeUser?.name || "");
  const [email, setEmail] = useState(activeUser?.email || "");
  const [phone, setPhone] = useState(activeUser?.phone || "");
  
  // Company settings
  const [companyName, setCompanyName] = useState(activeUser?.company?.name || "");
  const [companyAddress, setCompanyAddress] = useState(activeUser?.company?.address || "");
  const [companyPhone, setCompanyPhone] = useState(activeUser?.company?.phone || "");
  const [companyEmail, setCompanyEmail] = useState(activeUser?.company?.email || "");
  
  // Receipt settings
  const [showLogo, setShowLogo] = useState(activeUser?.receiptSettings?.showLogo !== false);
  const [showContact, setShowContact] = useState(activeUser?.receiptSettings?.showContact !== false);
  const [showCompanyInfo, setShowCompanyInfo] = useState(activeUser?.receiptSettings?.showCompanyInfo !== false);
  const [footerText, setFooterText] = useState(activeUser?.receiptSettings?.footerText || "Merci de votre confiance!");

  // Update form values when user changes
  useEffect(() => {
    if (activeUser) {
      setName(activeUser.name || "");
      setEmail(activeUser.email || "");
      setPhone(activeUser.phone || "");
      
      setCompanyName(activeUser.company?.name || "");
      setCompanyAddress(activeUser.company?.address || "");
      setCompanyPhone(activeUser.company?.phone || "");
      setCompanyEmail(activeUser.company?.email || "");
      
      setShowLogo(activeUser.receiptSettings?.showLogo !== false);
      setShowContact(activeUser.receiptSettings?.showContact !== false);
      setShowCompanyInfo(activeUser.receiptSettings?.showCompanyInfo !== false);
      setFooterText(activeUser.receiptSettings?.footerText || "Merci de votre confiance!");
    }
  }, [activeUser]);

  const handleSaveProfile = async () => {
    setLoading(true);
    setActiveSection('profile');
    
    try {
      if (isDemo) {
        // Demo mode - simulate update
        setTimeout(() => {
          toast.success("Profil mis à jour avec succès (mode démo)");
          
          // Update local demo user
          mockUser.name = name;
          mockUser.email = email;
          mockUser.phone = phone;
          
          setLoading(false);
          setActiveSection(null);
        }, 500);
        return;
      }
      
      // Real user mode
      if (!name.trim()) {
        throw new Error("Le nom ne peut pas être vide");
      }
      
      console.log("Saving profile with data:", { name, email, phone });
      
      // First, check if the user exists in profiles table
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
        
      if (profileCheckError && profileCheckError.code !== 'PGRST116') {
        throw profileCheckError;
      }
      
      if (existingProfile) {
        // Update existing profile
        try {
          const updatedProfile = await updateProfile({
            name,
            email,
            phone,
            updated_at: new Date().toISOString()
          });
          
          console.log("Profile updated:", updatedProfile);
        } catch (error) {
          throw error;
        }
      } else {
        // Create new profile
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            name,
            email,
            phone,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
          
        if (insertError) throw insertError;
        console.log("New profile created:", newProfile);
      }
      
      // Update local user state
      await updateUser({
        ...user,
        name,
        email,
        phone
      });
      
      toast.success("Profil mis à jour avec succès");
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      toast.error(error.message || "Erreur lors de la mise à jour du profil");
    } finally {
      setLoading(false);
      setActiveSection(null);
    }
  };

  const handleSaveCompany = async () => {
    setLoading(true);
    setActiveSection('company');
    
    try {
      if (isDemo) {
        // Demo mode - simulate update
        setTimeout(() => {
          toast.success("Informations de l'entreprise mises à jour (mode démo)");
          
          // Update local demo user
          if (mockUser.company) {
            mockUser.company.name = companyName;
            mockUser.company.address = companyAddress;
            mockUser.company.phone = companyPhone;
            mockUser.company.email = companyEmail;
          }
          
          setLoading(false);
          setActiveSection(null);
        }, 500);
        return;
      }
      
      // Real user mode
      console.log("Saving company with data:", { companyName, companyAddress, companyPhone, companyEmail });
      
      // First, check if company settings exist
      const { data: existingSettings, error: settingsCheckError } = await supabase
        .from('company_settings')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
        
      if (settingsCheckError && settingsCheckError.code !== 'PGRST116') {
        throw settingsCheckError;
      }
      
      if (existingSettings) {
        // Update existing settings
        try {
          const updatedSettings = await updateCompanySettings({
            name: companyName,
            address: companyAddress,
            phone: companyPhone,
            email: companyEmail,
            updated_at: new Date().toISOString()
          });
          
          console.log("Company settings updated:", updatedSettings);
        } catch (error) {
          throw error;
        }
      } else {
        // Create new settings
        const { data: newSettings, error: insertError } = await supabase
          .from('company_settings')
          .insert({
            id: user.id,
            name: companyName,
            address: companyAddress,
            phone: companyPhone,
            email: companyEmail,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
          
        if (insertError) throw insertError;
        console.log("New company settings created:", newSettings);
      }
      
      // Update local user state
      await updateUser({
        ...user,
        company: {
          ...user.company,
          name: companyName,
          address: companyAddress,
          phone: companyPhone,
          email: companyEmail
        }
      });
      
      toast.success("Informations de l'entreprise mises à jour");
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour des informations:", error);
      toast.error(error.message || "Erreur lors de la mise à jour des informations");
    } finally {
      setLoading(false);
      setActiveSection(null);
    }
  };

  const handleSaveReceiptSettings = async () => {
    setLoading(true);
    setActiveSection('receipt');
    
    try {
      if (isDemo) {
        // Demo mode - simulate update
        setTimeout(() => {
          toast.success("Paramètres d'impression mis à jour (mode démo)");
          
          // Update local demo user
          if (mockUser.receiptSettings) {
            mockUser.receiptSettings.showLogo = showLogo;
            mockUser.receiptSettings.showContact = showContact;
            mockUser.receiptSettings.showCompanyInfo = showCompanyInfo;
            mockUser.receiptSettings.footerText = footerText;
          }
          
          setLoading(false);
          setActiveSection(null);
        }, 500);
        return;
      }
      
      // Real user mode
      console.log("Saving receipt settings with data:", { showLogo, showContact, showCompanyInfo, footerText });
      
      // First, check if receipt settings exist
      const { data: existingSettings, error: settingsCheckError } = await supabase
        .from('receipt_settings')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
        
      if (settingsCheckError && settingsCheckError.code !== 'PGRST116') {
        throw settingsCheckError;
      }
      
      if (existingSettings) {
        // Update existing settings
        try {
          const updatedSettings = await updateReceiptSettings({
            show_logo: showLogo,
            show_contact: showContact,
            show_company_info: showCompanyInfo,
            footer_text: footerText,
            updated_at: new Date().toISOString()
          });
          
          console.log("Receipt settings updated:", updatedSettings);
        } catch (error) {
          throw error;
        }
      } else {
        // Create new settings
        const { data: newSettings, error: insertError } = await supabase
          .from('receipt_settings')
          .insert({
            id: user.id,
            show_logo: showLogo,
            show_contact: showContact,
            show_company_info: showCompanyInfo,
            footer_text: footerText,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
          
        if (insertError) throw insertError;
        console.log("New receipt settings created:", newSettings);
      }
      
      // Update local user state
      await updateUser({
        ...user,
        receiptSettings: {
          ...user.receiptSettings,
          showLogo,
          showContact,
          showCompanyInfo,
          footerText
        }
      });
      
      toast.success("Paramètres d'impression mis à jour");
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour des paramètres:", error);
      toast.error(error.message || "Erreur lors de la mise à jour des paramètres");
    } finally {
      setLoading(false);
      setActiveSection(null);
    }
  };

  // The rest of your component stays the same
  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6 md:pl-56">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
          <p className="text-muted-foreground">
            Configurez votre compte, votre entreprise et les options d'impression
          </p>
          {isDemo && (
            <div className="mt-2 rounded-md bg-yellow-50 p-3 text-yellow-800 border border-yellow-200">
              <p className="text-sm font-medium">Mode démo : Les changements ne seront pas sauvegardés dans la base de données.</p>
            </div>
          )}
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              <span>Profil</span>
            </TabsTrigger>
            <TabsTrigger value="company" className="flex items-center gap-2">
              <BuildingIcon className="h-4 w-4" />
              <span>Entreprise</span>
            </TabsTrigger>
            <TabsTrigger value="receipt" className="flex items-center gap-2">
              <PrinterIcon className="h-4 w-4" />
              <span>Impression</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profil utilisateur</CardTitle>
                  <CardDescription>
                    Modifiez vos informations personnelles
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <Input 
                      id="name" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Adresse email</Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Numéro de téléphone</Label>
                    <Input 
                      id="phone" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleSaveProfile} 
                    disabled={loading && activeSection === 'profile'}
                    className="bg-kioska-navy hover:bg-kioska-navy/90"
                  >
                    {loading && activeSection === 'profile' ? (
                      <>
                        <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <SaveIcon className="mr-2 h-4 w-4" />
                        Enregistrer les modifications
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="company">
              <Card>
                <CardHeader>
                  <CardTitle>Informations de l'entreprise</CardTitle>
                  <CardDescription>
                    Ces informations apparaîtront sur les reçus
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Nom de l'entreprise</Label>
                    <Input 
                      id="company-name" 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company-address">Adresse</Label>
                    <Textarea 
                      id="company-address" 
                      value={companyAddress}
                      onChange={(e) => setCompanyAddress(e.target.value)}
                      className="min-h-20"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company-phone">Téléphone</Label>
                    <Input 
                      id="company-phone" 
                      value={companyPhone}
                      onChange={(e) => setCompanyPhone(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company-email">Email</Label>
                    <Input 
                      id="company-email" 
                      type="email"
                      value={companyEmail}
                      onChange={(e) => setCompanyEmail(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleSaveCompany} 
                    disabled={loading && activeSection === 'company'}
                    className="bg-kioska-navy hover:bg-kioska-navy/90"
                  >
                    {loading && activeSection === 'company' ? (
                      <>
                        <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <SaveIcon className="mr-2 h-4 w-4" />
                        Enregistrer les modifications
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="receipt">
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres d'impression</CardTitle>
                  <CardDescription>
                    Personnalisez les reçus de transactions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-logo" className="cursor-pointer">Afficher le logo sur les reçus</Label>
                    <Switch
                      id="show-logo"
                      checked={showLogo}
                      onCheckedChange={setShowLogo}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-company-info" className="cursor-pointer">Afficher les informations de l'entreprise</Label>
                    <Switch
                      id="show-company-info"
                      checked={showCompanyInfo}
                      onCheckedChange={setShowCompanyInfo}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-contact" className="cursor-pointer">Afficher les coordonnées du compte</Label>
                    <Switch
                      id="show-contact"
                      checked={showContact}
                      onCheckedChange={setShowContact}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="footer-text">Message de pied de page</Label>
                    <Input 
                      id="footer-text" 
                      value={footerText}
                      onChange={(e) => setFooterText(e.target.value)}
                      placeholder="Ex: Merci de votre confiance!"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleSaveReceiptSettings} 
                    disabled={loading && activeSection === 'receipt'}
                    className="bg-kioska-navy hover:bg-kioska-navy/90"
                  >
                    {loading && activeSection === 'receipt' ? (
                      <>
                        <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <SaveIcon className="mr-2 h-4 w-4" />
                        Enregistrer les paramètres
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </AppShell>
  );
};

export default Settings;
