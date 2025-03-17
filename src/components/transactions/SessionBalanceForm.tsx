
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ServiceIcon } from "@/components/ServiceIcon";
import { useTransactions } from "@/context/TransactionContext";
import { InfoIcon, CoinsIcon, ArrowRightIcon } from "lucide-react";

const SessionBalanceForm = () => {
  const { startSession, sessionStarted, isLoading } = useTransactions();
  const [cashBalance, setCashBalance] = useState("");
  const [mvolaBalance, setMvolaBalance] = useState("");
  const [orangeMoneyBalance, setOrangeMoneyBalance] = useState("");
  const [airtelMoneyBalance, setAirtelMoneyBalance] = useState("");
  const [error, setError] = useState("");

  const handleAmountChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setter(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cashValue = parseInt(cashBalance, 10) || 0;
    const mvolaValue = parseInt(mvolaBalance, 10) || 0;
    const orangeMoneyValue = parseInt(orangeMoneyBalance, 10) || 0;
    const airtelMoneyValue = parseInt(airtelMoneyBalance, 10) || 0;

    try {
      await startSession({
        cash: cashValue,
        mvola: mvolaValue,
        orangeMoney: orangeMoneyValue,
        airtelMoney: airtelMoneyValue
      });
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Une erreur est survenue lors de l'initialisation des soldes");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="rounded-md bg-primary/5 p-4 flex items-start gap-3">
          <CoinsIcon className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <Label htmlFor="cash-balance" className="font-medium">Solde en espèces</Label>
            <div className="relative mt-1.5">
              <Input
                id="cash-balance"
                type="text"
                placeholder="Entrez le montant"
                value={cashBalance ? parseInt(cashBalance).toLocaleString() : ""}
                onChange={handleAmountChange(setCashBalance)}
                className="pr-12"
                disabled={sessionStarted}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-muted-foreground">
                Ar
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-md border border-mvola/30 bg-mvola/5 p-4">
            <div className="mb-2">
              <ServiceIcon service="mvola" size={20} />
            </div>
            <div className="relative mt-1.5">
              <Input
                id="mvola-balance"
                type="text"
                placeholder="Solde MVola"
                value={mvolaBalance ? parseInt(mvolaBalance).toLocaleString() : ""}
                onChange={handleAmountChange(setMvolaBalance)}
                className="pr-12"
                disabled={sessionStarted}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-muted-foreground">
                Ar
              </div>
            </div>
          </div>

          <div className="rounded-md border border-orange-money/30 bg-orange-money/5 p-4">
            <div className="mb-2">
              <ServiceIcon service="orangeMoney" size={20} />
            </div>
            <div className="relative mt-1.5">
              <Input
                id="orange-money-balance"
                type="text"
                placeholder="Solde Orange Money"
                value={orangeMoneyBalance ? parseInt(orangeMoneyBalance).toLocaleString() : ""}
                onChange={handleAmountChange(setOrangeMoneyBalance)}
                className="pr-12"
                disabled={sessionStarted}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-muted-foreground">
                Ar
              </div>
            </div>
          </div>

          <div className="rounded-md border border-airtel-money/30 bg-airtel-money/5 p-4">
            <div className="mb-2">
              <ServiceIcon service="airtelMoney" size={20} />
            </div>
            <div className="relative mt-1.5">
              <Input
                id="airtel-money-balance"
                type="text"
                placeholder="Solde Airtel Money"
                value={airtelMoneyBalance ? parseInt(airtelMoneyBalance).toLocaleString() : ""}
                onChange={handleAmountChange(setAirtelMoneyBalance)}
                className="pr-12"
                disabled={sessionStarted}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-muted-foreground">
                Ar
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-md bg-muted p-3 flex items-start">
        <InfoIcon className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
        <div className="text-sm text-muted-foreground">
          <p>Ces informations serviront de point de départ pour suivre vos transactions.</p>
          <p>Une fois la session commencée, vous ne pourrez plus modifier ces valeurs.</p>
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading || sessionStarted}
        >
          {isLoading ? "Traitement..." : sessionStarted ? "Session déjà démarrée" : "Démarrer la session"}
          <ArrowRightIcon className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};

export default SessionBalanceForm;
