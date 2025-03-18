import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";
import { useAuth } from './AuthContext';

export type TransactionType = 'deposit' | 'withdrawal' | 'transfer';
export type MobileMoneyService = 'mvola' | 'orangeMoney' | 'airtelMoney';

export type Transaction = {
  id: string;
  type: TransactionType;
  service: MobileMoneyService;
  amount: number;
  fees: number;
  phoneNumber?: string;
  recipient?: {
    name: string;
    phone: string;
  };
  description?: string;
  date: Date;
  status: 'completed' | 'pending' | 'failed';
};

export type SessionBalances = {
  cash: number;
  mvola: number;
  orangeMoney: number;
  airtelMoney: number;
};

type TransactionContextType = {
  transactions: Transaction[];
  isLoading: boolean;
  sessionStarted: boolean;
  startSession: (balances: SessionBalances) => Promise<boolean>;
  depositMoney: (service: MobileMoneyService, amount: number, phoneNumber: string) => Promise<Transaction | false>;
  withdrawMoney: (service: MobileMoneyService, amount: number, phoneNumber: string) => Promise<Transaction | false>;
  transferMoney: (
    service: MobileMoneyService, 
    amount: number, 
    recipient: { name: string; phone: string },
    description?: string
  ) => Promise<Transaction | false>;
  getServiceBalance: (service: MobileMoneyService) => number;
  getCashBalance: () => number;
  getServiceTransactions: (service: MobileMoneyService) => Transaction[];
  getTransactionsByType: (type: TransactionType) => Transaction[];
  getRecentTransactions: (limit?: number) => Transaction[];
};

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balances, setBalances] = useState<SessionBalances>({
    cash: 0,
    mvola: 0,
    orangeMoney: 0,
    airtelMoney: 0
  });
  const [sessionStarted, setSessionStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const storedTransactions = localStorage.getItem('cashpoint_transactions');
    const storedBalances = localStorage.getItem('cashpoint_balances');
    const storedSessionStarted = localStorage.getItem('cashpoint_session_started');
    
    const timer = setTimeout(() => {
      if (storedTransactions) {
        const parsedTransactions = JSON.parse(storedTransactions) as Transaction[];
        parsedTransactions.forEach(tx => {
          tx.date = new Date(tx.date);
        });
        setTransactions(parsedTransactions);
      } else {
        setTransactions(generateMockTransactions());
      }

      if (storedBalances) {
        setBalances(JSON.parse(storedBalances));
      }

      if (storedSessionStarted === 'true') {
        setSessionStarted(true);
      }
      
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('cashpoint_transactions', JSON.stringify(transactions));
      localStorage.setItem('cashpoint_balances', JSON.stringify(balances));
      localStorage.setItem('cashpoint_session_started', sessionStarted.toString());
    }
  }, [transactions, balances, sessionStarted, isLoading]);

  const calculateFees = (type: TransactionType, amount: number): number => {
    if (type === 'deposit') return 0;
    if (type === 'withdrawal') return Math.max(300, amount * 0.02);
    if (type === 'transfer') return Math.max(200, amount * 0.015);
    return 0;
  };

  const startSession = async (initialBalances: SessionBalances): Promise<boolean> => {
    if (sessionStarted) {
      toast.error("Une session est déjà en cours");
      return false;
    }
    
    setIsLoading(true);
    
    try {
      setBalances(initialBalances);
      setSessionStarted(true);
      toast.success("Session démarrée avec succès!");
      return true;
    } catch (error) {
      toast.error("Erreur lors du démarrage de la session");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getServiceBalance = (service: MobileMoneyService): number => {
    return balances[service];
  };

  const getCashBalance = (): number => {
    return balances.cash;
  };

  const depositMoney = async (service: MobileMoneyService, amount: number, phoneNumber: string): Promise<Transaction | false> => {
    if (!user) {
      toast.error("Veuillez vous connecter pour effectuer cette opération");
      return false;
    }

    if (!sessionStarted) {
      toast.error("Veuillez d'abord initialiser les soldes de départ de la session");
      return false;
    }
    
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (!phoneNumber.trim()) {
        throw new Error("Le numéro de téléphone est requis");
      }

      const updatedBalances = { ...balances };
      updatedBalances.cash += amount;
      updatedBalances[service] -= amount;

      if (updatedBalances[service] < 0) {
        throw new Error(`Solde ${service} insuffisant pour effectuer cette opération`);
      }
      
      const fees = calculateFees('deposit', amount);
      
      const newTransaction: Transaction = {
        id: `tx-${Date.now()}`,
        type: 'deposit',
        service,
        amount,
        fees,
        phoneNumber,
        date: new Date(),
        status: 'completed',
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      setBalances(updatedBalances);
      toast.success(`Dépôt de ${amount.toLocaleString()} Ar effectué avec succès!`);
      return newTransaction;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Erreur lors du dépôt. Veuillez réessayer.");
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const withdrawMoney = async (service: MobileMoneyService, amount: number, phoneNumber: string): Promise<Transaction | false> => {
    if (!user) {
      toast.error("Veuillez vous connecter pour effectuer cette opération");
      return false;
    }

    if (!sessionStarted) {
      toast.error("Veuillez d'abord initialiser les soldes de départ de la session");
      return false;
    }
    
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (!phoneNumber.trim()) {
        throw new Error("Le numéro de téléphone est requis");
      }

      const fees = calculateFees('withdrawal', amount);
      
      const updatedBalances = { ...balances };
      
      if (amount > updatedBalances.cash) {
        throw new Error(`Solde en espèces insuffisant pour effectuer cette opération`);
      }

      updatedBalances.cash -= amount;
      updatedBalances[service] += amount;
      
      const newTransaction: Transaction = {
        id: `tx-${Date.now()}`,
        type: 'withdrawal',
        service,
        amount,
        fees,
        phoneNumber,
        date: new Date(),
        status: 'completed',
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      setBalances(updatedBalances);
      toast.success(`Retrait de ${amount.toLocaleString()} Ar effectué avec succès!`);
      return newTransaction;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Erreur lors du retrait. Veuillez réessayer.");
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const transferMoney = async (
    service: MobileMoneyService, 
    amount: number, 
    recipient: { name: string; phone: string },
    description?: string
  ): Promise<Transaction | false> => {
    if (!user) {
      toast.error("Veuillez vous connecter pour effectuer cette opération");
      return false;
    }

    if (!sessionStarted) {
      toast.error("Veuillez d'abord initialiser les soldes de départ de la session");
      return false;
    }
    
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const fees = calculateFees('transfer', amount);
      
      const updatedBalances = { ...balances };

      if (amount > updatedBalances[service]) {
        throw new Error(`Solde ${service} insuffisant pour effectuer cette opération`);
      }

      updatedBalances.cash += amount;
      updatedBalances[service] -= amount;
      
      const newTransaction: Transaction = {
        id: `tx-${Date.now()}`,
        type: 'transfer',
        service,
        amount,
        fees,
        recipient,
        description,
        date: new Date(),
        status: 'completed',
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      setBalances(updatedBalances);
      toast.success(`Transfert de ${amount.toLocaleString()} Ar vers ${recipient.name} effectué avec succès!`);
      return newTransaction;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Erreur lors du transfert. Veuillez réessayer.");
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getServiceTransactions = (service: MobileMoneyService): Transaction[] => {
    return transactions.filter(tx => tx.service === service);
  };

  const getTransactionsByType = (type: TransactionType): Transaction[] => {
    return transactions.filter(tx => tx.type === type);
  };

  const getRecentTransactions = (limit: number = 5): Transaction[] => {
    return [...transactions]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);
  };

  return (
    <TransactionContext.Provider value={{
      transactions,
      isLoading,
      sessionStarted,
      startSession,
      depositMoney,
      withdrawMoney,
      transferMoney,
      getServiceBalance,
      getCashBalance,
      getServiceTransactions,
      getTransactionsByType,
      getRecentTransactions,
    }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};
