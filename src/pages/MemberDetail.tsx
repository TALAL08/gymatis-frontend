import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MemberService } from '@/services/memberService';
import { SubscriptionService } from '@/services/subscriptionService';
import { AttendanceService } from '@/services/attendanceService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, UserCircle, Phone, Mail, MapPin, Calendar, Edit, Trash2, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { EditMemberDialog } from '@/components/members/EditMemberDialog';
import { DeleteMemberDialog } from '@/components/members/DeleteMemberDialog';
import { useAuth } from '@/contexts/AuthContext';
import { number } from 'zod';
import { SubscriptionStatus } from '@/models/enums/SubscriptionStatus';
import { MemberStatus } from '@/models/enums/MemberStatus';

const MemberDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: member, isLoading } = useQuery({
    queryKey: ['member', id],
    queryFn: async () => {
      if (!id) return null;

      const memberId: number = Number(id);
      return await MemberService.getMemberById(memberId);
    },
    enabled: !!id,
  });

  const { data: subscriptions } = useQuery({
    queryKey: ['member-subscriptions', id],
    queryFn: async () => {
      if (!id) return [];
      return await SubscriptionService.getSubscriptionsByMember(Number(id));
    },
    enabled: !!id,
  });

  const { data: attendance } = useQuery({
    queryKey: ['member-attendance', id],
    queryFn: async () => {
      if (!id) return [];
      const allAttendance = await AttendanceService.getAttendanceByMember(Number(id));
      return allAttendance.slice(0, 10);
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-muted-foreground">Loading member details...</div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Member not found</h2>
          <Button onClick={() => navigate('/members')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Members
          </Button>
        </div>
      </div>
    );
  }

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

  const activeSubscription = subscriptions?.find(sub => sub.status === SubscriptionStatus.Active);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between animate-fade-in-up">
          <Button variant="ghost" onClick={() => navigate('/members')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Members
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/members/${id}/card`)}>
              <CreditCard className="mr-2 h-4 w-4" />
              Member Card
            </Button>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            {/* {isAdmin && (
              <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )} */}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="card-glow animate-slide-in">
            <CardHeader className="text-center">
              <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center mb-4 overflow-hidden">
                {member.photoUrl ? (
                  <img
                    src={member.photoUrl}
                    alt={`${member.firstName} ${member.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserCircle className="w-20 h-20 text-white" />
                )}
              </div>
              <CardTitle className="text-2xl">
                {member.firstName} {member.lastName}
              </CardTitle>
              <Badge className={`mx-auto ${getStatusColor(member.status)}`}>
                {MemberStatus[member.status]}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-muted-foreground">Member Code:</span>
                  <span>{member.memberCode}</span>
                </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{member.user.phoneNumber}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{member.user.email}</span>
                  </div>

                {member.address && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>{member.address}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined {format(new Date(member.joinedAt), 'MMM dd, yyyy')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <Card className="card-glow">
              <CardHeader>
                <CardTitle>Current Subscription</CardTitle>
              </CardHeader>
              <CardContent>
                {activeSubscription ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Package:</span>
                      <span className="font-semibold">{activeSubscription.package.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Start Date:</span>
                      <span>{format(new Date(activeSubscription.startDate), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">End Date:</span>
                      <span>{format(new Date(activeSubscription.endDate), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Fee:</span>
                      <span className="font-semibold text-primary">{activeSubscription.pricePaid}</span>
                    </div>
                    {activeSubscription.trainer && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Trainer:</span>
                        <span>{activeSubscription.trainer.firstName} {activeSubscription.trainer.lastName}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No active subscription
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="card-glow">
              <CardHeader>
                <CardTitle>Recent Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                {attendance && attendance.length > 0 ? (
                  <div className="space-y-3">
                    {attendance.map((log) => (
                      <div key={log.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div>
                          <p className="font-medium">
                            {format(new Date(log.checkInAt), 'MMM dd, yyyy')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(log.checkInAt), 'hh:mm a')}
                            {log.checkOutAt && ` - ${format(new Date(log.checkOutAt), 'hh:mm a')}`}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {log.checkOutAt ? 'Completed' : 'In Progress'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No attendance records
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

      <EditMemberDialog
        member={member}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />

      <DeleteMemberDialog
        member={member}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </div>
  );
};

export default MemberDetail;
