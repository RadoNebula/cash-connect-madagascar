
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
      if (user) {
        console.log("Saving profile with data:", { name, email, phone });
        
        // Direct database update to profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .update({
            name,
            email,
            phone,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
          .select();
          
        if (profileError) {
          console.error("Profile update error:", profileError);
          throw profileError;
        }
        
        console.log("Profile updated successfully:", profileData);
        
        // Update local user state
        await updateUser({
          ...user,
          name,
          email,
          phone
        });
        
        toast.success("Profil mis à jour avec succès");
      } else {
        // Mode démo - simuler une mise à jour réussie
        toast.success("Profil mis à jour avec succès (mode démo)");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      toast.error("Erreur lors de la mise à jour du profil");
    } finally {
      setLoading(false);
      setActiveSection(null);
    }
  };

  const handleSaveCompany = async () => {
    setLoading(true);
    setActiveSection('company');
    try {
      if (user) {
        console.log("Saving company with data:", { companyName, companyAddress, companyPhone, companyEmail });
        
        // Direct database update to company_settings table
        const { data: companyData, error: companyError } = await supabase
          .from('company_settings')
          .update({
            name: companyName,
            address: companyAddress,
            phone: companyPhone,
            email: companyEmail,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
          .select();
        
        if (companyError) {
          console.error("Company update error:", companyError);
          throw companyError;
        }
        
        console.log("Company updated successfully:", companyData);
        
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
      } else {
        // Mode démo
        toast.success("Informations de l'entreprise mises à jour (mode démo)");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour des informations:", error);
      toast.error("Erreur lors de la mise à jour des informations");
    } finally {
      setLoading(false);
      setActiveSection(null);
    }
  };

  const handleSaveReceiptSettings = async () => {
    setLoading(true);
    setActiveSection('receipt');
    try {
      if (user) {
        console.log("Saving receipt settings with data:", { showLogo, showContact, showCompanyInfo, footerText });
        
        // Direct database update to receipt_settings table
        const { data: receiptData, error: receiptError } = await supabase
          .from('receipt_settings')
          .update({
            show_logo: showLogo,
            show_contact: showContact,
            show_company_info: showCompanyInfo,
            footer_text: footerText,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
          .select();
        
        if (receiptError) {
          console.error("Receipt settings update error:", receiptError);
          throw receiptError;
        }
        
        console.log("Receipt settings updated successfully:", receiptData);
        
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
      } else {
        // Mode démo
        toast.success("Paramètres d'impression mis à jour (mode démo)");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour des paramètres:", error);
      toast.error("Erreur lors de la mise à jour des paramètres");
    } finally {
      setLoading(false);
      setActiveSection(null);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6 md:pl-56">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
          <p className="text-muted-foreground">
            Configurez votre compte, votre entreprise et les options d'impression
          </p>
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
                    <Input 
                      id="company-address" 
                      value={companyAddress}
                      onChange={(e) => setCompanyAddress(e.target.value)}
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
