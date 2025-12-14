import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MemberService } from "@/services/memberService";
import { SubscriptionService } from "@/services/subscriptionService";
import { InvoiceService } from "@/services/invoiceService";
import { TrainerService } from "@/services/trainerService";
import { AttendanceService } from "@/services/attendanceService";
import { TransactionService } from "@/services/transactionService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity,
  UserCheck,
  Receipt,
  Dumbbell,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { InvoiceStatus } from "@/models/enums/InvoiceStatus";
import { MemberStatus } from "@/models/enums/MemberStatus";

const COLORS = ['hsl(16 100% 60%)', 'hsl(142 76% 45%)', 'hsl(45 93% 47%)', 'hsl(0 84% 60%)'];

const Reports = () => {
  const { gymId } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalMembers: 0,
    activeMembers: 0,
    pendingInvoices: 0,
    totalAttendance: 0,
    activeTrainers: 0,
  });
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [memberStatusData, setMemberStatusData] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);

  useEffect(() => {
    if (gymId) {
      fetchReportsData();
    }
  }, [gymId]);

  const fetchReportsData = async () => {
    try {
      setLoading(true);

      // Fetch revenue stats
      const invoices = await InvoiceService.getInvoicesByGym(gymId!);

      const totalRevenue = invoices
        ?.filter(inv => inv.status ===InvoiceStatus.Paid || inv.status ===InvoiceStatus.PartiallyPaid)
        .reduce((sum, inv) => sum + Number(inv.netAmount || 0), 0) || 0;

      const pendingInvoices = invoices
        ?.filter(inv => inv.status === InvoiceStatus.Pending)
        .length || 0;

      // Fetch member stats
      const members = await MemberService.getMembersByGym(gymId!);

      const totalMembers = members?.length || 0;
      const activeMembers = members?.filter(m => m.status === MemberStatus.Active).length || 0;

      // Fetch attendance stats
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const allAttendance = await AttendanceService.getAttendanceByGym(gymId!);
      const recentAttendance = allAttendance.filter(log => 
        new Date(log.checkInAt) >= thirtyDaysAgo
      );

      const totalAttendance = recentAttendance?.length || 0;

      // Fetch trainer stats
      const trainers = await TrainerService.getTrainersByGym(gymId!);

      const activeTrainers = trainers.filter(t => t.isActive).length || 0;

      setStats({
        totalRevenue,
        totalMembers,
        activeMembers,
        pendingInvoices,
        totalAttendance,
        activeTrainers,
      });

      // Process revenue data by month
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return date;
      }).reverse();

      const revenueByMonth = last6Months.map(date => {
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).toISOString();
        
        const monthRevenue = invoices
          ?.filter(inv => 
            (inv.status === InvoiceStatus.Paid || inv.status === InvoiceStatus.PartiallyPaid) && 
            inv.createdAt >= monthStart && 
            inv.createdAt <= monthEnd
          )
          .reduce((sum, inv) => sum + Number(inv.netAmount || 0), 0) || 0;

        return {
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          revenue: monthRevenue,
        };
      });

      setRevenueData(revenueByMonth);

      // Member status distribution
      const membersByStatus = [
        { name: 'Active', value: activeMembers },
        { name: 'Inactive', value: members?.filter(m => m.status === MemberStatus.Inactive).length || 0 },
        { name: 'Suspended', value: members?.filter(m => m.status === MemberStatus.Suspended).length || 0 },
      ];

      setMemberStatusData(membersByStatus);

      // Attendance trend (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date;
      }).reverse();

      const attendanceByDay = last7Days.map(date => {
        const dayStart = new Date(date.setHours(0, 0, 0, 0)).toISOString();
        const dayEnd = new Date(date.setHours(23, 59, 59, 999)).toISOString();
        
        const dayAttendance = recentAttendance
          ?.filter(att => att.checkInAt >= dayStart && att.checkInAt <= dayEnd)
          .length || 0;

        return {
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          attendance: dayAttendance,
        };
      });

      setAttendanceData(attendanceByDay);

    } catch (error) {
      console.error("Error fetching reports data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="text-4xl md:text-5xl font-bold mb-2">
          Reports <span className="text-primary">Dashboard</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Comprehensive analytics and insights for your gym
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-in">
        <Card className="card-glow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">
              PKR {stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From all paid invoices
            </p>
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalMembers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.activeMembers} active members
            </p>
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <Receipt className="h-5 w-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">{stats.pendingInvoices}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting payment
            </p>
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Check-ins (30 days)</CardTitle>
            <UserCheck className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalAttendance}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total member visits
            </p>
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Trainers</CardTitle>
            <Dumbbell className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeTrainers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Available for sessions
            </p>
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Daily Check-ins</CardTitle>
            <Activity className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.round(stats.totalAttendance / 30)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-6 animate-slide-in">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="revenue">Revenue Trend</TabsTrigger>
          <TabsTrigger value="members">Member Distribution</TabsTrigger>
          <TabsTrigger value="attendance">Attendance Trend</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card className="card-glow">
            <CardHeader>
              <CardTitle>Revenue Over Last 6 Months</CardTitle>
              <CardDescription>Monthly revenue from paid invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <Card className="card-glow">
            <CardHeader>
              <CardTitle>Member Status Distribution</CardTitle>
              <CardDescription>Current member status breakdown</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={memberStatusData.filter(entry => entry.value > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {memberStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card className="card-glow">
            <CardHeader>
              <CardTitle>Attendance Trend (Last 7 Days)</CardTitle>
              <CardDescription>Daily check-in counts</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="day" 
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="attendance" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Links to Detailed Reports */}
      <Card className="card-glow animate-slide-in">
        <CardHeader>
          <CardTitle>Detailed Reports</CardTitle>
          <CardDescription>Access comprehensive reports with export options</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            className="h-auto flex flex-col items-start gap-2 p-4"
            onClick={() => navigate('/reports/attendance')}
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="font-semibold">Member Attendance Report</span>
            </div>
            <p className="text-sm text-muted-foreground text-left">
              Detailed attendance logs with member visit history
            </p>
          </Button>

          <Button 
            variant="outline" 
            className="h-auto flex flex-col items-start gap-2 p-4"
            onClick={() => navigate('/reports/payments')}
          >
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-success" />
              <span className="font-semibold">Payment Collection Report</span>
            </div>
            <p className="text-sm text-muted-foreground text-left">
              Complete payment history and transaction details
            </p>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
