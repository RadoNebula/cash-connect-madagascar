
import { MoveDownIcon, MoveUpIcon, MoveHorizontalIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { MobileMoneyService, TransactionType } from "@/context/TransactionContext";

interface ServiceIconProps {
  service: MobileMoneyService;
  className?: string;
  size?: number;
}

interface TransactionIconProps {
  type: TransactionType;
  className?: string;
  size?: number;
}

export const ServiceIcon = ({ service, className, size = 24 }: ServiceIconProps) => {
  const getServiceColor = (service: MobileMoneyService) => {
    switch (service) {
      case 'mvola': return 'text-mvola';
      case 'orangeMoney': return 'text-orange-money';
      case 'airtelMoney': return 'text-airtel-money';
      default: return 'text-primary';
    }
  };

  const getServiceName = (service: MobileMoneyService) => {
    switch (service) {
      case 'mvola': return 'MVola';
      case 'orangeMoney': return 'Orange Money';
      case 'airtelMoney': return 'Airtel Money';
      default: return '';
    }
  };

  return (
    <div className={cn("flex items-center gap-2", getServiceColor(service), className)}>
      <div className={cn("rounded-full p-2", 
        service === 'mvola' ? 'bg-mvola/10' : 
        service === 'orangeMoney' ? 'bg-orange-money/10' : 
        'bg-airtel-money/10'
      )}>
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className={cn(
            service === 'mvola' ? 'text-mvola' : 
            service === 'orangeMoney' ? 'text-orange-money' : 
            'text-airtel-money'
          )}
        >
          <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="2" />
          <path d="M8 10H16M8 14H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <span className="font-medium">{getServiceName(service)}</span>
    </div>
  );
};

export const TransactionIcon = ({ type, className, size = 20 }: TransactionIconProps) => {
  const getTypeColor = (type: TransactionType) => {
    switch (type) {
      case 'deposit': return 'text-success bg-success/10';
      case 'withdrawal': return 'text-warning bg-warning/10';
      case 'transfer': return 'text-info bg-info/10';
      default: return 'text-primary bg-primary/10';
    }
  };

  return (
    <div className={cn("rounded-full p-2", getTypeColor(type), className)}>
      {type === 'deposit' && <MoveDownIcon size={size} />}
      {type === 'withdrawal' && <MoveUpIcon size={size} />}
      {type === 'transfer' && <MoveHorizontalIcon size={size} />}
    </div>
  );
};
