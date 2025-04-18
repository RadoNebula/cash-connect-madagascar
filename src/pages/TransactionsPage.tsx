import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { ServiceIcon } from "@/components/ServiceIcon";
import { PlusIcon, MinusIcon, MoveHorizontalIcon, CoinsIcon, XIcon } from "lucide-react";
import DepositForm from "@/components/transactions/DepositForm";
import WithdrawForm from "@/components/transactions/WithdrawForm";
import TransferForm from "@/components/transactions/TransferForm";
import SessionBalanceForm from "@/components/transactions/SessionBalanceForm";
import { useTransactions } from "@/context/TransactionContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const TransactionsPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { user } = useAuth();
  const { sessionStarted } = useTransactions();
  const [activeTab, setActiveTab] = useState(params.type || "session");

  // Set the active tab based on the URL parameter if available
  useEffect(() => {
    if (params.type && (params.type === "deposit" || params.type === "withdraw" || params.type === "transfer")) {
      setActiveTab(params.type);
    }
  }, [params.type]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value !== "session" && !sessionStarted) {
      toast.warning("Veuillez d'abord initialiser les soldes de départ de la session");
      setActiveTab("session");
      return;
    }
  };

  const handleCloseSession = async () => {
    try {
      const { data, error } = await supabase
        .from('session_balances')
        .update({ is_active: false })
        .eq('is_active', true);

      if (error) throw error;
      
      navigate('/');
      toast.success("Session fermée avec succès");
    } catch (error) {
      console.error('Error closing session:', error);
      toast.error("Erreur lors de la fermeture de la session");
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6 md:pl-56">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
            <p className="text-muted-foreground">
              Effectuez des dépôts, retraits et transferts d'argent
            </p>
          </div>
          {sessionStarted && (
            <Button 
              variant="destructive" 
              onClick={handleCloseSession}
              className="gap-2"
            >
              <XIcon className="h-4 w-4" />
              Fermer la session
            </Button>
          )}
        </div>

        <Tabs defaultValue="session" value={activeTab as string} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="session" className="flex items-center gap-2">
              <CoinsIcon className="h-4 w-4 text-primary" />
              <span>Soldes</span>
            </TabsTrigger>
            <TabsTrigger value="deposit" className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4 text-success" />
              <span>Dépôt</span>
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="flex items-center gap-2">
              <MinusIcon className="h-4 w-4 text-warning" />
              <span>Retrait</span>
            </TabsTrigger>
            <TabsTrigger value="transfer" className="flex items-center gap-2">
              <MoveHorizontalIcon className="h-4 w-4 text-info" />
              <span>Transfert</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="session">
              <Card>
                <CardHeader>
                  <CardTitle>Soldes de début de session</CardTitle>
                  <CardDescription>
                    Indiquez les soldes de départ pour chaque service et en espèces
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SessionBalanceForm />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="deposit">
              <Card>
                <CardHeader>
                  <CardTitle>Dépôt d'argent</CardTitle>
                  <CardDescription>
                    Ajoutez de l'argent à votre compte mobile money
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DepositForm />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="withdraw">
              <Card>
                <CardHeader>
                  <CardTitle>Retrait d'argent</CardTitle>
                  <CardDescription>
                    Retirez de l'argent de votre compte mobile money
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <WithdrawForm />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="transfer">
              <Card>
                <CardHeader>
                  <CardTitle>Transfert d'argent</CardTitle>
                  <CardDescription>
                    Envoyez de l'argent à un autre utilisateur
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TransferForm />
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </AppShell>
  );
};

export default TransactionsPage;
