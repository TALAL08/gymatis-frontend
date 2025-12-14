import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { AttendanceService } from "@/services/attendanceService";
import { SubscriptionService } from "@/services/subscriptionService";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { AttendanceLog } from "@/models/interfaces/AttendanceLog";
import { Subscription } from "@/models/interfaces/Subscription";

interface Activity {
  member: string;
  action: string;
  time: string;
  status: "active" | "success" | "new" | "inactive";
}

export const RecentActivity = () => {
  const { gymId } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      if (!gymId) return;

      try {
        setLoading(true);
        
        // Fetch recent check-ins
        const allAttendance = await AttendanceService.getAttendanceByGym(gymId);
        const recentCheckIns = allAttendance.slice(0, 3);

        // Fetch recent subscriptions
        const allSubscriptions = await SubscriptionService.getSubscriptionsByGym(gymId);
        const recentSubscriptions = allSubscriptions.slice(0, 2);

        const activityList: Activity[] = [];

        // Add check-ins
        recentCheckIns?.forEach((log: AttendanceLog) => {
          const member = log.member;
          const memberName = `${member.firstName} ${member.lastName}`;
          activityList.push({
            member: memberName,
            action: log.checkOutAt ? "Checked Out" : "Checked In",
            time: formatDistanceToNow(new Date(log.checkInAt), { addSuffix: true }),
            status: log.checkOutAt ? "inactive" : "active",
          });
        });

        // Add subscriptions
        recentSubscriptions?.forEach((sub: Subscription) => {
          const member = sub.member;
          const memberName = `${member.firstName} ${member.lastName}`;
          activityList.push({
            member: memberName,
            action: "Subscription Created",
            time: formatDistanceToNow(new Date(sub.createdAt), { addSuffix: true }),
            status: "success",
          });
        });

        // Sort by most recent
        activityList.sort((a, b) => {
          const getTime = (timeStr: string) => {
            const match = timeStr.match(/(\d+)\s+(second|minute|hour|day)/);
            if (!match) return 0;
            const value = parseInt(match[1]);
            const unit = match[2];
            const multiplier = unit === "second" ? 1 : unit === "minute" ? 60 : unit === "hour" ? 3600 : 86400;
            return value * multiplier;
          };
          return getTime(a.time) - getTime(b.time);
        });

        setActivities(activityList.slice(0, 5));
      } catch (error) {
        console.error("Error fetching recent activity:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivity();
  }, [gymId]);

  const statusColors = {
    active: "bg-success/20 text-success",
    success: "bg-primary/20 text-primary",
    new: "bg-warning/20 text-warning",
    inactive: "bg-muted text-muted-foreground",
  };

  return (
    <Card className="card-glow p-6 bg-gradient-to-br from-card to-card/80">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Recent Activity</h3>
        <Clock className="w-5 h-5 text-muted-foreground" />
      </div>
      
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4 p-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))
        ) : activities.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No recent activity</p>
        ) : (
          activities.map((activity, index) => (
          <div
            key={index}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-all cursor-pointer"
            style={{ animationDelay: `${(index + 5) * 100}ms` }}
          >
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {activity.member.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{activity.member}</p>
              <p className="text-sm text-muted-foreground">{activity.action}</p>
            </div>
            
            <div className="text-right">
              <Badge 
                variant="secondary" 
                className={`${statusColors[activity.status as keyof typeof statusColors]} mb-1`}
              >
                {activity.status}
              </Badge>
              <p className="text-xs text-muted-foreground">{activity.time}</p>
            </div>
          </div>
          ))
        )}
      </div>
    </Card>
  );
};
