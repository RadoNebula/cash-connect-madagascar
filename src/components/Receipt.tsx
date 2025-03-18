
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  PrinterIcon, 
  CheckCircleIcon, 
  ClockIcon
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { ServiceIcon } from "@/components/ServiceIcon";
import { Transaction, MobileMoneyService } from "@/context/TransactionContext";
import { jsPDF } from "jspdf";
import { useAuth } from "@/context/AuthContext";

interface ReceiptProps {
  transaction: Transaction;
  open: boolean;
  onClose: () => void;
}

export const Receipt = ({ transaction, open, onClose }: ReceiptProps) => {
  const { user } = useAuth();
  const [isPrinting, setIsPrinting] = useState(false);

  if (!transaction) return null;

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString() + " Ar";
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getTransactionTitle = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Dépôt';
      case 'withdrawal':
        return 'Retrait';
      case 'transfer':
        return 'Transfert';
      default:
        return 'Transaction';
    }
  };

  const getServiceName = (service: MobileMoneyService) => {
    switch (service) {
      case 'mvola':
        return 'MVola';
      case 'orangeMoney':
        return 'Orange Money';
      case 'airtelMoney':
        return 'Airtel Money';
      default:
        return service;
    }
  };

  const printReceipt = async () => {
    try {
      setIsPrinting(true);
      
      // Create a new PDF document (58mm width = ~219 points)
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [58, 150] // 58mm width, variable height
      });
      
      let yPos = 5;
      
      // Add logo
      doc.addImage("/lovable-uploads/70cc2e53-7cec-4f0a-a459-b680625fb32c.png", "PNG", 14, yPos, 30, 15);
      yPos += 18;
      
      // Add header
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text("KIOSKA NAKÀ", 29, yPos, { align: 'center' });
      yPos += 5;
      
      // Company info (from settings)
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(user?.company?.name || "Cash Point", 29, yPos, { align: 'center' });
      yPos += 4;
      doc.text(user?.company?.address || "", 29, yPos, { align: 'center' });
      yPos += 4;
      doc.text(user?.company?.phone || "", 29, yPos, { align: 'center' });
      yPos += 4;
      
      // Add separator
      doc.setDrawColor(200);
      doc.line(5, yPos, 53, yPos);
      yPos += 5;
      
      // Transaction info
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`REÇU DE ${getTransactionTitle(transaction.type).toUpperCase()}`, 29, yPos, { align: 'center' });
      yPos += 5;
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Date: ${formatDate(transaction.date)}`, 5, yPos);
      yPos += 4;
      doc.text(`Référence: ${transaction.id.substring(0, 8)}`, 5, yPos);
      yPos += 4;
      doc.text(`Service: ${getServiceName(transaction.service)}`, 5, yPos);
      yPos += 4;
      
      if (transaction.phoneNumber) {
        doc.text(`Téléphone: ${transaction.phoneNumber}`, 5, yPos);
        yPos += 4;
      }
      
      if (transaction.recipient) {
        doc.text(`Destinataire: ${transaction.recipient.name}`, 5, yPos);
        yPos += 4;
        doc.text(`Tél. destinataire: ${transaction.recipient.phone}`, 5, yPos);
        yPos += 4;
      }
      
      if (transaction.description) {
        doc.text(`Description: ${transaction.description}`, 5, yPos);
        yPos += 4;
      }
      
      // Add another separator
      doc.setDrawColor(200);
      doc.line(5, yPos, 53, yPos);
      yPos += 5;
      
      // Amount details
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text("DÉTAILS", 29, yPos, { align: 'center' });
      yPos += 5;
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      
      // Transaction amount
      doc.text("Montant:", 5, yPos);
      doc.text(formatCurrency(transaction.amount), 53, yPos, { align: 'right' });
      yPos += 4;
      
      // Transaction fees if any
      if (transaction.fees > 0) {
        doc.text("Frais:", 5, yPos);
        doc.text(formatCurrency(transaction.fees), 53, yPos, { align: 'right' });
        yPos += 4;
        
        // Total
        doc.setFont('helvetica', 'bold');
        doc.text("Total:", 5, yPos);
        doc.text(formatCurrency(transaction.amount + transaction.fees), 53, yPos, { align: 'right' });
        yPos += 4;
      }
      
      // Final separator
      doc.setDrawColor(200);
      doc.line(5, yPos, 53, yPos);
      yPos += 5;
      
      // Thank you note
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text("Merci de votre confiance!", 29, yPos, { align: 'center' });
      yPos += 4;
      doc.text("Service opéré par " + (user?.name || ""), 29, yPos, { align: 'center' });
      
      // Save the PDF
      doc.save(`kioska-naka-receipt-${transaction.id.substring(0, 6)}.pdf`);
    } catch (error) {
      console.error("Error printing receipt:", error);
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Reçu de Transaction</DialogTitle>
        </DialogHeader>
        
        <div className="receipt-container p-4 border rounded-lg bg-background max-h-[70vh] overflow-y-auto">
          {/* Receipt header */}
          <div className="flex flex-col items-center mb-4">
            <Logo showImage={true} size="md" />
            <div className="text-center mt-2 text-sm text-muted-foreground">
              <p>{user?.company?.name || "Cash Point"}</p>
              <p>{user?.company?.address || ""}</p>
              <p>{user?.company?.phone || ""}</p>
            </div>
          </div>
          
          {/* Transaction details */}
          <div className="border-t border-b py-3 my-3">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircleIcon className="h-5 w-5 text-success" />
              <span className="font-semibold">{getTransactionTitle(transaction.type)} réussi</span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium flex items-center gap-1">
                  <ClockIcon className="h-3 w-3" />
                  {formatDate(transaction.date)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Référence:</span>
                <span className="font-medium">{transaction.id.substring(0, 8)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Service:</span>
                <span className="font-medium flex items-center gap-1">
                  <ServiceIcon service={transaction.service} size={16} />
                  {getServiceName(transaction.service)}
                </span>
              </div>
              
              {transaction.phoneNumber && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Téléphone:</span>
                  <span className="font-medium">{transaction.phoneNumber}</span>
                </div>
              )}
              
              {transaction.recipient && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Destinataire:</span>
                    <span className="font-medium">{transaction.recipient.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tél. destinataire:</span>
                    <span className="font-medium">{transaction.recipient.phone}</span>
                  </div>
                </>
              )}
              
              {transaction.description && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Description:</span>
                  <span className="font-medium">{transaction.description}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Amount details */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Montant:</span>
              <span className="font-medium">{formatCurrency(transaction.amount)}</span>
            </div>
            
            {transaction.fees > 0 && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Frais:</span>
                  <span className="font-medium">{formatCurrency(transaction.fees)}</span>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-semibold">Total:</span>
                  <span className="font-semibold">{formatCurrency(transaction.amount + transaction.fees)}</span>
                </div>
              </>
            )}
          </div>
          
          {/* Thank you note */}
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>Merci de votre confiance!</p>
            <p>Service opéré par {user?.name || ""}</p>
          </div>
        </div>
        
        <div className="flex justify-center mt-2">
          <Button onClick={printReceipt} disabled={isPrinting} className="bg-kioska-navy hover:bg-kioska-navy/90">
            <PrinterIcon className="mr-2 h-4 w-4" />
            {isPrinting ? "Impression..." : "Imprimer le reçu"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
