
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
  SaveIcon
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Settings = () => {
  const navigate = useNavigate();
  const { user, updateUser, updateProfile, updateCompanySettings, updateReceiptSettings } = useAuth();
  const [loading, setLoading] = useState(false);
  
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
    try {
      if (user) {
        // Utiliser directement updateProfile pour mettre à jour les données de profil
        await updateProfile({
          name,
          email,
          phone,
          updated_at: new Date().toISOString()
        });
        
        // Mettre également à jour l'état local de l'utilisateur 
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
    }
  };

  const handleSaveCompany = async () => {
    setLoading(true);
    try {
      if (user) {
        // Utiliser directement updateCompanySettings
        await updateCompanySettings({
          name: companyName,
          address: companyAddress,
          phone: companyPhone,
          email: companyEmail,
          updated_at: new Date().toISOString()
        });
        
        // Mettre également à jour l'état local de l'utilisateur
        await updateUser({
          ...user,
          company: {
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
    }
  };

  const handleSaveReceiptSettings = async () => {
    setLoading(true);
    try {
      if (user) {
        // Utiliser directement updateReceiptSettings
        await updateReceiptSettings({
          show_logo: showLogo,
          show_contact: showContact,
          show_company_info: showCompanyInfo,
          footer_text: footerText,
          updated_at: new Date().toISOString()
        });
        
        // Mettre également à jour l'état local de l'utilisateur
        await updateUser({
          ...user,
          receiptSettings: {
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
                    disabled={loading}
                    className="bg-kioska-navy hover:bg-kioska-navy/90"
                  >
                    {loading ? (
                      "Enregistrement..."
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
                    disabled={loading}
                    className="bg-kioska-navy hover:bg-kioska-navy/90"
                  >
                    {loading ? (
                      "Enregistrement..."
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
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-logo"
                      checked={showLogo}
                      onCheckedChange={setShowLogo}
                    />
                    <Label htmlFor="show-logo">Afficher le logo sur les reçus</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-company-info"
                      checked={showCompanyInfo}
                      onCheckedChange={setShowCompanyInfo}
                    />
                    <Label htmlFor="show-company-info">Afficher les informations de l'entreprise</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-contact"
                      checked={showContact}
                      onCheckedChange={setShowContact}
                    />
                    <Label htmlFor="show-contact">Afficher les coordonnées du compte</Label>
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
                    disabled={loading}
                    className="bg-kioska-navy hover:bg-kioska-navy/90"
                  >
                    {loading ? (
                      "Enregistrement..."
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
