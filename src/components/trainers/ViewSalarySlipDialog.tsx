import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { downloadSalarySlipPdf } from "@/services/pdfService";
import { TrainerSalaryService } from "@/services/trainerSalaryService";
import { AccountService } from "@/services/accountService";
import { Account } from "@/models/interfaces/Account";
import { TrainerSalarySlip } from "@/models/interfaces/SalarySlip";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Download, CheckCircle, FileText, XCircle } from "lucide-react";
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
import { PaymentStatus } from "@/models/enums/PaymentStatus";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

interface ViewSalarySlipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salarySlip: TrainerSalarySlip;
}

export function ViewSalarySlipDialog({ open, onOpenChange, salarySlip }: ViewSalarySlipDialogProps) {
  const queryClient = useQueryClient();
  const { gymId } = useAuth();
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);
  const [isMarkingUnpaid, setIsMarkingUnpaid] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showUnpaidConfirmDialog, setShowUnpaidConfirmDialog] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  useEffect(() => {
    if (showConfirmDialog && gymId) {
      setLoadingAccounts(true);
      AccountService.getActiveAccounts(Number(gymId))
        .then((data) => {
          setAccounts(data);
          if (data.length > 0 && !selectedAccountId) {
            setSelectedAccountId(String(data[0].id));
          }
        })
        .catch(() => {
          toast.error("Failed to load accounts");
        })
        .finally(() => {
          setLoadingAccounts(false);
        });
    }
  }, [showConfirmDialog, gymId]);

  const handleMarkAsPaid = async () => {
    if (!selectedAccountId) {
      toast.error("Please select an account");
      return;
    }
    setIsMarkingPaid(true);
    try {
      await TrainerSalaryService.markAsPaid(salarySlip.id, selectedAccountId);
      toast.success("Salary marked as paid");
      queryClient.invalidateQueries({ queryKey: ["salaryslips"] });
      setShowConfirmDialog(false);
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to mark as paid");
    } finally {
      setIsMarkingPaid(false);
    }
  };

  const handleMarkAsUnpaid = async () => {
    setIsMarkingUnpaid(true);
    try {
      await TrainerSalaryService.markAsUnpaid(salarySlip.id);
      toast.success("Salary marked as unpaid");
      queryClient.invalidateQueries({ queryKey: ["salaryslips"] });
      setShowUnpaidConfirmDialog(false);
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to mark as unpaid");
    } finally {
      setIsMarkingUnpaid(false);
    }
  };

  const handleDownload = () => {
    setIsDownloading(true);
    try {
      downloadSalarySlipPdf({
        trainer: salarySlip.trainer,
        month: salarySlip.month,
        year: salarySlip.year,
        paymentStatus: salarySlip.paymentStatus === PaymentStatus.Paid ? 'Paid' : 'Unpaid',
        generatedAt: salarySlip.generatedAt,
        paidAt: salarySlip.paidAt,
        baseSalary: salarySlip.baseSalary,
        activeMemberCount: salarySlip.activeMemberCount,
        perMemberIncentive: salarySlip.perMemberIncentive,
        incentiveTotal: salarySlip.incentiveTotal,
        grossSalary: salarySlip.grossSalary,
      });
      toast.success("Salary slip downloaded");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  const isPaid = salarySlip.paymentStatus == PaymentStatus.Paid;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Salary Slip Details
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Header Info */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">
                  {salarySlip.trainer?.firstName} {salarySlip.trainer?.lastName}
                </h3>
                <p className="text-muted-foreground">
                  {MONTHS[salarySlip.month - 1]} {salarySlip.year}
                </p>
              </div>
              <Badge
                className={isPaid 
                  ? "bg-success/10 text-success border-success/20" 
                  : "bg-warning/10 text-warning border-warning/20"
                }
              >
                {isPaid ? "Paid" : "Unpaid"}
              </Badge>
            </div>

            <Separator />

            {/* Salary Breakdown */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Base Salary</p>
                  <p className="text-xl font-semibold">{salarySlip.baseSalary.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Active Members</p>
                  <p className="text-xl font-semibold">{salarySlip.activeMemberCount}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Per Member Incentive</p>
                  <p className="text-xl font-semibold">{salarySlip.perMemberIncentive.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Incentive Total</p>
                  <p className="text-xl font-semibold text-primary">{salarySlip.incentiveTotal.toLocaleString()}</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm text-muted-foreground">Gross Salary</p>
                <p className="text-2xl font-bold text-primary">{salarySlip.grossSalary.toLocaleString()}</p>
              </div>
            </div>

            <Separator />

            {/* Meta Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Generated On</p>
                <p className="font-medium">{format(new Date(salarySlip.generatedAt), "PPP")}</p>
              </div>
              {isPaid && salarySlip.paidAt && (
                <div>
                  <p className="text-muted-foreground">Paid On</p>
                  <p className="font-medium">{format(new Date(salarySlip.paidAt), "PPP")}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={handleDownload} disabled={isDownloading}>
                {isDownloading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Download PDF
              </Button>
              {!isPaid && (
                <Button className="flex-1" onClick={() => setShowConfirmDialog(true)}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark as Paid
                </Button>
              )}
              {isPaid && (
                <Button 
                  variant="outline" 
                  className="flex-1 text-destructive hover:text-destructive" 
                  onClick={() => setShowUnpaidConfirmDialog(true)}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Mark as Unpaid
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this salary slip as paid? This action cannot be undone and the slip will become read-only.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <Label htmlFor="account">Select Account</Label>
            <Select
              value={selectedAccountId}
              onValueChange={setSelectedAccountId}
              disabled={loadingAccounts}
            >
              <SelectTrigger id="account" className="mt-2">
                <SelectValue placeholder={loadingAccounts ? "Loading accounts..." : "Select an account"} />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={String(account.id)}>
                    {account.accountName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleMarkAsPaid} 
              disabled={isMarkingPaid || !selectedAccountId}
            >
              {isMarkingPaid && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showUnpaidConfirmDialog} onOpenChange={setShowUnpaidConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as Unpaid</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this salary slip as unpaid? This will reverse the payment status.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleMarkAsUnpaid} 
              disabled={isMarkingUnpaid}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isMarkingUnpaid && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Mark as Unpaid
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
