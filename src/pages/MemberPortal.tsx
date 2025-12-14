import { useQuery } from '@tanstack/react-query';
import { MemberService } from '@/services/memberService';
import { SubscriptionService } from '@/services/subscriptionService';
import { InvoiceService } from '@/services/invoiceService';
import { AttendanceService } from '@/services/attendanceService';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, CreditCard, Package, Receipt, User } from 'lucide-react';
import { format } from 'date-fns';
import { SubscriptionStatus } from '@/models/enums/SubscriptionStatus';
import { InvoiceStatus } from '@/models/enums/InvoiceStatus';
import { MemberStatus } from '@/models/enums/MemberStatus';

const MemberPortal = () => {
  const { user } = useAuth();

  const { data: member } = useQuery({
    queryKey: ['member-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      return await MemberService.getMemberByUserId(user.id);
    },
    enabled: !!user,
  });

  const { data: subscriptions } = useQuery({
    queryKey: ['member-subscriptions', member?.id],
    queryFn: async () => {
      if (!member?.id) return [];
      return await SubscriptionService.getSubscriptionsByMember(member.id);
    },
    enabled: !!member?.id,
  });

  const { data: invoices } = useQuery({
    queryKey: ['member-invoices', member?.id],
    queryFn: async () => {
      if (!member?.id) return [];
      return await InvoiceService.getInvoicesByMember(member.id);
    },
    enabled: !!member?.id,
  });

  const { data: attendance } = useQuery({
    queryKey: ['member-attendance', member?.id],
    queryFn: async () => {
      if (!member?.id) return [];
      const allAttendance = await AttendanceService.getAttendanceByMember(member.id);
      return allAttendance.slice(0, 10);
    },
    enabled: !!member?.id,
  });

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Member Portal</h1>
            <p className="text-muted-foreground">Welcome back, {member?.firstName}!</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Member Code</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{member?.memberCode}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge variant={member?.status == MemberStatus.Active? 'default' : 'secondary'}>
                {MemberStatus[member?.status]}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {subscriptions?.filter(s => s.status == SubscriptionStatus.Active).length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attendance?.length || 0}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Active Subscriptions</CardTitle>
            <CardDescription>Your current membership packages</CardDescription>
          </CardHeader>
          <CardContent>
            {subscriptions && subscriptions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Trainer</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">{sub.package.name}</TableCell>
                      <TableCell>{format(new Date(sub.startDate), 'MMM d, yyyy')}</TableCell>
                      <TableCell>{format(new Date(sub.endDate), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        {sub.trainer ? `${sub.trainer.firstName} ${sub.trainer.lastName}` : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={sub.status == SubscriptionStatus.Active ? 'default' : 'secondary'}>
                          {SubscriptionStatus[sub.status]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No subscriptions found</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Attendance</CardTitle>
            <CardDescription>Your last 10 gym visits</CardDescription>
          </CardHeader>
          <CardContent>
            {attendance && attendance.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{format(new Date(log.checkInAt), 'MMM d, yyyy h:mm a')}</TableCell>
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
              <div className="text-center py-8 text-muted-foreground">No attendance records found</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoices & Payments</CardTitle>
            <CardDescription>Your payment history</CardDescription>
          </CardHeader>
          <CardContent>
            {invoices && invoices.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Paid At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>Rs. {invoice.netAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            invoice.status == InvoiceStatus.Paid
                              ? 'default'
                              : invoice.status == InvoiceStatus.Overdue
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {InvoiceStatus[invoice.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {invoice.dueDate ? format(new Date(invoice.dueDate), 'MMM d, yyyy') : '-'}
                      </TableCell>
                      <TableCell>
                        {invoice.paidAt ? format(new Date(invoice.paidAt), 'MMM d, yyyy') : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No invoices found</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MemberPortal;
