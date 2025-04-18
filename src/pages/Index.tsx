import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  CoinsIcon, 
  ArrowUpIcon, 
  ArrowDownIcon, 
  MoveHorizontalIcon,
  ArrowRightIcon,
  PlusIcon,
  MinusIcon,
  ChevronRightIcon
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/AppShell";
import { ServiceIcon, TransactionIcon } from "@/components/ServiceIcon";
import { useTransactions, MobileMoneyService, Transaction } from "@/context/TransactionContext";

const Index = () => {
  const navigate = useNavigate();
  const { 
    getRecentTransactions, 
    getServiceBalance, 
    getCashBalance,
    sessionStarted,
    isLoading 
  } = useTransactions();
  
  const recentTransactions = getRecentTransactions(5);
  
  const userName = "Utilisateur";
  
  // Get real balances from the transaction context
  const cashBalance = getCashBalance();
  const mvolaBalance = getServiceBalance('mvola');
  const orangeMoneyBalance = getServiceBalance('orangeMoney');
  const airtelMoneyBalance = getServiceBalance('airtelMoney');
  
  const totalBalance = mvolaBalance + orangeMoneyBalance + airtelMoneyBalance;

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString() + " Ar";
  };

  useEffect(() => {
    if (!sessionStarted && !isLoading) {
      navigate("/transactions");
    }
  }, [sessionStarted, isLoading, navigate]);

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-8 md:pl-56">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bonjour, {userName}</h1>
            <p className="text-muted-foreground">
              Bienvenue sur votre tableau de bord Cash Point
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/reports")}
            >
              <CoinsIcon className="mr-2 h-4 w-4" />
              Rapports
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-success/20 to-success/10 border-success/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-success">
                Solde en espèces
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{formatCurrency(cashBalance)}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#EF476F]/20 to-[#EF476F]/10 border-[#EF476F]/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#EF476F]">
                Solde MVola
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#EF476F]">{formatCurrency(mvolaBalance)}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#FF9F1C]/20 to-[#FF9F1C]/10 border-[#FF9F1C]/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#FF9F1C]">
                Solde Orange Money
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#FF9F1C]">{formatCurrency(orangeMoneyBalance)}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#06D6A0]/20 to-[#06D6A0]/10 border-[#06D6A0]/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#06D6A0]">
                Solde Airtel Money
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#06D6A0]">{formatCurrency(airtelMoneyBalance)}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center p-4 h-auto text-success hover:text-success"
            onClick={() => navigate("/transactions/deposit")}
          >
            <PlusIcon className="h-6 w-6 mb-1" />
            <span>Dépôt</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center p-4 h-auto text-warning hover:text-warning"
            onClick={() => navigate("/transactions/withdraw")}
          >
            <MinusIcon className="h-6 w-6 mb-1" />
            <span>Retrait</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center p-4 h-auto text-info hover:text-info"
            onClick={() => navigate("/transactions/transfer")}
          >
            <MoveHorizontalIcon className="h-6 w-6 mb-1" />
            <span>Transfert</span>
          </Button>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-lg font-medium">Transactions récentes</CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-muted-foreground"
              onClick={() => navigate("/history")}
            >
              Voir tout
              <ChevronRightIcon className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {recentTransactions.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                Aucune transaction récente
              </div>
            ) : (
              <div className="space-y-1">
                {recentTransactions.map((transaction) => (
                  <TransactionItem 
                    key={transaction.id} 
                    transaction={transaction} 
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
};

interface TransactionItemProps {
  transaction: Transaction;
}

const TransactionItem = ({ transaction }: TransactionItemProps) => {
  const getTransactionTitle = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'deposit':
        return 'Dépôt';
      case 'withdrawal':
        return 'Retrait';
      case 'transfer':
        return `Transfert vers ${transaction.recipient?.name || 'Inconnu'}`;
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString() + " Ar";
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="transaction-item">
      <div className="flex items-center gap-3">
        <TransactionIcon type={transaction.type} />
        <div>
          <div className="font-medium">{getTransactionTitle(transaction)}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <ServiceIcon 
              service={transaction.service} 
              className="text-xs" 
              size={14} 
            />
            <span className="text-xs">{formatDate(transaction.date)}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <div className={`font-medium ${
          transaction.type === 'deposit' ? 'text-success' : 
          transaction.type === 'withdrawal' ? 'text-warning' : 
          'text-info'
        }`}>
          {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
        </div>
        {transaction.fees > 0 && (
          <div className="text-xs text-muted-foreground">
            Frais: {formatCurrency(transaction.fees)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
