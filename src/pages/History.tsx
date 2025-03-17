
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTransactions, Transaction, TransactionType } from "@/context/TransactionContext";
import { ServiceIcon, TransactionIcon } from "@/components/ServiceIcon";
import { SearchIcon } from "lucide-react";

const History = () => {
  const { transactions } = useTransactions();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<TransactionType | "all">("all");
  
  // Sort transactions by date (newest first)
  const sortedTransactions = [...transactions].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );
  
  // Filter transactions based on search term and filter type
  const filteredTransactions = sortedTransactions.filter(transaction => {
    const matchesSearch = 
      transaction.recipient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.recipient?.phone?.includes(searchTerm) ||
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || transaction.type === filterType;
    
    return matchesSearch && matchesType;
  });

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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6 md:pl-56">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Historique des transactions</h1>
          <p className="text-muted-foreground">
            Consultez toutes vos transactions passées
          </p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Transactions</CardTitle>
            <div className="flex flex-col gap-4 mt-4 md:flex-row">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select
                value={filterType}
                onValueChange={(value) => setFilterType(value as TransactionType | "all")}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Type de transaction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="deposit">Dépôt</SelectItem>
                  <SelectItem value="withdrawal">Retrait</SelectItem>
                  <SelectItem value="transfer">Transfert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          
          <CardContent>
            {filteredTransactions.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                Aucune transaction trouvée
              </div>
            ) : (
              <div className="space-y-1">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="transaction-item">
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
                        {transaction.description && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {transaction.description}
                          </div>
                        )}
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
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
};

export default History;
