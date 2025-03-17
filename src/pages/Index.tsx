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
import { useAuth } from "@/context/AuthContext";
import { useTransactions, MobileMoneyService, Transaction } from "@/context/TransactionContext";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getRecentTransactions } = useTransactions();
  
  const recentTransactions = getRecentTransactions(5);
  
  if (!user) {
    return null;
  }

  const totalBalance = 
    user.balances.mvola + 
    user.balances.orangeMoney + 
    user.balances.airtelMoney;

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
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-8 md:pl-56">
        {/* Welcome section */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bonjour, {user.name.split(' ')[0]}</h1>
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

        {/* Balance cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-primary/20 to-primary/10 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Solde Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
            </CardContent>
          </Card>

          <Card className="service-card service-card-mvola">
            <CardHeader className="pb-2">
              <ServiceIcon service="mvola" size={20} />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{formatCurrency(user.balances.mvola)}</div>
            </CardContent>
          </Card>

          <Card className="service-card service-card-orange">
            <CardHeader className="pb-2">
              <ServiceIcon service="orangeMoney" size={20} />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{formatCurrency(user.balances.orangeMoney)}</div>
            </CardContent>
          </Card>

          <Card className="service-card service-card-airtel">
            <CardHeader className="pb-2">
              <ServiceIcon service="airtelMoney" size={20} />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{formatCurrency(user.balances.airtelMoney)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick action buttons */}
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

        {/* Recent transactions */}
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
