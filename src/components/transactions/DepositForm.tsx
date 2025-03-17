
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ServiceIcon } from "@/components/ServiceIcon";
import { useTransactions, MobileMoneyService } from "@/context/TransactionContext";
import { InfoIcon, ArrowRightIcon, SmartphoneIcon } from "lucide-react";

const DepositForm = () => {
  const navigate = useNavigate();
  const { depositMoney, isLoading } = useTransactions();
  const [service, setService] = useState<MobileMoneyService>("mvola");
  const [amount, setAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");

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

    if (!phoneNumber) {
      setError("Veuillez entrer le numéro de téléphone du client");
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

    const success = await depositMoney(service, amountValue, phoneNumber);
    if (success) {
      navigate("/");
    }
  };

  const presetAmounts = [10000, 20000, 50000, 100000];

  return (
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
            htmlFor="mvola"
            className={`flex cursor-pointer items-center rounded-md border p-4 ${
              service === "mvola" ? "border-mvola bg-mvola/10" : "border-border"
            }`}
          >
            <RadioGroupItem value="mvola" id="mvola" className="sr-only" />
            <ServiceIcon service="mvola" />
          </Label>

          <Label
            htmlFor="orangeMoney"
            className={`flex cursor-pointer items-center rounded-md border p-4 ${
              service === "orangeMoney"
                ? "border-orange-money bg-orange-money/10"
                : "border-border"
            }`}
          >
            <RadioGroupItem
              value="orangeMoney"
              id="orangeMoney"
              className="sr-only"
            />
            <ServiceIcon service="orangeMoney" />
          </Label>

          <Label
            htmlFor="airtelMoney"
            className={`flex cursor-pointer items-center rounded-md border p-4 ${
              service === "airtelMoney"
                ? "border-airtel-money bg-airtel-money/10"
                : "border-border"
            }`}
          >
            <RadioGroupItem
              value="airtelMoney"
              id="airtelMoney"
              className="sr-only"
            />
            <ServiceIcon service="airtelMoney" />
          </Label>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone-number">Numéro de téléphone du client</Label>
        <div className="relative">
          <SmartphoneIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="phone-number"
            type="text"
            placeholder="Ex: 034 00 000 00"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Montant du dépôt</Label>
        <div className="relative">
          <Input
            id="amount"
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

      <div className="rounded-md bg-muted p-3 flex items-start">
        <InfoIcon className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
        <div className="text-sm text-muted-foreground">
          <p>Les dépôts sont gratuits pour le client.</p>
          <p>Montant minimum: 1 000 Ar</p>
          <p>Pour un dépôt, votre solde en espèces augmente et votre solde mobile money diminue.</p>
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Traitement..." : "Effectuer le dépôt"}
          <ArrowRightIcon className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};

export default DepositForm;
