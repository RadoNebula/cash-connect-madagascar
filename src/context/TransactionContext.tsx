
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
  recipient?: {
    name: string;
    phone: string;
  };
  description?: string;
  date: Date;
  status: 'completed' | 'pending' | 'failed';
};

type TransactionContextType = {
  transactions: Transaction[];
  isLoading: boolean;
  depositMoney: (service: MobileMoneyService, amount: number) => Promise<boolean>;
  withdrawMoney: (service: MobileMoneyService, amount: number) => Promise<boolean>;
  transferMoney: (
    service: MobileMoneyService, 
    amount: number, 
    recipient: { name: string; phone: string },
    description?: string
  ) => Promise<boolean>;
  getServiceTransactions: (service: MobileMoneyService) => Transaction[];
  getTransactionsByType: (type: TransactionType) => Transaction[];
  getRecentTransactions: (limit?: number) => Transaction[];
};

// Mock transaction data
const generateMockTransactions = (): Transaction[] => {
  const now = new Date();
  
  return [
    {
      id: "tx-1",
      type: 'deposit',
      service: 'mvola',
      amount: 50000,
      fees: 0,
      date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      status: 'completed',
    },
    {
      id: "tx-2",
      type: 'withdrawal',
      service: 'orangeMoney',
      amount: 25000,
      fees: 500,
      date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      status: 'completed',
    },
    {
      id: "tx-3",
      type: 'transfer',
      service: 'airtelMoney',
      amount: 15000,
      fees: 300,
      recipient: {
        name: "Marie",
        phone: "+261 32 11 222 33",
      },
      description: "Paiement du loyer",
      date: new Date(now.getTime() - 12 * 60 * 60 * 1000),
      status: 'completed',
    },
    {
      id: "tx-4",
      type: 'deposit',
      service: 'mvola',
      amount: 20000,
      fees: 0,
      date: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      status: 'completed',
    },
    {
      id: "tx-5",
      type: 'transfer',
      service: 'orangeMoney',
      amount: 5000,
      fees: 100,
      recipient: {
        name: "Boutique Centrale",
        phone: "+261 34 33 444 55",
      },
      description: "Achat de crédit",
      date: new Date(now.getTime() - 1 * 60 * 60 * 1000),
      status: 'completed',
    },
  ];
};

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Load transactions from local storage or initialize with mock data
  useEffect(() => {
    const storedTransactions = localStorage.getItem('cashpoint_transactions');
    
    const timer = setTimeout(() => {
      if (storedTransactions) {
        // Convert date strings back to Date objects
        const parsedTransactions = JSON.parse(storedTransactions) as Transaction[];
        parsedTransactions.forEach(tx => {
          tx.date = new Date(tx.date);
        });
        setTransactions(parsedTransactions);
      } else {
        // Initialize with mock data
        setTransactions(generateMockTransactions());
      }
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Save transactions to local storage whenever they change
  useEffect(() => {
    if (transactions.length > 0 && !isLoading) {
      localStorage.setItem('cashpoint_transactions', JSON.stringify(transactions));
    }
  }, [transactions, isLoading]);

  // Calculate transaction fees based on type and amount
  const calculateFees = (type: TransactionType, amount: number): number => {
    if (type === 'deposit') return 0; // Deposits are free
    if (type === 'withdrawal') return Math.max(300, amount * 0.02);
    if (type === 'transfer') return Math.max(200, amount * 0.015);
    return 0;
  };

  const depositMoney = async (service: MobileMoneyService, amount: number): Promise<boolean> => {
    if (!user) {
      toast.error("Veuillez vous connecter pour effectuer cette opération");
      return false;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newTransaction: Transaction = {
        id: `tx-${Date.now()}`,
        type: 'deposit',
        service,
        amount,
        fees: calculateFees('deposit', amount),
        date: new Date(),
        status: 'completed',
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      toast.success(`Dépôt de ${amount.toLocaleString()} Ar effectué avec succès!`);
      return true;
    } catch (error) {
      toast.error("Erreur lors du dépôt. Veuillez réessayer.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const withdrawMoney = async (service: MobileMoneyService, amount: number): Promise<boolean> => {
    if (!user) {
      toast.error("Veuillez vous connecter pour effectuer cette opération");
      return false;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const fees = calculateFees('withdrawal', amount);
      
      const newTransaction: Transaction = {
        id: `tx-${Date.now()}`,
        type: 'withdrawal',
        service,
        amount,
        fees,
        date: new Date(),
        status: 'completed',
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      toast.success(`Retrait de ${amount.toLocaleString()} Ar effectué avec succès!`);
      return true;
    } catch (error) {
      toast.error("Erreur lors du retrait. Veuillez réessayer.");
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
  ): Promise<boolean> => {
    if (!user) {
      toast.error("Veuillez vous connecter pour effectuer cette opération");
      return false;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const fees = calculateFees('transfer', amount);
      
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
      toast.success(`Transfert de ${amount.toLocaleString()} Ar vers ${recipient.name} effectué avec succès!`);
      return true;
    } catch (error) {
      toast.error("Erreur lors du transfert. Veuillez réessayer.");
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
      depositMoney,
      withdrawMoney,
      transferMoney,
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
