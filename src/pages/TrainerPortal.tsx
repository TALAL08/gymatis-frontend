import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrainerService } from '@/services/trainerService';
import { AttendanceService } from '@/services/attendanceService';
import { TrainerSalaryService } from '@/services/trainerSalaryService';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Calendar, Award, DollarSign, Download, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { MemberService } from '@/services/memberService';
import { MemberStatus } from '@/models/enums/MemberStatus';
import { PaymentStatus } from '@/models/enums/PaymentStatus';
import { AttendanceLog } from '@/models/interfaces/AttendanceLog';
import { Member } from '@/models/interfaces/member';
import { TrainerSalarySlip } from '@/models/interfaces/SalarySlip';
import { downloadSalarySlipPdf } from '@/services/pdfService';
import { toast } from 'sonner';

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const TrainerPortal = () => {
  const { user } = useAuth();
  const [selectedSlip, setSelectedSlip] = useState<TrainerSalarySlip | null>(null);

  const { data: trainer } = useQuery({
    queryKey: ['trainer-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      return await TrainerService.getTrainerByUserId(user.id);
    },
    enabled: !!user,
  });

  const { data: members } = useQuery({
    queryKey: ['trainer-members', trainer?.id],
    queryFn: async () => {
      if (!trainer?.id) return [];
      const members = await MemberService.getMembersByTrainerId(trainer.id);
      return members
        ?.filter((member: Member) => member.status === MemberStatus.Active)
        .map((member: Member) => member) || [];
    },
    enabled: !!trainer?.id,
  });

  const { data: memberAttendance } = useQuery({
    queryKey: ['trainer-member-attendance', trainer?.id],
    queryFn: async () => {
      if (!trainer?.id) return [];
      
      const members = await MemberService.getMembersByTrainerId(trainer?.id);
      if (members.length === 0) return [];

      const allLogs: AttendanceLog[] = [];
      const logs = await AttendanceService.getTrainerMembersAttendnace(trainer.id);
      allLogs.push(...logs);

      // Sort by most recent and limit to 20
      return allLogs
        .sort((a, b) => new Date(b.checkInAt).getTime() - new Date(a.checkOutAt).getTime())
        .slice(0, 20);
    },
    enabled: !!trainer?.id,
  });

  const { data: salarySlips } = useQuery({
    queryKey: ['trainer-salary-slips', trainer?.id],
    queryFn: async () => {
      if (!trainer?.id) return [];
      return await TrainerSalaryService.getSalarySlipsByTrainerId(trainer.id);
    },
    enabled: !!trainer?.id,
  });

  const handleDownloadSlip = (slip: TrainerSalarySlip) => {
    downloadSalarySlipPdf({
      trainer: slip.trainer,
      month: slip.month,
      year: slip.year,
      paymentStatus: slip.paymentStatus === PaymentStatus.Paid ? 'Paid' : 'Unpaid',
      generatedAt: slip.generatedAt,
      paidAt: slip.paidAt,
      baseSalary: slip.baseSalary,
      activeMemberCount: slip.activeMemberCount,
      perMemberIncentive: slip.perMemberIncentive,
      incentiveTotal: slip.incentiveTotal,
      grossSalary: slip.grossSalary,
    });
    toast.success('Salary slip downloaded');
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Trainer Portal</h1>
            <p className="text-muted-foreground">
              Welcome back, {trainer?.firstName} {trainer?.lastName}!
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assigned Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{members?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Active subscriptions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Specialties</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{trainer?.specialties?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Areas of expertise</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Attendance</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{memberAttendance?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Member check-ins</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Salary Slips</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{salarySlips?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Total generated</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
            <CardDescription>Your trainer information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{trainer?.email || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{trainer?.phone || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Rate</p>
                <p className="font-medium">Rs. {trainer?.monthlyAddonPrice.toLocaleString() || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Per Session</p>
                <p className="font-medium">Rs. {trainer?.pricePerSession?.toLocaleString() || '-'}</p>
              </div>
            </div>
            {trainer?.specialties && trainer?.specialties.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Specialties</p>
                <div className="flex flex-wrap gap-2">
                  {trainer?.specialties.map((specialty, index) => (
                    <Badge key={index} variant="secondary">{specialty}</Badge>
                  ))}
                </div>
              </div>
            )}
            {trainer?.bio && (
              <div>
                <p className="text-sm text-muted-foreground">Bio</p>
                <p className="mt-1">{trainer?.bio}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Salary Slips Section */}
        <Card>
          <CardHeader>
            <CardTitle>My Salary Slips</CardTitle>
            <CardDescription>Your monthly salary slips and payment history</CardDescription>
          </CardHeader>
          <CardContent>
            {salarySlips && salarySlips.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month / Year</TableHead>
                    <TableHead className="text-right">Base Salary</TableHead>
                    <TableHead className="text-right">Members</TableHead>
                    <TableHead className="text-right">Incentive</TableHead>
                    <TableHead className="text-right">Gross Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salarySlips.map((slip: TrainerSalarySlip) => (
                    <TableRow key={slip.id}>
                      <TableCell className="font-medium">
                        {MONTHS[slip.month - 1]} {slip.year}
                      </TableCell>
                      <TableCell className="text-right">
                        Rs. {slip.baseSalary.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">{slip.activeMemberCount}</TableCell>
                      <TableCell className="text-right">
                        Rs. {slip.incentiveTotal.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        Rs. {slip.grossSalary.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={slip.paymentStatus === PaymentStatus.Paid
                            ? "bg-success/10 text-success border-success/20"
                            : "bg-warning/10 text-warning border-warning/20"
                          }
                        >
                          {slip.paymentStatus === PaymentStatus.Paid ? "Paid" : "Unpaid"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadSlip(slip)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <p>No salary slips available yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assigned Members</CardTitle>
            <CardDescription>Members currently training with you</CardDescription>
          </CardHeader>
          <CardContent>
            {members && members.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member: Member) => (
                    <TableRow key={member?.id}>
                      <TableCell className="font-medium">{member?.memberCode}</TableCell>
                      <TableCell>{member?.firstName} {member?.lastName}</TableCell>
                      <TableCell>{member?.user?.phoneNumber}</TableCell>
                      <TableCell>
                        <Badge variant={member?.status === MemberStatus.Active ? 'default' : 'secondary'}>
                          {MemberStatus[member?.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(member.joinedAt), 'MMM d, yyyy')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No assigned members</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Member Attendance</CardTitle>
            <CardDescription>Recent check-ins of your assigned members</CardDescription>
          </CardHeader>
          <CardContent>
            {memberAttendance && memberAttendance.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {memberAttendance.map((log: AttendanceLog) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">
                        {log.member.firstName} {log.member?.lastName}
                      </TableCell>
                      <TableCell>{format(new Date(log.checkInAt), 'MMM d, h:mm a')}</TableCell>
                      <TableCell>
                        {log.checkOutAt ? format(new Date(log.checkOutAt), 'h:mm a') : 'In progress'}
                      </TableCell>
                      <TableCell>
                        {log.checkOutAt
                          ? `${Math.round((new Date(log.checkOutAt).getTime() - new Date(log.checkInAt).getTime()) / 60000)} min`
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No attendance records</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrainerPortal;
