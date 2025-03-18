
import { useState } from "react";
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
import { 
  UserIcon, 
  BuildingIcon, 
  PrinterIcon, 
  SaveIcon
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const Settings = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // User profile settings
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  
  // Company settings
  const [companyName, setCompanyName] = useState(user?.company?.name || "");
  const [companyAddress, setCompanyAddress] = useState(user?.company?.address || "");
  const [companyPhone, setCompanyPhone] = useState(user?.company?.phone || "");
  const [companyEmail, setCompanyEmail] = useState(user?.company?.email || "");
  
  // Receipt settings
  const [showLogo, setShowLogo] = useState(user?.receiptSettings?.showLogo !== false);
  const [showContact, setShowContact] = useState(user?.receiptSettings?.showContact !== false);
  const [showCompanyInfo, setShowCompanyInfo] = useState(user?.receiptSettings?.showCompanyInfo !== false);
  const [footerText, setFooterText] = useState(user?.receiptSettings?.footerText || "Merci de votre confiance!");

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await updateUser({
        ...user,
        name,
        email,
        phone
      });
      toast.success("Profil mis à jour avec succès");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du profil");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCompany = async () => {
    setLoading(true);
    try {
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
    } catch (error) {
      toast.error("Erreur lors de la mise à jour des informations");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReceiptSettings = async () => {
    setLoading(true);
    try {
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
    } catch (error) {
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
                    <SaveIcon className="mr-2 h-4 w-4" />
                    Enregistrer les modifications
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
                    <SaveIcon className="mr-2 h-4 w-4" />
                    Enregistrer les modifications
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
                    <input
                      type="checkbox"
                      id="show-logo"
                      checked={showLogo}
                      onChange={(e) => setShowLogo(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="show-logo">Afficher le logo sur les reçus</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="show-company-info"
                      checked={showCompanyInfo}
                      onChange={(e) => setShowCompanyInfo(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="show-company-info">Afficher les informations de l'entreprise</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="show-contact"
                      checked={showContact}
                      onChange={(e) => setShowContact(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
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
                    <SaveIcon className="mr-2 h-4 w-4" />
                    Enregistrer les paramètres
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
