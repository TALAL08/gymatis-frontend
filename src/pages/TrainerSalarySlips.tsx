import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { TrainerService } from "@/services/trainerService";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { GenerateSalarySlipDialog } from "@/components/trainers/GenerateSalarySlipDialog";
import { ViewSalarySlipDialog } from "@/components/trainers/ViewSalarySlipDialog";
import { usePagination } from "@/hooks/use-pagination";
import { toast } from "sonner";
import { 
  Plus, 
  FileText, 
  Download, 
  Eye,
  DollarSign,
  Users,
  TrendingUp,
  Loader2
} from "lucide-react";
import { TrainerSalarySlip } from "@/models/interfaces/SalarySlip";
import { TrainerSalaryService } from "@/services/trainerSalaryService";
import { PaymentStatus } from "@/models/enums/PaymentStatus";

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

export default function TrainerSalarySlips() {
  const { gymId, isAdmin } = useAuth();
  const [selectedTrainerId, setSelectedTrainerId] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const [paymentStatus, setPaymentStatus] = useState<string>("all");
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState<TrainerSalarySlip | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const {
    pageNo,
    pageSize,
    setPageNo,
    setPageSize,
    pageSizeOptions,
  } = usePagination({ defaultPageSize: 10 });

  const { data: trainers } = useQuery({
    queryKey: ["trainers-all", gymId],
    queryFn: async () => {
      if (!gymId) return [];
      return await TrainerService.getTrainersByGym(gymId);
    },
    enabled: !!gymId,
  });

  const { data: paginatedData, isLoading, refetch } = useQuery({
    queryKey: ["salaryslips", gymId, pageNo, pageSize, selectedTrainerId, selectedMonth, selectedYear, paymentStatus],
    queryFn: async () => {
      if (!gymId) return { data: [], totalCount: 0, pageNo: 1, pageSize: 10, totalPages: 0 };
      return await TrainerSalaryService.getSalarySlipsByGymPaginated(gymId, {
        pageNo,
        pageSize,
        trainerId: selectedTrainerId !== "all" ? parseInt(selectedTrainerId) : undefined,
        month: selectedMonth !== "all" ? parseInt(selectedMonth) : undefined,
        year: parseInt(selectedYear),
        paymentStatus: paymentStatus !== "all" ? paymentStatus : undefined,
      });
    },
    enabled: !!gymId,
  });

  const { data: summary } = useQuery({
    queryKey: ["salaryslips-summary", gymId, selectedTrainerId, selectedMonth, selectedYear, paymentStatus],
    queryFn: async () => {
      if (!gymId) return null;
      return await TrainerSalaryService.getSalarySlipSummary(gymId, {
        trainerId: selectedTrainerId !== "all" ? parseInt(selectedTrainerId) : undefined,
        month: selectedMonth !== "all" ? parseInt(selectedMonth) : undefined,
        year: parseInt(selectedYear),
        paymentStatus: paymentStatus !== "all" ? paymentStatus : undefined,
      });
    },
    enabled: !!gymId,
  });

  const salarySlips = paginatedData?.data ?? [];
  const totalCount = paginatedData?.totalCount ?? 0;
  const totalPages = paginatedData?.totalPages ?? 0;

  const handleViewSlip = (slip: TrainerSalarySlip) => {
    setSelectedSlip(slip);
    setIsViewDialogOpen(true);
  };

  const handleExportCsv = async () => {
    if (!gymId) return;
    setIsExporting(true);
    try {
      const blob = await TrainerSalaryService.exportSalarySlipsCsv(gymId, {
        trainerId: selectedTrainerId !== "all" ? parseInt(selectedTrainerId) : undefined,
        month: selectedMonth !== "all" ? parseInt(selectedMonth) : undefined,
        year: parseInt(selectedYear),
        paymentStatus: paymentStatus !== "all" ? paymentStatus : undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `salaryslips-${selectedYear}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Export completed");
    } catch (error: any) {
      toast.error(error.message || "Failed to export");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdf = async () => {
    if (!gymId) return;
    setIsExporting(true);
    try {
      const blob = await TrainerSalaryService.exportSalarySlipsPdf(gymId, {
        trainerId: selectedTrainerId !== "all" ? parseInt(selectedTrainerId) : undefined,
        month: selectedMonth !== "all" ? parseInt(selectedMonth) : undefined,
        year: parseInt(selectedYear),
        paymentStatus: paymentStatus !== "all" ? paymentStatus : undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `salaryslips-${selectedYear}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Export completed");
    } catch (error: any) {
      toast.error(error.message || "Failed to export");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-4xl font-bold mb-2">Trainer Salary Slips</h1>
          <p className="text-muted-foreground">Generate and manage monthly salary slips for trainers</p>
        </div>
        {isAdmin && (
          <Button variant="energetic" onClick={() => setIsGenerateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Generate Salary Slip
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-slide-in">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Payout</p>
                  <p className="text-2xl font-bold">{summary.totalSalaryPayout.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-success/10">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Incentives</p>
                  <p className="text-2xl font-bold">{summary.totalIncentives.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-muted">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Base Salary</p>
                  <p className="text-2xl font-bold">{summary.totalBaseSalary.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-secondary/10">
                  <FileText className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Slips</p>
                  <p className="text-2xl font-bold">{summary.slipCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="animate-slide-in">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <Select value={selectedTrainerId} onValueChange={setSelectedTrainerId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Trainers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trainers</SelectItem>
                {trainers?.map((trainer) => (
                  <SelectItem key={trainer.id} value={trainer.id.toString()}>
                    {trainer.firstName} {trainer.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Months" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {MONTHS.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={paymentStatus} onValueChange={setPaymentStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>

            <div className="ml-auto flex gap-2">
              <Button variant="outline" onClick={handleExportCsv} disabled={isExporting}>
                {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                CSV
              </Button>
              <Button variant="outline" onClick={handleExportPdf} disabled={isExporting}>
                {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="p-6 animate-slide-in">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            Loading salary slips...
          </div>
        ) : salarySlips.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trainer</TableHead>
                  <TableHead>Month / Year</TableHead>
                  <TableHead className="text-right">Base Salary</TableHead>
                  <TableHead className="text-right">Members</TableHead>
                  <TableHead className="text-right">Incentive</TableHead>
                  <TableHead className="text-right">Gross Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salarySlips.map((slip) => (
                  <TableRow key={slip.id}>
                    <TableCell className="font-medium">
                      {slip.trainer?.firstName} {slip.trainer?.lastName}
                    </TableCell>
                    <TableCell>
                      {MONTHS.find(m => m.value === slip.month)?.label} {slip.year}
                    </TableCell>
                    <TableCell className="text-right">{slip.baseSalary.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{slip.activeMemberCount}</TableCell>
                    <TableCell className="text-right">{slip.incentiveTotal.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-semibold">{slip.grossSalary.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge
                        className={slip.paymentStatus == PaymentStatus.Paid 
                          ? "bg-success/10 text-success border-success/20" 
                          : "bg-warning/10 text-warning border-warning/20"
                        }
                      >
                        {slip.paymentStatus == PaymentStatus.Paid ? "Paid" : "Unpaid"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleViewSlip(slip)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <DataTablePagination
              pageNo={pageNo}
              pageSize={pageSize}
              totalCount={totalCount}
              totalPages={totalPages}
              pageSizeOptions={pageSizeOptions}
              onPageChange={setPageNo}
              onPageSizeChange={setPageSize}
              isLoading={isLoading}
            />
          </>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No salary slips found</h3>
            <p className="text-muted-foreground mb-4">
              {selectedTrainerId !== "all" || selectedMonth !== "all" || paymentStatus !== "all"
                ? "Try adjusting your filters"
                : "Get started by generating your first salary slip"}
            </p>
            {isAdmin && selectedTrainerId === "all" && selectedMonth === "all" && paymentStatus === "all" && (
              <Button variant="energetic" onClick={() => setIsGenerateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Generate Salary Slip
              </Button>
            )}
          </div>
        )}
      </Card>

      <GenerateSalarySlipDialog
        open={isGenerateDialogOpen}
        onOpenChange={(open) => {
          setIsGenerateDialogOpen(open);
          if (!open) refetch();
        }}
      />

      {selectedSlip && (
        <ViewSalarySlipDialog
          open={isViewDialogOpen}
          onOpenChange={(open) => {
            setIsViewDialogOpen(open);
            if (!open) refetch();
          }}
          salarySlip={selectedSlip}
        />
      )}
    </div>
  );
}
