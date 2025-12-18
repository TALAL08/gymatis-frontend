import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Receipt, MoreHorizontal, Edit, Trash2, Download, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ExpenseService } from '@/services/expenseService';
import { AccountService } from '@/services/accountService';
import { Expense } from '@/models/interfaces/Expense';
import { usePagination } from '@/hooks/use-pagination';
import { useDebounce } from '@/hooks/use-debounce';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { AddExpenseDialog } from '@/components/expenses/AddExpenseDialog';
import { EditExpenseDialog } from '@/components/expenses/EditExpenseDialog';
import { DeleteExpenseDialog } from '@/components/expenses/DeleteExpenseDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function Expenses() {
  const { gymId } = useAuth();
  const { pageNo, pageSize, searchText, setPageNo, setPageSize, setSearchText, pageSizeOptions } = usePagination();
  const [localSearch, setLocalSearch] = useState(searchText);
  const debouncedSearch = useDebounce(localSearch, 300);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [accountId, setAccountId] = useState<string>('');


  useEffect(() => {
    setSearchText(debouncedSearch);
  }, [debouncedSearch, setSearchText]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['expenses', gymId, pageNo, pageSize, searchText, startDate, endDate, categoryId, accountId],
    queryFn: () =>
      ExpenseService.getExpensesByGymPaginated(gymId, {
        pageNo,
        pageSize,
        searchText,
        startDate,
        endDate,
        categoryId,
        accountId,
      }),
    enabled: !!gymId,
  });

  const { data: categories } = useQuery({
    queryKey: ['expense-categories', gymId],
    queryFn: () => ExpenseService.getActiveCategories(gymId),
    enabled: !!gymId,
  });

  const { data: accounts } = useQuery({
    queryKey: ['accounts-active', gymId],
    queryFn: () => AccountService.getActiveAccounts(gymId),
    enabled: !!gymId,
  });


  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setEditDialogOpen(true);
  };

  const handleDelete = (expense: Expense) => {
    setSelectedExpense(expense);
    setDeleteDialogOpen(true);
  };

  const handleExportCsv = async () => {
    try {
      const blob = await ExpenseService.exportExpenseReportCsv(gymId, startDate, endDate, categoryId, accountId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expenses-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('CSV exported successfully');
    } catch (error) {
      toast.error('Failed to export CSV');
    }
  };

  const handleExportPdf = async () => {
    try {
      const blob = await ExpenseService.exportExpenseReportPdf(gymId, startDate, endDate, categoryId, accountId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expenses-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
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
    setCategoryId('');
    setAccountId('');
    setLocalSearch('');
  };

return (
  <div className="container mx-auto px-4 py-8 space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between animate-fade-in-up">
      <div>
        <h1 className="text-4xl font-bold mb-2">Expenses</h1>
        <p className="text-muted-foreground">Track and manage your gym expenses</p>
      </div>
      <div className="flex gap-2">
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
        <Button variant="energetic" onClick={() => setAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>
    </div>

    {/* Filters */}
    <Card className="animate-slide-in">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search expenses..."
              className="pl-10"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </div>

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

          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map((cat) => (
                <SelectItem key={cat.id} value={String(cat.id)}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={accountId} onValueChange={setAccountId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Accounts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              {accounts?.map((acc) => (
                <SelectItem key={acc.id} value={String(acc.id)}>
                  {acc.accountName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="ghost" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>

    {/* Expenses Table */}
    <Card className="p-6 card-glow animate-slide-in">
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading expenses...
        </div>
      ) : data?.data && data.data.length > 0 ? (
        <>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Paid From</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{format(new Date(expense.expenseDate), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{expense.category?.name || '-'}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{expense.description || '-'}</TableCell>
                    <TableCell>{expense.account?.accountName || '-'}</TableCell>
                    <TableCell className="text-right font-mono text-destructive">
                      {formatCurrency(expense.amount)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(expense)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(expense)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <DataTablePagination
            pageNo={pageNo}
            pageSize={pageSize}
            totalCount={data.totalCount}
            totalPages={data.totalPages}
            pageSizeOptions={pageSizeOptions}
            onPageChange={setPageNo}
            onPageSizeChange={setPageSize}
            isLoading={isLoading}
          />
        </>
      ) : (
        <div className="text-center py-12">
          <Receipt className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No expenses found</h3>
          <p className="text-muted-foreground mb-4">
            {localSearch || categoryId !== 'all' || accountId !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first expense'}
          </p>
          {categoryId === 'all' && accountId === 'all' && !localSearch && (
            <Button variant="energetic" onClick={() => setAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Expense
            </Button>
          )}
        </div>
      )}
    </Card>

    {/* Dialogs */}
    <AddExpenseDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} onSuccess={() => refetch()} />

    {selectedExpense && (
      <>
        <EditExpenseDialog
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) setSelectedExpense(null);
          }}
          expense={selectedExpense}
          onSuccess={() => {
            refetch();
            setSelectedExpense(null);
          }}
        />
        <DeleteExpenseDialog
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            setDeleteDialogOpen(open);
            if (!open) setSelectedExpense(null);
          }}
          expense={selectedExpense}
          onSuccess={() => {
            refetch();
            setSelectedExpense(null);
          }}
        />
      </>
    )}
  </div>
);

}
