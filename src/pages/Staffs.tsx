import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { StaffService } from '@/services/StaffService';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Search, Phone, Users } from 'lucide-react';
import { AddStaffDialog } from '@/components/staff/AddStaffDialog';
import { EditStaffDialog } from '@/components/staff/EditStaffDialog';
import { Staff } from '@/models/interfaces/Staff';
import { usePagination } from '@/hooks/use-pagination';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { useDebounce } from '@/hooks/use-debounce';
import { UserRole } from '@/models/enums/Gender';

const Staffs = () => {
  const { gymId } = useAuth();
  const [localSearch, setLocalSearch] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

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
    queryKey: ['staff', gymId, pageNo, pageSize, searchText],
    queryFn: async () => {
      if (!gymId) return { data: [], totalCount: 0, pageNo: 1, pageSize: 10, totalPages: 0 };
      return await StaffService.getStaffsByGymPaginated(Number(gymId), {
        pageNo,
        pageSize,
        searchText,
      });
    },
    enabled: !!gymId,
  });

  const staffMembers = paginatedData?.data ?? [];
  const totalCount = paginatedData?.totalCount ?? 0;
  const totalPages = paginatedData?.totalPages ?? 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-4xl font-bold">Staff Management</h1>
          <p className="text-muted-foreground">Manage your gym staff accounts</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} variant="energetic">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Staff
        </Button>
      </div>

      <Card className="animate-slide-in">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search staff by name or phone..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="animate-slide-in">
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading staff...</div>
          ) : staffMembers && staffMembers.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>CNIC</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffMembers.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell className="font-medium">
                        {staff.firstName} {staff.lastName}
                      </TableCell>
                      <TableCell>
                        {staff.user.phoneNumber && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            {staff.user.phoneNumber}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{staff.cnic || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{UserRole[staff.user.userType]}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(staff.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingStaff(staff)}
                          >
                            Edit
                          </Button>
                        </div>
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
              <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No staff members found</h3>
              <p className="text-muted-foreground mb-4">
                {searchText ? 'Try adjusting your search' : 'Get started by adding your first staff member'}
              </p>
              {!searchText && (
                <Button variant="energetic" onClick={() => setShowAddDialog(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Your First Staff Member
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AddStaffDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={() => {
          refetch();
          setShowAddDialog(false);
        }}
      />

      {editingStaff && (
        <EditStaffDialog
          open={!!editingStaff}
          onOpenChange={(open) => !open && setEditingStaff(null)}
          onSuccess={() => {
            refetch();
            setEditingStaff(null);
          }}
          staff={editingStaff}
        />
      )}
    </div>
  );
};

export default Staffs;
