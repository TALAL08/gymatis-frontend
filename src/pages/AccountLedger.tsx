import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Download, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AccountService } from '@/services/accountService';
import { ReferenceType } from '@/models/interfaces/AccountTransaction';
import { usePagination } from '@/hooks/use-pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
  const { id: paramAccountId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { gymId } = useAuth();
  const { pageNo, pageSize, setPageNo, setPageSize, pageSizeOptions } = usePagination({ defaultPageSize: 25 });

  // Filters
  const [selectedAccountId, setSelectedAccountId] = useState<string>(paramAccountId || 'all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [referenceType, setReferenceType] = useState<string>('');

  // Update selectedAccountId when URL param changes
  useEffect(() => {
    if (paramAccountId) {
      setSelectedAccountId(paramAccountId);
    }
  }, [paramAccountId]);

  // Fetch all accounts for the dropdown
  const { data: accountsList, isLoading: accountsLoading } = useQuery({
    queryKey: ['accounts', gymId],
    queryFn: () => AccountService.getAccountsByGym(String(gymId)),
    enabled: !!gymId,
  });

  const currentAccountId = selectedAccountId !== 'all' ? selectedAccountId : undefined;

  const { data: account, isLoading: accountLoading } = useQuery({
    queryKey: ['account', currentAccountId],
    queryFn: () => AccountService.getAccountById(currentAccountId!),
    enabled: !!currentAccountId,
  });

  const { data: ledgerData, isLoading: ledgerLoading } = useQuery({
    queryKey: ['account-ledger', currentAccountId, pageNo, pageSize, startDate, endDate, referenceType],
    queryFn: () =>
      AccountService.getAccountLedger(
        {
          accountId: currentAccountId!,
          startDate,
          endDate,
          referenceType: referenceType as ReferenceType | undefined,
        },
        { pageNo, pageSize, searchText: '' }
      ),
    enabled: !!currentAccountId,
  });

  const handleExportCsv = async () => {
    if (!currentAccountId) {
      toast.error('Please select an account to export');
      return;
    }
    try {
      const blob = await AccountService.exportLedgerCsv({
        accountId: currentAccountId,
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
    if (!currentAccountId) {
      toast.error('Please select an account to export');
      return;
    }
    try {
      const blob = await AccountService.exportLedgerPdf({
        accountId: currentAccountId,
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
    setSelectedAccountId('all');
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

  const isLoading = accountsLoading || (currentAccountId ? (accountLoading || ledgerLoading) : false);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-4xl font-bold mb-2">Account Ledger</h1>
          <p className="text-muted-foreground">
            {currentAccountId && account ? (
              `${account.accountName} - Balance: ${formatCurrency(account.currentBalance || 0)}`
            ) : (
              'Select an account to view transactions'
            )}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" disabled={!currentAccountId}>
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
          <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Select Account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              {accountsList?.map((acc) => (
                <SelectItem key={acc.id} value={acc.id}>
                  {acc.accountName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        {selectedAccountId === 'all' ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Select an Account</h3>
            <p className="text-muted-foreground">Choose an account from the dropdown to view its ledger transactions.</p>
          </div>
        ) : isLoading ? (
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
