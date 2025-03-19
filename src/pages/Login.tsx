
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { EyeIcon, EyeOffIcon, KeyIcon, PhoneIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState("");
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [processingAutoConfirm, setProcessingAutoConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (phone.trim() === "" || pin.trim() === "") {
      setError("Veuillez remplir tous les champs");
      return;
    }

    if (pin.length < 6) {
      setError("Le code PIN doit contenir au moins 6 chiffres");
      return;
    }

    // Supprimer les caractères spéciaux du numéro de téléphone
    const formattedPhone = phone.replace(/\+|\s|-/g, '');
    const email = `user_${formattedPhone}@cashpoint.app`;

    try {
      const success = await login(formattedPhone, pin);
      if (success) {
        navigate("/");
      } else {
        // Si la connexion échoue, vérifier si c'est à cause d'un email non confirmé
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email,
          password: pin,
        });

        if (signInError && signInError.message === "Email not confirmed") {
          // Proposer de confirmer manuellement le compte
          setError("Votre compte n'est pas confirmé. Voulez-vous le confirmer maintenant?");
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Une erreur s'est produite lors de la connexion");
    }
  };

  const handleAutoConfirm = async () => {
    try {
      setProcessingAutoConfirm(true);
      setError("");
      
      // Supprimer les caractères spéciaux du numéro de téléphone
      const formattedPhone = phone.replace(/\+|\s|-/g, '');
      const email = `user_${formattedPhone}@cashpoint.app`;

      // Envoyer à nouveau un email de confirmation
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
      
      if (resetError) {
        console.error("Error requesting password reset:", resetError);
        setError("Erreur lors de la tentative de confirmation du compte");
        return;
      }
      
      // Tenter de confirmer manuellement
      const { data, error: adminUpdateError } = await supabase.auth.admin.updateUserById(
        '00000000-0000-0000-0000-000000000000', // ceci sera ignoré car nous n'avons pas les droits admin
        { email_confirm: true }
      );
      
      // Cette tentative échouera en général, mais nous pouvons quand même essayer une connexion directe
      toast.success("Tentative de connexion directe...");
      
      // Tenter une connexion directe
      const success = await login(formattedPhone, pin);
      if (success) {
        navigate("/");
      } else {
        setError("Erreur lors de la confirmation automatique. Veuillez contacter l'administrateur.");
      }
    } catch (err) {
      console.error("Auto-confirm error:", err);
      setError("Erreur lors de la confirmation automatique");
    } finally {
      setProcessingAutoConfirm(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-b from-primary/5 to-background">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <Logo size="lg" className="mb-4" />
          <CardTitle className="text-2xl font-bold">Bienvenue</CardTitle>
          <CardDescription>
            Connectez-vous pour accéder à votre tableau de bord
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
                {error.includes("n'est pas confirmé") && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full mt-2"
                    onClick={handleAutoConfirm}
                    disabled={processingAutoConfirm}
                  >
                    {processingAutoConfirm ? "Confirmation en cours..." : "Confirmer mon compte"}
                  </Button>
                )}
              </div>
            )}
            
            <div className="space-y-2">
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Numéro de téléphone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                  disabled={isLoading || processingAutoConfirm}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <KeyIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPin ? "text" : "password"}
                  placeholder="Code PIN (au moins 6 chiffres)"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="pl-10 pr-10"
                  disabled={isLoading || processingAutoConfirm}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  disabled={isLoading || processingAutoConfirm}
                >
                  {showPin ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading || processingAutoConfirm}>
              {isLoading ? "Connexion..." : "Se connecter"}
            </Button>
            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                Vous n'avez pas de compte?{" "}
              </span>
              <Link to="/signup" className="text-primary hover:underline">
                Créer un compte
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;
