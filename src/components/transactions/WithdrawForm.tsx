import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ServiceIcon } from "@/components/ServiceIcon";
import { useTransactions, MobileMoneyService } from "@/context/TransactionContext";
import { useAuth } from "@/context/AuthContext";
import { InfoIcon, ArrowRightIcon, SmartphoneIcon } from "lucide-react";
import { Receipt } from "@/components/Receipt";

const WithdrawForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { withdrawMoney, isLoading, getServiceBalance, getCashBalance } = useTransactions();
  const [service, setService] = useState<MobileMoneyService>("mvola");
  const [amount, setAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState<any>(null);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setAmount(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!user) {
      setError("Vous devez être connecté pour effectuer cette opération");
      return;
    }

    if (!service) {
      setError("Veuillez sélectionner un service");
      return;
    }

    if (!phoneNumber) {
      setError("Veuillez entrer le numéro de téléphone du client qui a transféré l'argent");
      return;
    }

    const amountValue = parseInt(amount, 10);
    if (isNaN(amountValue) || amountValue <= 0) {
      setError("Veuillez entrer un montant valide");
      return;
    }

    if (amountValue < 1000) {
      setError("Le montant minimum est de 1 000 Ar");
      return;
    }

    const cashBalance = getCashBalance();
    if (amountValue > cashBalance) {
      setError(`Solde en espèces insuffisant. Votre solde est de ${cashBalance.toLocaleString()} Ar`);
      return;
    }

    const fees = Math.max(300, amountValue * 0.02);
    
    const transaction = await withdrawMoney(service, amountValue, phoneNumber);
    if (transaction) {
      setCompletedTransaction(transaction);
      setShowReceipt(true);
    }
  };

  const calculateFee = (amount: string): number => {
    const value = parseInt(amount, 10);
    if (isNaN(value) || value <= 0) return 0;
    return Math.max(300, value * 0.02);
  };

  const withdrawalFee = calculateFee(amount);
  const totalAmount = parseInt(amount, 10) + withdrawalFee;

  const presetAmounts = [10000, 20000, 50000, 100000];

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    navigate("/");
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Label>Choisir un service</Label>
          <RadioGroup
            value={service}
            onValueChange={(value) => setService(value as MobileMoneyService)}
            className="grid grid-cols-1 gap-4 md:grid-cols-3"
          >
            <Label
              htmlFor="mvola-withdraw"
              className={`flex cursor-pointer items-center rounded-md border p-4 ${
                service === "mvola" ? "border-mvola bg-mvola/10" : "border-border"
              }`}
            >
              <RadioGroupItem value="mvola" id="mvola-withdraw" className="sr-only" />
              <ServiceIcon service="mvola" />
            </Label>

            <Label
              htmlFor="orangeMoney-withdraw"
              className={`flex cursor-pointer items-center rounded-md border p-4 ${
                service === "orangeMoney"
                  ? "border-orange-money bg-orange-money/10"
                  : "border-border"
              }`}
            >
              <RadioGroupItem
                value="orangeMoney"
                id="orangeMoney-withdraw"
                className="sr-only"
              />
              <ServiceIcon service="orangeMoney" />
            </Label>

            <Label
              htmlFor="airtelMoney-withdraw"
              className={`flex cursor-pointer items-center rounded-md border p-4 ${
                service === "airtelMoney"
                  ? "border-airtel-money bg-airtel-money/10"
                  : "border-border"
              }`}
            >
              <RadioGroupItem
                value="airtelMoney"
                id="airtelMoney-withdraw"
                className="sr-only"
              />
              <ServiceIcon service="airtelMoney" />
            </Label>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone-number-withdraw">Numéro de téléphone du client</Label>
          <div className="relative">
            <SmartphoneIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone-number-withdraw"
              type="text"
              placeholder="Ex: 034 00 000 00"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount-withdraw">Montant du retrait</Label>
          <div className="relative">
            <Input
              id="amount-withdraw"
              type="text"
              placeholder="Entrez le montant"
              value={amount ? parseInt(amount).toLocaleString() : ""}
              onChange={handleAmountChange}
              className="pr-12"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-muted-foreground">
              Ar
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {presetAmounts.map((presetAmount) => (
              <Button
                key={presetAmount}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAmount(presetAmount.toString())}
                className="flex-1"
              >
                {presetAmount.toLocaleString()} Ar
              </Button>
            ))}
          </div>
        </div>

        {amount && !isNaN(parseInt(amount, 10)) && (
          <div className="rounded-md bg-muted p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Montant du retrait:</span>
              <span>{parseInt(amount).toLocaleString()} Ar</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Frais de retrait:</span>
              <span>{withdrawalFee.toLocaleString()} Ar</span>
            </div>
            <div className="flex justify-between font-medium border-t pt-2">
              <span>Total:</span>
              <span>{isNaN(totalAmount) ? "0" : totalAmount.toLocaleString()} Ar</span>
            </div>
          </div>
        )}

        <div className="rounded-md bg-muted p-3 flex items-start">
          <InfoIcon className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p>Les frais de retrait sont de 2% du montant (minimum 300 Ar).</p>
            <p>Montant minimum: 1 000 Ar</p>
            <p>Pour un retrait, votre solde en espèces diminue et votre solde mobile money augmente.</p>
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <Button 
            type="submit" 
            className="w-full bg-kioska-navy hover:bg-kioska-navy/90" 
            disabled={isLoading}
          >
            {isLoading ? "Traitement..." : "Effectuer le retrait"}
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>

      {completedTransaction && (
        <Receipt 
          transaction={completedTransaction} 
          open={showReceipt} 
          onClose={handleCloseReceipt} 
        />
      )}
    </>
  );
};

export default WithdrawForm;
