import { Users, CreditCard, Activity, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { MemberService } from "@/services/memberService";
import { SubscriptionService } from "@/services/subscriptionService";
import { AttendanceService } from "@/services/attendanceService";
import { TransactionService } from "@/services/transactionService";
import { useAuth } from "@/contexts/AuthContext";
import { SubscriptionStatus } from "@/models/enums/SubscriptionStatus";
import { MemberStatus } from "@/models/enums/MemberStatus";

interface KPICardProps {
  title: string;
  value: number;
  change: string;
  icon: React.ReactNode;
  delay: number;
}

const KPICard = ({ title, value, change, icon, delay }: KPICardProps) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      let start = 0;
      const end = value;
      const duration = 2000;
      const increment = end / (duration / 16);

      const counter = setInterval(() => {
        start += increment;
        if (start >= end) {
          setDisplayValue(end);
          clearInterval(counter);
        } else {
          setDisplayValue(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(counter);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <Card 
      className="card-glow p-6 bg-gradient-to-br from-card to-card/80"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl bg-primary/10">
          {icon}
        </div>
        <span className="text-sm font-medium text-success">{change}</span>
      </div>
      <h3 className="text-3xl md:text-4xl font-bold mb-1 animate-count-up">
        {displayValue.toLocaleString()}
      </h3>
      <p className="text-muted-foreground text-sm">{title}</p>
    </Card>
  );
};

export const KPICards = () => {
  const { gymId } = useAuth();
  const [kpis, setKpis] = useState([
    {
      title: "Total Members",
      value: 0,
      change: "+0%",
      icon: <Users className="w-6 h-6 text-primary" />,
      delay: 100,
    },
    {
      title: "Active Subscriptions",
      value: 0,
      change: "+0%",
      icon: <CreditCard className="w-6 h-6 text-primary" />,
      delay: 200,
    },
    {
      title: "Check-ins Today",
      value: 0,
      change: "+0%",
      icon: <Activity className="w-6 h-6 text-primary" />,
      delay: 300,
    },
    {
      title: "Revenue (Month)",
      value: 0,
      change: "+0%",
      icon: <TrendingUp className="w-6 h-6 text-primary" />,
      delay: 400,
    },
  ]);

  useEffect(() => {
    const fetchKPIData = async () => {
      if (!gymId) return;

      try {
        // Fetch total members
        const allMembers = await MemberService.getMembersByGym(gymId);
        const totalMembers = allMembers.filter(m => m.status === MemberStatus.Active).length;

        // Fetch active subscriptions
        const allSubscriptions = await SubscriptionService.getSubscriptionsByGym(gymId);
        const activeSubscriptions = allSubscriptions.filter(s => s.status === SubscriptionStatus.Active).length;

        // Fetch check-ins today
        const todayAttendance = await AttendanceService.getTodayAttendance(gymId);
        const checkinsToday = todayAttendance.length;

        // Fetch revenue for current month
        const date = new Date(new Date().toISOString());
        const month = date.getMonth()+1;
        const year = date.getFullYear();

        const monthRevenue = await TransactionService.getTotalRevenue(gymId, month, year);

        setKpis([
          {
            title: "Total Members",
            value: totalMembers,
            change: "+0%",
            icon: <Users className="w-6 h-6 text-primary" />,
            delay: 100,
          },
          {
            title: "Active Subscriptions",
            value: activeSubscriptions,
            change: "+0%",
            icon: <CreditCard className="w-6 h-6 text-primary" />,
            delay: 200,
          },
          {
            title: "Check-ins Today",
            value: checkinsToday,
            change: "+0%",
            icon: <Activity className="w-6 h-6 text-primary" />,
            delay: 300,
          },
          {
            title: "Revenue (Month)",
            value: Math.round(monthRevenue),
            change: "+0%",
            icon: <TrendingUp className="w-6 h-6 text-primary" />,
            delay: 400,
          },
        ]);
      } catch (error) {
        console.error("Error fetching KPI data:", error);
      }
    };

    fetchKPIData();
  }, [gymId]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => (
        <KPICard key={index} {...kpi} />
      ))}
    </div>
  );
};
