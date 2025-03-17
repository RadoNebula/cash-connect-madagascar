
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  CalendarIcon, 
  FilterIcon, 
  SearchIcon,
  DownloadIcon
} from "lucide-react";
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppShell } from "@/components/AppShell";
import { ServiceIcon, TransactionIcon } from "@/components/ServiceIcon";
import { useAuth } from "@/context/AuthContext";
import { useTransactions, Transaction, TransactionType, MobileMoneyService } from "@/context/TransactionContext";

const History = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { transactions } = useTransactions();
  
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<TransactionType | "all">("all");
  const [filterService, setFilterService] = useState<MobileMoneyService | "all">("all");

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    let results = [...transactions];
    
    // Filter by type
    if (filterType !== "all") {
      results = results.filter(tx => tx.type === filterType);
    }
    
    // Filter by service
    if (filterService !== "all") {
      results = results.filter(tx => tx.service === filterService);
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(tx => 
        tx.recipient?.name?.toLowerCase().includes(term) ||
        tx.recipient?.phone?.toLowerCase().includes(term) ||
        tx.description?.toLowerCase().includes(term)
      );
    }
    
    // Sort by date (most recent first)
    results.sort((a, b) => b.date.getTime() - a.date.getTime());
    
    setFilteredTransactions(results);
  }, [transactions, searchTerm, filterType, filterService]);

  if (!user) {
    return null;
  }

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

  const getTransactionTypeLabel = (type: TransactionType) => {
    switch (type) {
      case 'deposit': return 'Dépôt';
      case 'withdrawal': return 'Retrait';
      case 'transfer': return 'Transfert';
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6 md:pl-56">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Historique</h1>
            <p className="text-muted-foreground">
              Consultez l'historique de vos transactions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                // This would generate a report in a real app
                alert("Fonctionnalité d'exportation disponible dans une future version");
              }}
            >
              <DownloadIcon className="mr-2 h-4 w-4" />
              Exporter
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Rechercher</label>
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={filterType} onValueChange={(value) => setFilterType(value as TransactionType | "all")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="deposit">Dépôts</SelectItem>
                    <SelectItem value="withdrawal">Retraits</SelectItem>
                    <SelectItem value="transfer">Transferts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Service</label>
                <Select value={filterService} onValueChange={(value) => setFilterService(value as MobileMoneyService | "all")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les services" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les services</SelectItem>
                    <SelectItem value="mvola">MVola</SelectItem>
                    <SelectItem value="orangeMoney">Orange Money</SelectItem>
                    <SelectItem value="airtelMoney">Airtel Money</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Période</label>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-left font-normal"
                  onClick={() => {
                    // This would open a date picker in a real app
                    alert("Filtrage par date disponible dans une future version");
                  }}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  <span>Choisir des dates</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>
              {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <p>Aucune transaction ne correspond à vos critères de recherche</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex flex-col space-y-2 rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <TransactionIcon type={transaction.type} />
                        <div>
                          <div className="font-medium">
                            {transaction.type === 'transfer' 
                              ? `Transfert vers ${transaction.recipient?.name}`
                              : getTransactionTypeLabel(transaction.type)
                            }
                          </div>
                          {transaction.description && (
                            <div className="text-sm text-muted-foreground">
                              {transaction.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
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
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <ServiceIcon 
                        service={transaction.service} 
                        className="text-xs" 
                        size={16} 
                      />
                      <span>{formatDate(transaction.date)}</span>
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
