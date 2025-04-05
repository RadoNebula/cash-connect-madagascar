import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

type SessionResult = {
  success: boolean;
  error?: string;
};

type TransactionContextType = {
  transactions: Transaction[];
  isLoading: boolean;
  sessionStarted: boolean;
  startSession: (balances: SessionBalances) => Promise<SessionResult>;
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

// Define the calculateFees function once, at the top level
const calculateFees = (type: TransactionType, amount: number): number => {
  if (type === 'deposit') return 0;
  if (type === 'withdrawal') return Math.max(300, amount * 0.02);
  if (type === 'transfer') return Math.max(200, amount * 0.015);
  return 0;
};

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
  
  // Use a valid UUID format for the mock user ID
  const mockUserId = "00000000-0000-0000-0000-000000000000"; 

  // Fetch transactions and active session from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch transactions
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('transactions')
          .select('*')
          .order('date', { ascending: false });

        if (transactionsError) throw transactionsError;

        // Format the transactions from Supabase to match the Transaction type
        const formattedTransactions: Transaction[] = transactionsData.map(tx => ({
          id: tx.id,
          type: tx.type as TransactionType,
          service: tx.service as MobileMoneyService,
          amount: Number(tx.amount),
          fees: Number(tx.fees),
          phoneNumber: tx.phone_number,
          recipient: tx.recipient_name && tx.recipient_phone ? {
            name: tx.recipient_name,
            phone: tx.recipient_phone,
          } : undefined,
          description: tx.description,
          date: new Date(tx.date),
          status: tx.status as 'completed' | 'pending' | 'failed',
        }));

        setTransactions(formattedTransactions);

        // Fetch active session balance
        const { data: sessionData, error: sessionError } = await supabase
          .from('session_balances')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (sessionError && sessionError.code !== 'PGRST116') {
          throw sessionError;
        }

        if (sessionData) {
          setBalances({
            cash: Number(sessionData.cash),
            mvola: Number(sessionData.mvola),
            orangeMoney: Number(sessionData.orange_money),
            airtelMoney: Number(sessionData.airtel_money)
          });
          setSessionStarted(true);
        } else {
          setSessionStarted(false);
        }
      } catch (error) {
        console.error('Error fetching transaction data:', error);
        toast.error("Erreur lors du chargement des transactions");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Set up realtime subscription for session_balances
    const balancesChannel = supabase
      .channel('public:session_balances')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'session_balances' }, 
        (payload) => {
          if (payload.new && payload.eventType !== 'DELETE') {
            const newData = payload.new as any;
            if (newData.is_active) {
              setBalances({
                cash: Number(newData.cash),
                mvola: Number(newData.mvola),
                orangeMoney: Number(newData.orange_money),
                airtelMoney: Number(newData.airtel_money)
              });
              setSessionStarted(true);
            }
          }
        }
      )
      .subscribe();

    // Set up realtime subscription for transactions
    const transactionsChannel = supabase
      .channel('public:transactions')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'transactions' }, 
        (payload) => {
          if (payload.new) {
            const newTx = payload.new as any;
            const formattedTx: Transaction = {
              id: newTx.id,
              type: newTx.type as TransactionType,
              service: newTx.service as MobileMoneyService,
              amount: Number(newTx.amount),
              fees: Number(newTx.fees),
              phoneNumber: newTx.phone_number,
              recipient: newTx.recipient_name && newTx.recipient_phone ? {
                name: newTx.recipient_name,
                phone: newTx.recipient_phone,
              } : undefined,
              description: newTx.description,
              date: new Date(newTx.date),
              status: newTx.status as 'completed' | 'pending' | 'failed',
            };
            setTransactions(prev => [formattedTx, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(balancesChannel);
      supabase.removeChannel(transactionsChannel);
    };
  }, []);

  const startSession = async (initialBalances: SessionBalances): Promise<SessionResult> => {
    setIsLoading(true);
    
    try {
      console.log("Starting session with balances:", initialBalances);
      
      // First deactivate any active sessions
      const { error: deactivateError } = await supabase
        .from('session_balances')
        .update({ is_active: false })
        .eq('is_active', true);
        
      if (deactivateError) {
        console.error("Error deactivating existing sessions:", deactivateError);
        return { 
          success: false, 
          error: `Erreur lors de la désactivation des sessions existantes: ${deactivateError.message}` 
        };
      }

      // Insert new session balances in Supabase
      const { data, error } = await supabase
        .from('session_balances')
        .insert({
          user_id: mockUserId,
          cash: initialBalances.cash,
          mvola: initialBalances.mvola,
          orange_money: initialBalances.orangeMoney,
          airtel_money: initialBalances.airtelMoney,
          is_active: true
        })
        .select();

      if (error) {
        console.error("Error starting session:", error);
        let errorMessage = "Erreur lors du démarrage de la session.";
        
        if (error.code === '42501') {
          errorMessage = "Erreur de permission: Vous n'avez pas les droits nécessaires pour cette action.";
        } else if (error.message) {
          errorMessage = `Erreur: ${error.message}`;
        }
        
        return { success: false, error: errorMessage };
      }
      
      setBalances(initialBalances);
      setSessionStarted(true);
      return { success: true };
    } catch (error) {
      console.error('Error starting session:', error);
      let errorMessage = "Erreur inconnue lors du démarrage de la session.";
      
      if (error instanceof Error) {
        errorMessage = `Erreur: ${error.message}`;
      }
      
      return { success: false, error: errorMessage };
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
    setIsLoading(true);
    
    try {
      if (!sessionStarted) {
        throw new Error("Veuillez d'abord initialiser les soldes de départ de la session");
      }
      
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
      
      // Insert transaction in Supabase
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: mockUserId,
          type: 'deposit',
          service,
          amount,
          fees,
          phone_number: phoneNumber,
          date: new Date().toISOString(),
          status: 'completed'
        })
        .select()
        .single();

      if (error) throw error;
      
      // Update session balances
      const { error: updateError } = await supabase
        .from('session_balances')
        .update({
          cash: updatedBalances.cash,
          mvola: service === 'mvola' ? updatedBalances.mvola : balances.mvola,
          orange_money: service === 'orangeMoney' ? updatedBalances.orangeMoney : balances.orangeMoney,
          airtel_money: service === 'airtelMoney' ? updatedBalances.airtelMoney : balances.airtelMoney
        })
        .eq('is_active', true);

      if (updateError) throw updateError;
      
      const newTransaction: Transaction = {
        id: data.id,
        type: 'deposit',
        service,
        amount,
        fees,
        phoneNumber,
        date: new Date(data.date),
        status: 'completed',
      };
      
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
    setIsLoading(true);
    
    try {
      if (!sessionStarted) {
        throw new Error("Veuillez d'abord initialiser les soldes de départ de la session");
      }
      
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
      
      // Insert transaction in Supabase
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: mockUserId,
          type: 'withdrawal',
          service,
          amount,
          fees,
          phone_number: phoneNumber,
          date: new Date().toISOString(),
          status: 'completed'
        })
        .select()
        .single();

      if (error) throw error;
      
      // Update session balances
      const { error: updateError } = await supabase
        .from('session_balances')
        .update({
          cash: updatedBalances.cash,
          mvola: service === 'mvola' ? updatedBalances.mvola : balances.mvola,
          orange_money: service === 'orangeMoney' ? updatedBalances.orangeMoney : balances.orangeMoney,
          airtel_money: service === 'airtelMoney' ? updatedBalances.airtelMoney : balances.airtelMoney
        })
        .eq('is_active', true);

      if (updateError) throw updateError;
      
      const newTransaction: Transaction = {
        id: data.id,
        type: 'withdrawal',
        service,
        amount,
        fees,
        phoneNumber,
        date: new Date(data.date),
        status: 'completed',
      };
      
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
    setIsLoading(true);
    
    try {
      if (!sessionStarted) {
        throw new Error("Veuillez d'abord initialiser les soldes de départ de la session");
      }
      
      const fees = calculateFees('transfer', amount);
      
      const updatedBalances = { ...balances };

      if (amount > updatedBalances[service]) {
        throw new Error(`Solde ${service} insuffisant pour effectuer cette opération`);
      }

      updatedBalances.cash += amount;
      updatedBalances[service] -= amount;
      
      // Insert transaction in Supabase
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: mockUserId,
          type: 'transfer',
          service,
          amount,
          fees,
          recipient_name: recipient.name,
          recipient_phone: recipient.phone,
          description,
          date: new Date().toISOString(),
          status: 'completed'
        })
        .select()
        .single();

      if (error) throw error;
      
      // Update session balances
      const { error: updateError } = await supabase
        .from('session_balances')
        .update({
          cash: updatedBalances.cash,
          mvola: service === 'mvola' ? updatedBalances.mvola : balances.mvola,
          orange_money: service === 'orangeMoney' ? updatedBalances.orangeMoney : balances.orangeMoney,
          airtel_money: service === 'airtelMoney' ? updatedBalances.airtelMoney : balances.airtelMoney
        })
        .eq('is_active', true);

      if (updateError) throw updateError;
      
      const newTransaction: Transaction = {
        id: data.id,
        type: 'transfer',
        service,
        amount,
        fees,
        recipient,
        description,
        date: new Date(data.date),
        status: 'completed',
      };
      
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
