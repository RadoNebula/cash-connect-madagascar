
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
  const [processingConnection, setProcessingConnection] = useState(false);

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

    // Directly try the direct login method as it's now our preferred way
    handleDirectLogin();
  };

  const handleDirectLogin = async () => {
    try {
      setProcessingConnection(true);
      setError("");
      
      // Supprimer les caractères spéciaux du numéro de téléphone
      const formattedPhone = phone.replace(/\+|\s|-/g, '');
      const email = `user_${formattedPhone}@cashpoint.app`;
      
      toast.info("Connexion en cours...");

      // Try direct login first
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: pin,
      });
      
      if (!error && data.user) {
        toast.success("Connexion réussie!");
        navigate("/");
        return;
      }
      
      // If direct login fails, try to create an account
      console.log("Direct login failed, trying to create account:", error?.message);
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: pin,
        options: {
          data: {
            phone: formattedPhone,
            name: `Utilisateur ${formattedPhone}`
          },
          // Important: We don't want email verification
          emailRedirectTo: `${window.location.origin}/login`
        }
      });
      
      // If account creation succeeds or user already exists, try login again
      if (signUpError && !signUpError.message.includes("already registered")) {
        throw signUpError;
      }

      // Small delay before trying to login again
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Try to log in again after account creation or if user already exists
      const { data: finalLoginData, error: finalLoginError } = await supabase.auth.signInWithPassword({
        email: email,
        password: pin,
      });
      
      if (!finalLoginError && finalLoginData.user) {
        toast.success("Connexion réussie!");
        navigate("/");
      } else {
        console.error("Final login attempt failed:", finalLoginError);
        throw new Error("Connexion impossible après plusieurs tentatives");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("La connexion a échoué. Veuillez vérifier vos informations et réessayer.");
      toast.error("Erreur de connexion");
    } finally {
      setProcessingConnection(false);
    }
  };

  const handleAutoConfirm = async () => {
    try {
      setProcessingConnection(true);
      setError("");
      
      // Supprimer les caractères spéciaux du numéro de téléphone
      const formattedPhone = phone.replace(/\+|\s|-/g, '');
      const email = `user_${formattedPhone}@cashpoint.app`;

      toast.info("Tentative de connexion alternative...");
      
      // Essayer différentes approches pour contourner la confirmation par email
      
      // 1. Essayer de s'inscrire d'abord (si l'utilisateur existe déjà, ça échouera gracieusement)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: pin,
        options: {
          data: {
            phone: formattedPhone,
            name: `Utilisateur ${formattedPhone}`
          }
        }
      });
      
      if (signUpError && !signUpError.message.includes("already registered")) {
        console.error("Signup error:", signUpError);
      }
      
      // 2. Essayer la méthode signInWithPassword (méthode standard)
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: pin
      });
      
      if (!error && data.user) {
        toast.success("Connexion réussie!");
        navigate("/");
        return;
      }
      
      // 3. Si la connexion échoue à cause de la confirmation email, essayer de réinitialiser le mot de passe
      if (error && error.message.includes("Email not confirmed")) {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
        
        if (!resetError) {
          toast.info("Un email de récupération a été envoyé. Veuillez réessayer la connexion après avoir cliqué sur le lien.");
        }
      }
      
      // 4. Dernière tentative: Attendre un court instant et réessayer
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
        email: email,
        password: pin
      });
      
      if (!retryError && retryData.user) {
        toast.success("Connexion réussie!");
        navigate("/");
        return;
      }
      
      throw new Error("Connexion impossible après plusieurs tentatives");
    } catch (err) {
      console.error("Auto-confirm error:", err);
      setError("La connexion alternative a échoué. Veuillez réessayer plus tard ou créer un nouveau compte.");
    } finally {
      setProcessingConnection(false);
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
                  disabled={isLoading || processingConnection}
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
                  disabled={isLoading || processingConnection}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  disabled={isLoading || processingConnection}
                >
                  {showPin ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <Button 
                type="button" 
                variant="secondary" 
                className="w-full"
                onClick={handleAutoConfirm}
                disabled={isLoading || processingConnection}
              >
                {processingConnection ? "Connexion en cours..." : "Connexion alternative"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              La connexion standard est recommandée. Si cela échoue, essayez la connexion alternative.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading || processingConnection}>
              {processingConnection ? "Connexion..." : "Se connecter"}
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
