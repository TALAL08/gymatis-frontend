import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { TrainerSalaryService } from "@/services/trainerSalaryService";
import { TrainerSalarySlip } from "@/models/interfaces/SalarySlip";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, Download, CheckCircle, FileText } from "lucide-react";
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
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleMarkAsPaid = async () => {
    setIsMarkingPaid(true);
    try {
      await TrainerSalaryService.markAsPaid(salarySlip.id);
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

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const blob = await TrainerSalaryService.downloadSalarySlipPdf(salarySlip.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `salary-slip-${salarySlip.trainer?.firstName}-${salarySlip.trainer?.lastName}-${MONTHS[salarySlip.month - 1]}-${salarySlip.year}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Salary slip downloaded");
    } catch (error: any) {
      toast.error(error.message || "Failed to download salary slip");
    } finally {
      setIsDownloading(false);
    }
  };

  const isPaid = salarySlip.paymentStatus === "paid";

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
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkAsPaid} disabled={isMarkingPaid}>
              {isMarkingPaid && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
