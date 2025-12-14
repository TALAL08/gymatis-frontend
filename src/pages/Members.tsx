import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { MemberService } from '@/services/memberService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, UserCircle, Upload } from 'lucide-react';
import { AddMemberDialog } from '@/components/members/AddMemberDialog';
import { ImportMembersDialog } from '@/components/members/ImportMembersDialog';
import { Link } from 'react-router-dom';
import { MemberStatus } from '@/models/enums/MemberStatus';

const Members = () => {
  const { gymId } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Inactive' | 'Suspended'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const { data: members, isLoading } = useQuery({
    queryKey: ['members', gymId, searchQuery, statusFilter],
    queryFn: async () => {
      if (!gymId) return [];
      
      let allMembers = await MemberService.getMembersByGym(gymId);
      
      // Apply search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        allMembers = allMembers.filter(member =>
          member.firstName.toLowerCase().includes(searchLower) ||
          member.lastName.toLowerCase().includes(searchLower) ||
          member.memberCode.toLowerCase().includes(searchLower) ||
          member.user.phoneNumber.toLowerCase().includes(searchLower)
        );
      }

      // Apply status filter
      if (statusFilter !== 'all') {
        allMembers = allMembers.filter(member => member.status.toString() === statusFilter);

      }

      return allMembers;
    },
    enabled: !!gymId,
  });

  const getStatusColor = (status: MemberStatus) => {
    switch (status) {
      case MemberStatus.Active:
        return 'bg-success/10 text-success border-success/20';
      case MemberStatus.Inactive:
        return 'bg-muted text-muted-foreground border-border';
      case MemberStatus.Suspended:
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between animate-fade-in-up">
          <div>
            <h1 className="text-4xl font-bold mb-2">Members</h1>
            <p className="text-muted-foreground">Manage your gym members</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            <Button variant="energetic" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </div>
        </div>

        <Card className="animate-slide-in">
          <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, code, or phone..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'Active' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('Active')}
              >
                Active
              </Button>
              <Button
                variant={statusFilter === 'Inactive' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('Inactive')}
              >
                Inactive
              </Button>
              <Button
                variant={statusFilter === 'Suspended' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('Suspended')}
              >
                Suspended
              </Button>
            </div>
          </div>

          </CardContent>
        </Card>

        <Card className="p-6 card-glow animate-slide-in">

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading members...
            </div>
          ) : members && members.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member) => (
                <Link
                  key={member.id}
                  to={`/members/${member.id}`}
                  className="block"
                >
                  <Card className="p-4 hover:shadow-lg transition-all duration-300 hover:border-primary/50 cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {member.photoUrl ? (
                          <img
                            src={member.photoUrl}
                            alt={`${member.firstName} ${member.lastName}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UserCircle className="w-10 h-10 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-semibold truncate">
                              {member.firstName} {member.lastName}
                            </h3>
                            <p className="text-sm text-muted-foreground truncate">
                              {member.memberCode}
                            </p>
                          </div>
                          <Badge className={getStatusColor(member.status)}>
                            {MemberStatus[member.status]}
                          </Badge>
                        </div>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-muted-foreground truncate">
                            {member.user.phoneNumber}
                          </p>
                          {member.user.email && (
                            <p className="text-sm text-muted-foreground truncate">
                              {member.user.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <UserCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No members found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by adding your first member'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Button variant="energetic" onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Member
                </Button>
              )}
            </div>
          )}
        </Card>

      <AddMemberDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />

      <ImportMembersDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
      />
    </div>
  );
};

export default Members;
