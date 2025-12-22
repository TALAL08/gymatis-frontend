import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { InvoiceService } from '@/services/invoiceService';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Search, Receipt, DollarSign, AlertCircle, MoreHorizontal, Eye, CreditCard } from 'lucide-react';
import { PaymentDialog } from '@/components/invoices/PaymentDialog';
import { ViewPaymentsDialog } from '@/components/invoices/ViewPaymentsDialog';
import { Invoice } from '@/models/interfaces/Invoice';
import { InvoiceStatus } from '@/models/enums/InvoiceStatus';
import { Card, CardContent } from '@/components/ui/card';
import { usePagination } from '@/hooks/use-pagination';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { useDebounce } from '@/hooks/use-debounce';

export default function Invoices() {
  const { gymId, isAdmin, isStaff } = useAuth();
  const [localSearch, setLocalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | keyof typeof InvoiceStatus>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isViewPaymentsOpen, setIsViewPaymentsOpen] = useState(false);

  const canManage = isAdmin || isStaff;

  const {
    pageNo,
    pageSize,
    searchText,
    setPageNo,
    setPageSize,
    setSearchText,
    pageSizeOptions,
  } = usePagination({ defaultPageSize: 10 });

  const debouncedSearch = useDebounce(localSearch, 400);

  useEffect(() => {
    if (debouncedSearch !== searchText) {
      setSearchText(debouncedSearch);
    }
  }, [debouncedSearch, searchText, setSearchText]);

  useEffect(() => {
    setLocalSearch(searchText);
  }, []);

  const { data: paginatedData, isLoading, refetch } = useQuery({
    queryKey: ['invoices', gymId, pageNo, pageSize, searchText, statusFilter],
    queryFn: async () => {
      if (!gymId) return { data: [], totalCount: 0, pageNo: 1, pageSize: 10, totalPages: 0 };
      return await InvoiceService.getInvoicesByGymPaginated(gymId, {
        pageNo,
        pageSize,
        searchText,
        status: statusFilter === 'all' ? '' : statusFilter,
      });
    },
    enabled: !!gymId,
  });

  const invoices = paginatedData?.data ?? [];
  const totalCount = paginatedData?.totalCount ?? 0;
  const totalPages = paginatedData?.totalPages ?? 0;

  const handleStatusFilterChange = (value: 'all' | keyof typeof InvoiceStatus) => {
    setStatusFilter(value);
    setPageNo(1);
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    const variants: Record<InvoiceStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      [InvoiceStatus.Paid]: 'default',
      [InvoiceStatus.PartiallyPaid]: 'default',      
      [InvoiceStatus.Unpaid]: 'secondary',
      [InvoiceStatus.Overdue]: 'destructive',
      [InvoiceStatus.Cancelled]: 'outline',
    };
    const label = InvoiceStatus[status];
    return <Badge variant={variants[status]}>{label.toUpperCase()}</Badge>;
  };

  const handlePayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsPaymentOpen(true);
  };

  const handleViewPayments = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsViewPaymentsOpen(true);
  };

  // Calculate stats from current page (for display purposes)
  const overdueInvoices = invoices?.filter(inv => inv.status === InvoiceStatus.Overdue).length || 0;
  const totalPending = invoices
    ?.filter(
      inv =>
        inv.status === InvoiceStatus.Unpaid || inv.status === InvoiceStatus.Overdue
    )
    .reduce((sum, inv) => sum + Number(inv.netAmount), 0) || 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-4xl font-bold">Invoices</h1>
          <p className="text-muted-foreground">Manage invoices and payments</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-in">
        <div className="bg-card border border-border rounded-lg p-6 flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Receipt className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Invoices</p>
            <p className="text-2xl font-bold text-foreground">{totalCount}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 flex items-center gap-3">
          <div className="p-3 bg-destructive/10 rounded-lg">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Overdue (this page)</p>
            <p className="text-2xl font-bold text-foreground">{overdueInvoices}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 flex items-center gap-3">
          <div className="p-3 bg-accent/10 rounded-lg">
            <DollarSign className="w-6 h-6 text-accent" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Pending (this page)</p>
            <p className="text-2xl font-bold text-foreground">{totalPending.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="animate-slide-in">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by invoice number, member name, or code..."
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value: any) => handleStatusFilterChange(value)}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="PartiallyPaid">Partially Paid</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden animate-slide-in">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading invoices...
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Created</TableHead>
                  {canManage && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="text-muted-foreground">
                        <Receipt className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No invoices found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices?.map(invoice => {
                    const subscription = invoice.subscription;

                    return (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                        <TableCell>
                          {invoice.member.firstName} {invoice.member.lastName}
                          <div className="text-xs text-muted-foreground">{invoice.member.memberCode}</div>
                        </TableCell>
                        <TableCell>{subscription?.package?.name || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="font-medium">{Number(invoice.netAmount).toFixed(2)}</div>
                          {Number(invoice.discount) > 0 && (
                            <div className="text-xs text-muted-foreground">
                              Discount: {Number(invoice.discount).toFixed(2)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell>
                          {invoice.dueDate ? format(new Date(invoice.dueDate), 'MMM dd, yyyy') : 'N/A'}
                        </TableCell>
                        <TableCell>{format(new Date(invoice.createdAt), 'MMM dd, yyyy')}</TableCell>
                        {canManage && (
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewPayments(invoice)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Payments
                                </DropdownMenuItem>
                                {(invoice.status === InvoiceStatus.Unpaid || 
                                  invoice.status === InvoiceStatus.Overdue ||
                                  invoice.status === InvoiceStatus.PartiallyPaid) && (
                                  <DropdownMenuItem onClick={() => handlePayment(invoice)}>
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Record Payment
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
            {invoices && invoices.length > 0 && (
              <div className="px-4">
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
              </div>
            )}
          </>
        )}
      </div>

      {selectedInvoice && (
        <>
          <PaymentDialog
            open={isPaymentOpen}
            onOpenChange={setIsPaymentOpen}
            invoice={selectedInvoice}
            onSuccess={() => {
              refetch();
              setIsPaymentOpen(false);
              setSelectedInvoice(null);
            }}
          />
          <ViewPaymentsDialog
            open={isViewPaymentsOpen}
            onOpenChange={setIsViewPaymentsOpen}
            invoice={selectedInvoice}
            onPaymentDeleted={() => refetch()}
          />
        </>
      )}
    </div>
  );
}
