import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AccountService } from '@/services/accountService';
import { ReferenceType } from '@/models/interfaces/AccountTransaction';
import { usePagination } from '@/hooks/use-pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function AccountLedger() {
  const { id: accountId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { gymId } = useAuth();
  const { pageNo, pageSize, setPageNo, setPageSize, pageSizeOptions } = usePagination({ defaultPageSize: 25 });

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [referenceType, setReferenceType] = useState<string>('');

  const { data: account, isLoading: accountLoading } = useQuery({
    queryKey: ['account', accountId],
    queryFn: () => AccountService.getAccountById(accountId!),
    enabled: !!accountId,
  });

  const { data: ledgerData, isLoading: ledgerLoading } = useQuery({
    queryKey: ['account-ledger', accountId, pageNo, pageSize, startDate, endDate, referenceType],
    queryFn: () =>
      AccountService.getAccountLedger(
        {
          accountId: accountId!,
          startDate,
          endDate,
          referenceType: referenceType as ReferenceType | undefined,
        },
        { pageNo, pageSize, searchText: '' }
      ),
    enabled: !!accountId,
  });

  const handleExportCsv = async () => {
    try {
      const blob = await AccountService.exportLedgerCsv({
        accountId: accountId!,
        startDate,
        endDate,
        referenceType: referenceType as ReferenceType | undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ledger-${account?.accountName}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('CSV exported successfully');
    } catch (error) {
      toast.error('Failed to export CSV');
    }
  };

  const handleExportPdf = async () => {
    try {
      const blob = await AccountService.exportLedgerPdf({
        accountId: accountId!,
        startDate,
        endDate,
        referenceType: referenceType as ReferenceType | undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ledger-${account?.accountName}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('PDF exported successfully');
    } catch (error) {
      toast.error('Failed to export PDF');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setReferenceType('');
  };

  const getReferenceTypeBadge = (type: ReferenceType) => {
    switch (type) {
      case ReferenceType.Fee:
        return <Badge variant="default" className="bg-green-500">Fee</Badge>;
      case ReferenceType.Expense:
        return <Badge variant="destructive">Expense</Badge>;
      case ReferenceType.Adjustment:
        return <Badge variant="secondary">Adjustment</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const isLoading = accountLoading || ledgerLoading;

return (
  <div className="container mx-auto px-4 py-8 space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between animate-fade-in-up">
      <div>
        <h1 className="text-4xl font-bold mb-2">
          {accountLoading ? <Skeleton className="h-10 w-64" /> : `${account?.accountName} Ledger`}
        </h1>
        <p className="text-muted-foreground">
          {accountLoading ? <Skeleton className="h-4 w-48 mt-1" /> : `Current Balance: ${formatCurrency(account?.currentBalance || 0)}`}
        </p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleExportCsv}>
            <FileText className="mr-2 h-4 w-4" />
            Export CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportPdf}>
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    {/* Filters */}
    <Card className="animate-slide-in">
      <CardContent className="pt-6 flex flex-col md:flex-row gap-4 items-center">
        <Input type="date" className="w-40" value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="Start Date" />
        <Input type="date" className="w-40" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="End Date" />
        <Select value={referenceType} onValueChange={setReferenceType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="fee">Fee Payments</SelectItem>
            <SelectItem value="expense">Expenses</SelectItem>
            <SelectItem value="adjustment">Adjustments</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="ghost" onClick={clearFilters}>Clear Filters</Button>
      </CardContent>
    </Card>

    {/* Ledger Entries Grid */}
    <Card className="p-6 card-glow animate-slide-in">
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading transactions...</div>
      ) : ledgerData?.data?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ledgerData.data.map((txn) => (
            <Card key={txn.id} className="p-4 hover:shadow-lg transition-all duration-300 hover:border-primary/50 cursor-pointer">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{format(new Date(txn.transactionDate), 'MMM dd, yyyy')}</p>
                  {getReferenceTypeBadge(txn.referenceType)}
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Reference:</strong> {txn.referenceNo || '-'}</p>
                  <p><strong>Description:</strong> {txn.description || '-'}</p>
                  <p>
                    <strong>Debit:</strong> {txn.debit > 0 ? <span className="text-red-600">{formatCurrency(txn.debit)}</span> : '-'}
                  </p>
                  <p>
                    <strong>Credit:</strong> {txn.credit > 0 ? <span className="text-green-600">{formatCurrency(txn.credit)}</span> : '-'}
                  </p>
                  <p><strong>Balance:</strong> {formatCurrency(txn.balance)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
          <p className="text-muted-foreground">This account has no transactions yet.</p>
        </div>
      )}
    </Card>

    {/* Pagination */}
    {ledgerData?.data?.length ? (
      <DataTablePagination
        pageNo={pageNo}
        pageSize={pageSize}
        totalCount={ledgerData.totalCount}
        totalPages={ledgerData.totalPages}
        pageSizeOptions={pageSizeOptions}
        onPageChange={setPageNo}
        onPageSizeChange={setPageSize}
      />
    ) : null}
  </div>
);

}
