
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { EyeIcon, EyeOffIcon, KeyIcon, PhoneIcon, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Signup = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState("");
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();
  const [processingSignup, setProcessingSignup] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (name.trim() === "" || phone.trim() === "" || pin.trim() === "") {
      setError("Tous les champs sont obligatoires");
      return;
    }

    if (pin !== confirmPin) {
      setError("Les codes PIN ne correspondent pas");
      return;
    }

    if (pin.length < 6) {
      setError("Le code PIN doit contenir au moins 6 chiffres");
      return;
    }

    // Format the phone number (remove special characters)
    const formattedPhone = phone.replace(/\+|\s|-/g, '');
    setProcessingSignup(true);

    try {
      console.log("Starting signup process for:", { name, phone: formattedPhone });
      
      // Check if user account already exists with this phone number
      const { data: existingUser, error: userCheckError } = await supabase
        .from('user_accounts')
        .select('*')
        .eq('phone', formattedPhone)
        .maybeSingle();
        
      if (existingUser) {
        console.log("User account already exists:", existingUser);
        setError("Un compte avec ce numéro de téléphone existe déjà");
        setProcessingSignup(false);
        return;
      }
      
      // Generate email from phone (for auth)
      const generatedEmail = `user_${formattedPhone}@cashpoint.app`;
      
      console.log("Creating user with auth and user account data...");
      
      // Create user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: generatedEmail,
        password: pin,
        options: {
          data: {
            name: name,
            phone: formattedPhone,
            pin: pin
          }
        }
      });
      
      if (authError) {
        console.error("Auth signup error:", authError);
        setError("Erreur lors de la création du compte: " + authError.message);
        setProcessingSignup(false);
        return;
      }
      
      console.log("Auth signup success, user ID:", authData.user?.id);
      
      // Wait a moment to ensure trigger has time to create user account
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify the user account was created
      const { data: userData, error: userError } = await supabase
        .from('user_accounts')
        .select('*')
        .eq('phone', formattedPhone)
        .maybeSingle();
        
      if (userError || !userData) {
        console.error("User account verification error:", userError);
        console.log("Manually creating user account...");
        
        // If user account creation failed via trigger, try direct insertion
        if (authData.user) {
          const { error: insertError } = await supabase
            .from('user_accounts')
            .insert({
              auth_id: authData.user.id,
              name: name,
              phone: formattedPhone,
              email: generatedEmail
            });
            
          if (insertError) {
            console.error("Manual user account creation error:", insertError);
          } else {
            console.log("Manual user account creation successful");
          }
        }
      } else {
        console.log("User account verified successfully:", userData);
      }
      
      // Sign in the user
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: generatedEmail,
        password: pin
      });
      
      if (signInError) {
        console.error("Auto sign-in error:", signInError);
        toast.success("Compte créé avec succès! Veuillez vous connecter.");
        navigate("/login");
      } else {
        toast.success("Compte créé et connecté avec succès!");
        navigate("/");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("Une erreur s'est produite lors de la création du compte. Veuillez réessayer.");
    } finally {
      setProcessingSignup(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-b from-primary/5 to-background">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <Logo size="lg" className="mb-4" />
          <CardTitle className="text-2xl font-bold">Créer un compte</CardTitle>
          <CardDescription>
            Inscrivez-vous pour commencer à utiliser Cash Point
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
                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Nom complet"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  disabled={isLoading || processingSignup}
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
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                  disabled={isLoading || processingSignup}
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
                  maxLength={8}
                  disabled={isLoading || processingSignup}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  disabled={isLoading || processingSignup}
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
                  placeholder="Confirmer le code PIN"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  className="pl-10 pr-10"
                  maxLength={8}
                  disabled={isLoading || processingSignup}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading || processingSignup}>
              {processingSignup ? "Création..." : "Créer un compte"}
            </Button>
            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                Vous avez déjà un compte?{" "}
              </span>
              <Link to="/login" className="text-primary hover:underline">
                Se connecter
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Signup;
