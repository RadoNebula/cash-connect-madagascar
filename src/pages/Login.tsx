
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Rediriger automatiquement vers la page d'accueil
    toast.success("Accès direct activé");
    navigate("/");
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <p>Redirection vers l'application...</p>
    </div>
  );
};

export default Login;
