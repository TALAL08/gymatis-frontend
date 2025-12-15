import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SubscriptionService } from '@/services/subscriptionService';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, RefreshCw, CreditCard } from 'lucide-react';
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
import { AddSubscriptionDialog } from '@/components/subscriptions/AddSubscriptionDialog';
import { EditSubscriptionDialog } from '@/components/subscriptions/EditSubscriptionDialog';
import { RenewSubscriptionDialog } from '@/components/subscriptions/RenewSubscriptionDialog';
import { formatDistanceToNow, isPast } from 'date-fns';
import { Member } from '@/models/interfaces/member';
import { SubscriptionStatus } from '@/models/enums/SubscriptionStatus';
import { Subscription } from '@/models/interfaces/Subscription';
import { usePagination } from '@/hooks/use-pagination';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { useDebounce } from '@/hooks/use-debounce';

export default function Subscriptions() {
  const { gymId, isAdmin, isStaff } = useAuth();
  const canManage = isAdmin || isStaff;
  
  const [localSearch, setLocalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Expired' | 'Cancelled'>('all');
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRenewOpen, setIsRenewOpen] = useState(false);

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
    queryKey: ['subscriptions', gymId, pageNo, pageSize, searchText, statusFilter],
    queryFn: async () => {
      if (!gymId) return { data: [], totalCount: 0, pageNo: 1, pageSize: 10, totalPages: 0 };
      return await SubscriptionService.getSubscriptionsByGymPaginated(gymId, {
        pageNo,
        pageSize,
        searchText,
        status: statusFilter === 'all' ? '' : statusFilter,
      });
    },
    enabled: !!gymId,
  });

  const subscriptions = paginatedData?.data ?? [];
  const totalCount = paginatedData?.totalCount ?? 0;
  const totalPages = paginatedData?.totalPages ?? 0;

  const handleStatusFilterChange = (value: 'all' | 'Active' | 'Expired' | 'Cancelled') => {
    setStatusFilter(value);
    setPageNo(1);
  };

  const getStatusBadge = (status: SubscriptionStatus, endDate: string) => {
    switch (status) {
      case SubscriptionStatus.Active:
        return <Badge className="bg-green-500">Active</Badge>;
      case SubscriptionStatus.Expired:
        return <Badge variant="destructive">Expired</Badge>;
      case SubscriptionStatus.Cancelled:
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
    }).format(price);
  };

  const handleEdit = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setIsEditOpen(true);
  };

  const handleRenew = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setIsRenewOpen(true);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-4xl font-bold">Subscriptions</h1>
          <p className="text-muted-foreground">Manage member subscriptions</p>
        </div>
        {canManage && (
          <Button onClick={() => setIsAddOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Subscription
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="animate-slide-in">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by member name or code..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value: any) => handleStatusFilterChange(value)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card className="animate-slide-in">
        <CardHeader>
          <CardTitle>Subscriptions</CardTitle>
          <CardDescription>
            {totalCount} subscription(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading subscriptions...
            </div>
          ) : subscriptions && subscriptions.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Package</TableHead>
                      <TableHead>Trainer</TableHead>
                      <TableHead>Price Paid</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Status</TableHead>
                      {canManage && <TableHead className="text-right">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((sub) => {
                      const member = sub.member;
                      const pkg = sub.package;
                      const trainer = sub.trainer;
                      
                      return (
                        <TableRow key={sub.id}>
                          <TableCell className="font-medium">
                            {member.firstName} {member.lastName}
                            <div className="text-xs text-muted-foreground">
                              {member.memberCode}
                            </div>
                          </TableCell>
                          <TableCell>{pkg.name}</TableCell>
                          <TableCell>
                            {trainer ? (
                              <div>
                                {trainer.firstName} {trainer.lastName}
                                <div className="text-xs text-muted-foreground">
                                  +{formatPrice(sub.trainerAddonPrice || 0)}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatPrice(sub.pricePaid)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(sub.startDate).toLocaleDateString()} -{' '}
                              {new Date(sub.endDate).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {isPast(new Date(sub.endDate))
                                ? `Ended ${formatDistanceToNow(new Date(sub.endDate), { addSuffix: true })}`
                                : `Ends ${formatDistanceToNow(new Date(sub.endDate), { addSuffix: true })}`}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(sub.status, sub.endDate)}</TableCell>
                          {canManage && (
                            <TableCell className="text-right">
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(sub)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                {(sub.status === SubscriptionStatus.Active || sub.status === SubscriptionStatus.Expired) && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRenew(sub)}
                                  >
                                    <RefreshCw className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
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
            <div className="flex flex-col items-center justify-center py-12">
              <CreditCard className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No subscriptions found</p>
              {canManage && (
                <Button onClick={() => setIsAddOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create First Subscription
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddSubscriptionDialog open={isAddOpen} onOpenChange={setIsAddOpen} onSuccess={refetch} />
      {selectedSubscription && (
        <>
          <EditSubscriptionDialog
            open={isEditOpen}
            onOpenChange={setIsEditOpen}
            subscription={selectedSubscription}            
            onSuccess={refetch}
          />
          <RenewSubscriptionDialog
            open={isRenewOpen}
            onOpenChange={setIsRenewOpen}
            subscription={selectedSubscription}
            onSuccess={refetch}
          />
        </>
      )}
    </div>
  );
}
