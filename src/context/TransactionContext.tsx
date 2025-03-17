
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
  depositMoney: (service: MobileMoneyService, amount: number, phoneNumber: string) => Promise<boolean>;
  withdrawMoney: (service: MobileMoneyService, amount: number, phoneNumber: string) => Promise<boolean>;
  transferMoney: (
    service: MobileMoneyService, 
    amount: number, 
    recipient: { name: string; phone: string },
    description?: string
  ) => Promise<boolean>;
  getServiceBalance: (service: MobileMoneyService) => number;
  getCashBalance: () => number;
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
      phoneNumber: "034 11 222 33",
      date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      status: 'completed',
    },
    {
      id: "tx-2",
      type: 'withdrawal',
      service: 'orangeMoney',
      amount: 25000,
      fees: 500,
      phoneNumber: "032 22 333 44",
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
        phone: "+261 33 11 222 33",
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
      phoneNumber: "034 33 444 55",
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
        phone: "+261 32 33 444 55",
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
  const [balances, setBalances] = useState<SessionBalances>({
    cash: 0,
    mvola: 0,
    orangeMoney: 0,
    airtelMoney: 0
  });
  const [sessionStarted, setSessionStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Load transactions and balances from local storage or initialize with defaults
  useEffect(() => {
    const storedTransactions = localStorage.getItem('cashpoint_transactions');
    const storedBalances = localStorage.getItem('cashpoint_balances');
    const storedSessionStarted = localStorage.getItem('cashpoint_session_started');
    
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

  // Save transactions and balances to local storage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('cashpoint_transactions', JSON.stringify(transactions));
      localStorage.setItem('cashpoint_balances', JSON.stringify(balances));
      localStorage.setItem('cashpoint_session_started', sessionStarted.toString());
    }
  }, [transactions, balances, sessionStarted, isLoading]);

  // Calculate transaction fees based on type and amount
  const calculateFees = (type: TransactionType, amount: number): number => {
    if (type === 'deposit') return 0; // Deposits are free
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
      // Set the initial balances
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

  const depositMoney = async (service: MobileMoneyService, amount: number, phoneNumber: string): Promise<boolean> => {
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Validate phone number
      if (!phoneNumber.trim()) {
        throw new Error("Le numéro de téléphone est requis");
      }

      // For a deposit:
      // 1. Cash balance increases
      // 2. Mobile money balance decreases
      const updatedBalances = { ...balances };
      updatedBalances.cash += amount;
      updatedBalances[service] -= amount;

      // Validate service balance is sufficient
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
      return true;
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

  const withdrawMoney = async (service: MobileMoneyService, amount: number, phoneNumber: string): Promise<boolean> => {
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Validate phone number
      if (!phoneNumber.trim()) {
        throw new Error("Le numéro de téléphone est requis");
      }

      const fees = calculateFees('withdrawal', amount);
      
      // For a withdrawal:
      // 1. Cash balance decreases
      // 2. Mobile money balance increases
      const updatedBalances = { ...balances };
      
      // Validate cash balance is sufficient
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
      return true;
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
  ): Promise<boolean> => {
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const fees = calculateFees('transfer', amount);
      
      // For a transfer:
      // 1. Cash balance increases (customer pays cash)
      // 2. Mobile money balance decreases (sent from agent's account)
      const updatedBalances = { ...balances };

      // Check if mobile money balance is sufficient
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
      return true;
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
