import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { InvoiceService } from "@/services/invoiceService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Printer, Search } from "lucide-react";
import { exportToPDF, exportToCSV, printTable } from "@/lib/export-utils";
import { format } from "date-fns";
import { Invoice } from "@/models/interfaces/Invoice";
import { InvoiceStatus } from "@/models/enums/InvoiceStatus";
import { PaymentMethod } from "@/models/enums/PaymentMethod";

const ReportPayments = () => {
  const { gymId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<Invoice[]>([]);
  const [filteredData, setFilteredData] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (gymId) {
      fetchPaymentData();
    }
  }, [gymId, startDate, endDate]);

  useEffect(() => {
    filterData();
  }, [paymentData, searchTerm, statusFilter]);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      const allInvoices = await InvoiceService.getInvoicesByGym(gymId!);
      
      // Filter by date range
      const filtered = allInvoices.filter(invoice => {
        const createdDate = new Date(invoice.createdAt);
        return createdDate >= new Date(startDate) && 
               createdDate <= new Date(endDate + 'T23:59:59');
      });
      console.log(filtered)
      setPaymentData(filtered);
      setFilteredData(filtered);
    } catch (error) {
      console.error("Error fetching payment data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let filtered = paymentData;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(record => record.status === InvoiceStatus[statusFilter]); 
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(record => {
        const fullName = `${record.member.firstName} ${record.member.lastName}`.toLowerCase();
        const memberCode = record.member.memberCode.toLowerCase();
        const invoiceNumber = record.invoiceNumber.toLowerCase();
        const search = searchTerm.toLowerCase();
        
        return fullName.includes(search) || memberCode.includes(search) || invoiceNumber.includes(search);
      });
    }

    setFilteredData(filtered);
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    const statusConfig: Record<string, { variant: "default" | "destructive" | "outline" | "secondary", className?: string }> = {
      Paid: { variant: "outline", className: "bg-success/10 text-success border-success" },
      PartiallyPaid: { variant: "outline", className: "bg-success/10 text-success border-success" },      
      Pending: { variant: "outline", className: "bg-warning/10 text-warning border-warning" },
      Overdue: { variant: "destructive" },
      Cancelled: { variant: "secondary" },
    };

    const config = statusConfig[InvoiceStatus[status]] || { variant: "default" };
    return (
      <Badge variant={config.variant} className={config.className}>
        {InvoiceStatus[status].toUpperCase()}
      </Badge>
    );
  };

  const getTotalStats = () => {
    const totalAmount = filteredData.reduce((sum, record) => sum + Number(record.netAmount), 0);
    const paidAmount = filteredData
      .filter(r => r.status === InvoiceStatus.Paid || r.status === InvoiceStatus.PartiallyPaid)
      .reduce((sum, record) => sum + Number(record.netAmount), 0);
    const pendingAmount = filteredData
      .filter(r => r.status === InvoiceStatus.Pending || r.status === InvoiceStatus.Overdue)
      .reduce((sum, record) => sum + Number(record.netAmount), 0);

    return { totalAmount, paidAmount, pendingAmount };
  };

  const stats = getTotalStats();

  const handleExportPDF = () => {
    const headers = ["Invoice #", "Member", "Amount", "Discount", "Net Amount", "Status", "Payment Method", "Date"];
    const data = filteredData.map(record => [
      record.invoiceNumber,
      `${record.member.firstName} ${record.member.lastName}`,
      `PKR ${Number(record.amount).toLocaleString()}`,
      `PKR ${Number(record.discount || 0).toLocaleString()}`,
      `PKR ${Number(record.netAmount).toLocaleString()}`,
      InvoiceStatus[record.status].toUpperCase(),
      PaymentMethod[record.paymentMethod].toUpperCase() || "N/A",
      format(new Date(record.createdAt), "MMM dd, yyyy"),
    ]);

    exportToPDF(
      "Payment Collection Report",
      headers,
      data,
      `payments-report-${startDate}-to-${endDate}`
    );
  };

  const handleExportCSV = () => {
    const headers = ["Invoice #", "Member Code", "Member Name", "Amount", "Discount", "Net Amount", "Status", "Payment Method", "Paid At", "Created At"];
    const data = filteredData.map(record => [
      record.invoiceNumber,
      record.member.memberCode,
      `${record.member.firstName} ${record.member.lastName}`,
      Number(record.amount),
      Number(record.discount || 0),
      Number(record.netAmount),
      record.status,
      PaymentMethod[record.paymentMethod] || "N/A",
      record.paidAt ? format(new Date(record.paidAt), "yyyy-MM-dd HH:mm:ss") : "N/A",
      format(new Date(record.createdAt), "yyyy-MM-dd HH:mm:ss"),
    ]);

    exportToCSV(headers, data, `payments-report-${startDate}-to-${endDate}`);
  };

  const handlePrint = () => {
    const headers = ["Invoice #", "Member", "Amount", "Discount", "Net Amount", "Status", "Payment Method", "Date"];
    const data = filteredData.map(record => [
      record.invoiceNumber,
      `${record.member.firstName} ${record.member.lastName}`,
      `PKR ${Number(record.amount).toLocaleString()}`,
      `PKR ${Number(record.discount || 0).toLocaleString()}`,
      `PKR ${Number(record.netAmount).toLocaleString()}`,
      InvoiceStatus[record.status].toUpperCase(),
      PaymentMethod[record.paymentMethod].toUpperCase() || "N/A",
      format(new Date(record.createdAt), "MMM dd, yyyy"),
    ]);

    printTable("Payment Collection Report", headers, data);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="text-4xl md:text-5xl font-bold mb-2">
          Payment <span className="text-primary">Collection Report</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Complete payment history and transaction details
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-in">
        <Card className="card-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              PKR {stats.totalAmount.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">
              PKR {stats.paidAmount.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">
              PKR {stats.pendingAmount.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="card-glow animate-slide-in">
        <CardHeader>
          <CardTitle>Filters & Export</CardTitle>
          <CardDescription>Filter data and export in your preferred format</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="all">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="PartiallyPaid">Partially Paid</option>                
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Invoice or member..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleExportPDF} variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button onClick={handleExportCSV} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button onClick={handlePrint} variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="card-glow animate-slide-in">
        <CardHeader>
          <CardTitle>Payment Records ({filteredData.length})</CardTitle>
          <CardDescription>
            Showing records from {format(new Date(startDate), "MMM dd, yyyy")} to {format(new Date(endDate), "MMM dd, yyyy")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Discount</TableHead>
                  <TableHead className="text-right">Net Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading payment data...
                    </TableCell>
                  </TableRow>
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No payment records found for the selected criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-mono">
                        {record.invoiceNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {record.member.firstName} {record.member.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {record.member.memberCode}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        PKR {Number(record.amount).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        PKR {Number(record.discount || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        PKR {Number(record.netAmount).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(record.status)}
                      </TableCell>
                      <TableCell>
                        {record.paymentMethod 
                          ? PaymentMethod[record.paymentMethod].toUpperCase()
                          : <span className="text-muted-foreground">N/A</span>
                        }
                      </TableCell>
                      <TableCell>
                        {format(new Date(record.createdAt), "MMM dd, yyyy")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportPayments;
