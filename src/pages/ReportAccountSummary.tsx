import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, FileText, Building2, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AccountService } from '@/services/accountService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function ReportAccountSummary() {
  const { gymId } = useAuth();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['account-summary-report', gymId, startDate, endDate],
    queryFn: () => AccountService.getAccountSummaryReport(gymId, startDate, endDate),
    enabled: !!gymId,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalOpening = data?.reduce((sum, acc) => sum + acc.openingBalance, 0) || 0;
  const totalCredit = data?.reduce((sum, acc) => sum + acc.totalCredit, 0) || 0;
  const totalDebit = data?.reduce((sum, acc) => sum + acc.totalDebit, 0) || 0;
  const totalClosing = data?.reduce((sum, acc) => sum + acc.closingBalance, 0) || 0;

  const handleExportCsv = async () => {
    toast.info('Export functionality will call backend API');
  };

  const handleExportPdf = async () => {
    toast.info('Export functionality will call backend API');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Account Summary Report</h1>
          <p className="text-muted-foreground">Overview of all accounts with balances</p>
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

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Opening</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalOpening)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalCredit)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Debits</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalDebit)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Closing</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalClosing)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              type="date"
              placeholder="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-40"
            />
            <Input
              type="date"
              placeholder="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-40"
            />
            <Button variant="ghost" onClick={() => { setStartDate(''); setEndDate(''); }}>
              Clear Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !data?.length ? (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No accounts found</h3>
              <p className="text-muted-foreground">Create accounts to see the summary.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Opening Balance</TableHead>
                    <TableHead className="text-right text-green-600">Total Credit</TableHead>
                    <TableHead className="text-right text-red-600">Total Debit</TableHead>
                    <TableHead className="text-right">Closing Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((account) => (
                    <TableRow key={account.accountId}>
                      <TableCell className="font-medium">{account.accountName}</TableCell>
                      <TableCell className="capitalize">{account.accountType}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(account.openingBalance)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-green-600">
                        {formatCurrency(account.totalCredit)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-red-600">
                        {formatCurrency(account.totalDebit)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        {formatCurrency(account.closingBalance)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Totals Row */}
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell colSpan={2}>Total</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(totalOpening)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-green-600">
                      {formatCurrency(totalCredit)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-red-600">
                      {formatCurrency(totalDebit)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(totalClosing)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
