import {
  Home,
  Users,
  Package,
  CreditCard,
  Dumbbell,
  ClipboardCheck,
  Receipt,
  BarChart3,
  ChevronRight,
  UserCog,
  Settings,
  Wallet,
  BadgeDollarSign,
  BookOpen,
  PieChart,
  TrendingUp,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { UserRole } from "@/models/enums/Gender";

const mainItems = [
  { title: "Dashboard", url: "/", icon: Home, allowedRoles: [UserRole.Admin, UserRole.Staff] },
  { title: "Members", url: "/members", icon: Users, allowedRoles: [UserRole.Admin, UserRole.Staff] },
  { title: "Packages", url: "/packages", icon: Package, allowedRoles: [UserRole.Admin, UserRole.Staff] },
  { title: "Subscriptions", url: "/subscriptions", icon: CreditCard, allowedRoles: [UserRole.Admin, UserRole.Staff] },
  { title: "Trainers", url: "/trainers", icon: Dumbbell, allowedRoles: [UserRole.Admin, UserRole.Staff] },
  { title: "Attendance", url: "/attendance", icon: ClipboardCheck, allowedRoles: [UserRole.Admin, UserRole.Staff] },
  { title: "Invoices", url: "/invoices", icon: Receipt, allowedRoles: [UserRole.Admin, UserRole.Staff] },
  { title: "Staff", url: "/staff", icon: UserCog, allowedRoles: [UserRole.Admin] },
  { title: "Gym Settings", url: "/gym-settings", icon: Settings, allowedRoles: [UserRole.Admin] },
];

const accountsItems = [
  { title: "Accounts", url: "/accounts", icon: Wallet, allowedRoles: [UserRole.Admin, UserRole.Staff] },
  { title: "Expenses", url: "/expenses", icon: BadgeDollarSign, allowedRoles: [UserRole.Admin, UserRole.Staff] },
  { title: "Account Ledger", url: "/account-ledger", icon: BookOpen, allowedRoles: [UserRole.Admin, UserRole.Staff] },
];

const reportItems = [
  { title: "Reports Dashboard", url: "/reports", icon: BarChart3, allowedRoles: [UserRole.Admin, UserRole.Staff] },
  { title: "Account Summary", url: "/reports/account-summary", icon: PieChart, allowedRoles: [UserRole.Admin, UserRole.Staff] },
  { title: "Expense Report", url: "/reports/expenses", icon: BadgeDollarSign, allowedRoles: [UserRole.Admin, UserRole.Staff] },
  { title: "Income vs Expense", url: "/reports/income-expense", icon: TrendingUp, allowedRoles: [UserRole.Admin, UserRole.Staff] },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const { hasRole } = useAuth();

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar collapsible="icon">
      {hasRole([UserRole.Admin, UserRole.Staff]) ? (

        <SidebarContent className="bg-sidebar" >
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/70 uppercase text-xs font-semibold px-3">
              Main Menu
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainItems
                  .filter(item => !item.allowedRoles || hasRole(item.allowedRoles))
                  .map((item) => {
                    const active = isActive(item.url);
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <NavLink
                            to={item.url}
                            end={item.url === "/"}
                            className={`
                            flex items-center gap-3 px-3 py-2 rounded-md transition-all
                            ${active
                                ? 'bg-sidebar-accent text-sidebar-primary font-semibold'
                                : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                              }
                          `}
                          >
                            <item.icon className={`h-5 w-5 ${active ? 'text-sidebar-primary' : ''}`} />
                            {open && <span>{item.title}</span>}
                            {open && active && <ChevronRight className="ml-auto h-4 w-4" />}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className="text-sidebar-foreground/70 uppercase text-xs font-semibold px-3">
              Accounts & Finance
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {accountsItems
                  .filter(item => !item.allowedRoles || hasRole(item.allowedRoles))
                  .map((item) => {
                    const active = isActive(item.url);
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <NavLink
                            to={item.url}
                            className={`
                          flex items-center gap-3 px-3 py-2 rounded-md transition-all
                          ${active
                                ? 'bg-sidebar-accent text-sidebar-primary font-semibold'
                                : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                              }
                        `}
                          >
                            <item.icon className={`h-5 w-5 ${active ? 'text-sidebar-primary' : ''}`} />
                            {open && <span>{item.title}</span>}
                            {open && active && <ChevronRight className="ml-auto h-4 w-4" />}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className="text-sidebar-foreground/70 uppercase text-xs font-semibold px-3">
              Analytics
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {reportItems
                  .filter(item => !item.allowedRoles || hasRole(item.allowedRoles))
                  .map((item) => {
                    const active = isActive(item.url);
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <NavLink
                            to={item.url}
                            className={`
                          flex items-center gap-3 px-3 py-2 rounded-md transition-all
                          ${active
                                ? 'bg-sidebar-accent text-sidebar-primary font-semibold'
                                : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                              }
                        `}
                          >
                            <item.icon className={`h-5 w-5 ${active ? 'text-sidebar-primary' : ''}`} />
                            {open && <span>{item.title}</span>}
                            {open && active && <ChevronRight className="ml-auto h-4 w-4" />}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

      ) : (<SidebarContent className="bg-sidebar" ></SidebarContent>)}


    </Sidebar>
  );
}
