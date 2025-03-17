
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { ServiceIcon } from "@/components/ServiceIcon";
import { PlusIcon, MinusIcon, MoveHorizontalIcon } from "lucide-react";
import DepositForm from "@/components/transactions/DepositForm";
import WithdrawForm from "@/components/transactions/WithdrawForm";
import TransferForm from "@/components/transactions/TransferForm";

const TransactionsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("deposit");

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6 md:pl-56">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            Effectuez des dépôts, retraits et transferts d'argent
          </p>
        </div>

        <Tabs defaultValue="deposit" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
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
