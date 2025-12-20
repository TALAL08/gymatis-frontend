import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Building2, Wallet, MoreHorizontal, Edit, Power, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AccountService } from '@/services/accountService';
import { Account, AccountType } from '@/models/interfaces/Account';
import { usePagination } from '@/hooks/use-pagination';
import { useDebounce } from '@/hooks/use-debounce';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { AddAccountDialog } from '@/components/accounts/AddAccountDialog';
import { EditAccountDialog } from '@/components/accounts/EditAccountDialog';
import { DeactivateAccountDialog } from '@/components/accounts/DeactivateAccountDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

export default function Accounts() {
  const { gymId } = useAuth();
  const navigate = useNavigate();
  const { pageNo, pageSize, searchText, setPageNo, setPageSize, setSearchText, pageSizeOptions } = usePagination();
  const [localSearch, setLocalSearch] = useState(searchText);
  const debouncedSearch = useDebounce(localSearch, 300);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  useEffect(() => {
    setSearchText(debouncedSearch);
  }, [debouncedSearch, setSearchText]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['accounts', gymId, pageNo, pageSize, searchText],
    queryFn: () =>
      AccountService.getAccountsByGymPaginated(gymId, {
        pageNo,
        pageSize,
        searchText,
      }),
    enabled: !!gymId,
  });

  const handleEdit = (account: Account) => {
    setSelectedAccount(account);
    setEditDialogOpen(true);
  };

  const handleDeactivate = (account: Account) => {
    setSelectedAccount(account);
    setDeactivateDialogOpen(true);
  };

const handleViewLedger = (account: Account) => {
  navigate(`/account-ledger/${account.id}`);
};

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

return (
  <div className="container mx-auto px-4 py-8 space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between animate-fade-in-up">
      <div>
        <h1 className="text-4xl font-bold mb-2">Accounts</h1>
        <p className="text-muted-foreground">Manage your bank and cash accounts</p>
      </div>
      <Button variant="energetic" onClick={() => setAddDialogOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Account
      </Button>
    </div>

    {/* Search */}
    <Card className="animate-slide-in">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search accounts..."
              className="pl-10"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Accounts Grid */}
    <Card className="p-6 card-glow animate-slide-in">
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading accounts...
        </div>
      ) : data?.data && data.data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.data.map((account) => (
            <Card
              key={account.id}
              className="p-4 hover:shadow-lg transition-all duration-300 hover:border-primary/50 cursor-pointer"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {account.accountType === AccountType.Bank ? (
                      <Building2 className="h-4 w-4 text-blue-500" />
                    ) : (
                      <Wallet className="h-4 w-4 text-green-500" />
                    )}
                    <span className="font-medium">{account.accountName}</span>
                    {account.isDefault && (
                      <Badge variant="secondary" className="text-xs">
                        Default
                      </Badge>
                    )}
                  </div>
                  <Badge variant={account.isActive ? 'default' : 'secondary'}>
                    {account.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>
                    <strong>Type:</strong>{' '}
                    {account.accountType === AccountType.Bank ? 'Bank' : 'Cash'}
                  </p>
                  <p>
                    <strong>Bank:</strong> {account.bankName || '-'}
                  </p>
                  <p>
                    <strong>Opening Balance:</strong>{' '}
                    {formatCurrency(account.openingBalance)}
                  </p>
                  <p>
                    <strong>Current Balance:</strong>{' '}
                    <span
                      className={
                        account.currentBalance >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }
                    >
                      {formatCurrency(account.currentBalance)}
                    </span>
                  </p>
                </div>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewLedger(account)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Ledger
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEdit(account)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    {!account.isDefault && (
                      <DropdownMenuItem
                        onClick={() => handleDeactivate(account)}
                        className="text-destructive"
                      >
                        <Power className="mr-2 h-4 w-4" />
                        {account.isActive ? 'Deactivate' : 'Activate'}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Wallet className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No accounts found</h3>
          <p className="text-muted-foreground mb-4">
            {localSearch
              ? 'Try adjusting your search'
              : 'Get started by adding your first account'}
          </p>
          {!localSearch && (
            <Button variant="energetic" onClick={() => setAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Account
            </Button>
          )}
        </div>
      )}
    </Card>

    {/* Dialogs */}
    <AddAccountDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} onSuccess={() => refetch()} />

    {selectedAccount && (
      <>
        <EditAccountDialog
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) setSelectedAccount(null);
          }}
          account={selectedAccount}
          onSuccess={() => {
            refetch();
            setSelectedAccount(null);
          }}
        />
        <DeactivateAccountDialog
          open={deactivateDialogOpen}
          onOpenChange={(open) => {
            setDeactivateDialogOpen(open);
            if (!open) setSelectedAccount(null);
          }}
          account={selectedAccount}
          onSuccess={() => {
            refetch();
            setSelectedAccount(null);
          }}
        />
      </>
    )}
  </div>
);

}
