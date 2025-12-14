import { KPICards } from "@/components/dashboard/KPICards";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user,profile ,isSystemAdmin, isAdmin, isStaff } = useAuth();
  
  const getRoleName = () => {
    if (isSystemAdmin) return 'System Admin';
    if (isAdmin) return 'Gym Admin';
    if (isStaff) return 'Staff';
    return 'User';
  };

  const getFirstName = () => {
    return profile.firstName || 'User';
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="text-4xl md:text-5xl font-bold mb-2">
          Welcome back, <span className="text-primary">{getFirstName()}</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          {getRoleName()} • Here's what's happening with your gym today
        </p>
      </div>

      <KPICards />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  );
};

export default Index;
