
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ServiceIcon } from "@/components/ServiceIcon";
import { useTransactions, MobileMoneyService } from "@/context/TransactionContext";
import { InfoIcon, ArrowRightIcon, SmartphoneIcon, UserIcon, FileTextIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Receipt } from "@/components/Receipt";

const TransferForm = () => {
  const navigate = useNavigate();
  const { transferMoney, isLoading } = useTransactions();
  const { user } = useAuth();
  const [service, setService] = useState<MobileMoneyService>("mvola");
  const [amount, setAmount] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [description, setDescription] = useState("");
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

    if (!service) {
      setError("Veuillez sélectionner un service");
      return;
    }

    if (!recipientName) {
      setError("Veuillez entrer le nom du bénéficiaire");
      return;
    }

    if (!recipientPhone) {
      setError("Veuillez entrer le numéro de téléphone du bénéficiaire");
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

    try {
      const transaction = await transferMoney(
        service, 
        amountValue, 
        { name: recipientName, phone: recipientPhone },
        description
      );
      
      if (transaction) {
        setCompletedTransaction(transaction);
        setShowReceipt(true);
      }
    } catch (error) {
      console.error("Erreur lors du transfert:", error);
      setError("Une erreur s'est produite lors du traitement du transfert");
    }
  };

  const presetAmounts = [10000, 20000, 50000, 100000];
  
  const handleCloseReceipt = () => {
    setShowReceipt(false);
    // Redirigez l'utilisateur ou réinitialisez le formulaire si souhaité
    // navigate("/");
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
              htmlFor="mvola-transfer"
              className={`flex cursor-pointer items-center rounded-md border p-4 ${
                service === "mvola" ? "border-mvola bg-mvola/10" : "border-border"
              }`}
            >
              <RadioGroupItem value="mvola" id="mvola-transfer" className="sr-only" />
              <ServiceIcon service="mvola" />
            </Label>

            <Label
              htmlFor="orangeMoney-transfer"
              className={`flex cursor-pointer items-center rounded-md border p-4 ${
                service === "orangeMoney"
                  ? "border-orange-money bg-orange-money/10"
                  : "border-border"
              }`}
            >
              <RadioGroupItem
                value="orangeMoney"
                id="orangeMoney-transfer"
                className="sr-only"
              />
              <ServiceIcon service="orangeMoney" />
            </Label>

            <Label
              htmlFor="airtelMoney-transfer"
              className={`flex cursor-pointer items-center rounded-md border p-4 ${
                service === "airtelMoney"
                  ? "border-airtel-money bg-airtel-money/10"
                  : "border-border"
              }`}
            >
              <RadioGroupItem
                value="airtelMoney"
                id="airtelMoney-transfer"
                className="sr-only"
              />
              <ServiceIcon service="airtelMoney" />
            </Label>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="recipient-name">Nom du bénéficiaire</Label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="recipient-name"
              type="text"
              placeholder="Ex: Jean Rakoto"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="recipient-phone">Numéro de téléphone du bénéficiaire</Label>
          <div className="relative">
            <SmartphoneIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="recipient-phone"
              type="text"
              placeholder="Ex: 034 00 000 00"
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount-transfer">Montant du transfert</Label>
          <div className="relative">
            <Input
              id="amount-transfer"
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

        <div className="space-y-2">
          <Label htmlFor="description">Description (optionnel)</Label>
          <div className="relative">
            <FileTextIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="description"
              type="text"
              placeholder="Ex: Paiement loyer"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="rounded-md bg-muted p-3 flex items-start">
          <InfoIcon className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p>Des frais s'appliquent pour les transferts.</p>
            <p>Montant minimum: 1 000 Ar</p>
            <p>Pour un transfert, votre solde en espèces augmente et votre solde mobile money diminue.</p>
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <Button 
            type="submit" 
            className="w-full bg-kioska-navy hover:bg-kioska-navy/90" 
            disabled={isLoading}
          >
            {isLoading ? "Traitement..." : "Effectuer le transfert"}
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

export default TransferForm;
