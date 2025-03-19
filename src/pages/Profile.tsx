
import { useState, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { PhoneIcon, UserIcon, EyeIcon, EyeOffIcon, KeyIcon, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    
    try {
      const success = await updateUser({
        name,
        email,
        phone: user.phone // Not allowing phone update as it's used for login
      });
      
      if (success) {
        toast.success("Profil mis à jour avec succès");
      } else {
        toast.error("Erreur lors de la mise à jour du profil");
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Une erreur s'est produite");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPin || !newPin || !confirmPin) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    
    if (newPin !== confirmPin) {
      toast.error("Les nouveaux PIN ne correspondent pas");
      return;
    }
    
    if (newPin.length < 4) {
      toast.error("Le PIN doit contenir au moins 4 caractères");
      return;
    }
    
    setLoading(true);
    
    try {
      // Update password in Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: newPin
      });
      
      if (error) throw error;
      
      toast.success("PIN mis à jour avec succès");
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
    } catch (error) {
      console.error('Error changing PIN:', error);
      toast.error("Erreur lors de la mise à jour du PIN");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6 md:pl-56">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profil</h1>
          <p className="text-muted-foreground">
            Gérez vos informations personnelles
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>
                Modifiez vos informations de base
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Nom complet"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Numéro de téléphone"
                      value={phone}
                      className="pl-10"
                      disabled
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer les modifications
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full mt-4" 
                  onClick={logout}
                  disabled={loading}
                >
                  Se déconnecter
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sécurité</CardTitle>
              <CardDescription>
                Changer votre code PIN
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePin} className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <KeyIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showPin ? "text" : "password"}
                      placeholder="Code PIN actuel"
                      value={currentPin}
                      onChange={(e) => setCurrentPin(e.target.value)}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <KeyIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showPin ? "text" : "password"}
                      placeholder="Nouveau code PIN"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      className="pl-10 pr-10"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPin ? (
                        <EyeOffIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <KeyIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showPin ? "text" : "password"}
                      placeholder="Confirmer le nouveau code PIN"
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  Changer le code PIN
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
};

export default Profile;
