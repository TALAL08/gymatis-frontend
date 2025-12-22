import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { TransactionService } from "@/services/transactionService";
import { Transaction } from "@/models/interfaces/Transaction";
import { Invoice } from "@/models/interfaces/Invoice";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Trash2, Receipt, CreditCard } from "lucide-react";
import { PaymentMethod } from "@/models/enums/PaymentMethod";

interface ViewPaymentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice;
  onPaymentDeleted?: () => void;
}

export function ViewPaymentsDialog({
  open,
  onOpenChange,
  invoice,
  onPaymentDeleted,
}: ViewPaymentsDialogProps) {
  const queryClient = useQueryClient();
  const [deleteTransaction, setDeleteTransaction] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: transactions, isLoading, refetch } = useQuery({
    queryKey: ["invoice-transactions", invoice.id],
    queryFn: async () => {
      return await TransactionService.getTransactionsByInvoice(invoice.id);
    },
    enabled: open,
  });

  const handleDeletePayment = async () => {
    if (!deleteTransaction) return;
    setIsDeleting(true);
    try {
      await TransactionService.deleteTransaction(deleteTransaction.id);
      toast.success("Payment deleted successfully");
      refetch();
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      onPaymentDeleted?.();
      setDeleteTransaction(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete payment");
    } finally {
      setIsDeleting(false);
    }
  };

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    const labels: Record<PaymentMethod, string> = {
      [PaymentMethod.Cash]: "Cash",
      [PaymentMethod.OnlineTransfer]: "Online Transfer",
      [PaymentMethod.Cheque]: "Cheque",
    };
    return labels[method] || method;
  };

  const totalPaid = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payments for Invoice #{invoice.invoiceNumber}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Summary */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm text-muted-foreground">Invoice Amount</p>
                <p className="text-xl font-semibold">{Number(invoice.netAmount).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-xl font-semibold text-primary">{totalPaid.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className="text-xl font-semibold">
                  {(Number(invoice.netAmount) - totalPaid).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Payments Table */}
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-muted-foreground">Loading payments...</p>
              </div>
            ) : transactions && transactions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {format(new Date(transaction.paidAt), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="font-medium">
                        {Number(transaction.amount).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {getPaymentMethodLabel(transaction.paymentMethod)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {transaction.referenceNumber || "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-[150px] truncate">
                        {transaction.notes || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteTransaction(transaction)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No payments recorded for this invoice</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTransaction} onOpenChange={() => setDeleteTransaction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this payment of{" "}
              <span className="font-semibold">
                {deleteTransaction && Number(deleteTransaction.amount).toFixed(2)}
              </span>
              ? This action cannot be undone and will update the invoice status accordingly.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePayment}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
