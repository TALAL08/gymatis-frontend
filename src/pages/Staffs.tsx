import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { StaffService } from '@/services/StaffService';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Search, Phone, Edit, Trash2 } from 'lucide-react';
import { AddStaffDialog } from '@/components/staff/AddStaffDialog';
import { EditStaffDialog } from '@/components/staff/EditStaffDialog';
import { Staff } from '@/models/interfaces/Staff';

const Staffs = () => {
  const { gymId } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff>(null);


  const { data: staffMembers, isLoading, refetch } = useQuery({
    queryKey: ['staff', gymId],
    queryFn: async () => {
      if (!gymId) return [];
      return await StaffService.getStaffsByGym(Number(gymId));
    },
    enabled: !!gymId,
  });

  const filteredStaff = staffMembers?.filter(staff =>
    `${staff.firstName} ${staff.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.user.phoneNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
          ) : filteredStaff && filteredStaff.length > 0 ? (
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
                {filteredStaff.map((staff) => (
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
                      <Badge variant="secondary">Staff</Badge>
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
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No staff members found
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
