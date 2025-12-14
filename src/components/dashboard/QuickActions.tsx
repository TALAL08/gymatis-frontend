import { UserPlus, QrCode, Package, FileText, CreditCard, Dumbbell, Receipt } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const QuickActions = () => {
  const actions = [
    {
      icon: <UserPlus className="w-5 h-5" />,
      label: "New Member",
      description: "Register a new member",
      link: "/members",
    },
    {
      icon: <QrCode className="w-5 h-5" />,
      label: "Check-In",
      description: "Scan member barcode",
      link: "/attendance",
    },
    {
      icon: <CreditCard className="w-5 h-5" />,
      label: "Subscriptions",
      description: "Manage subscriptions",
      link: "/subscriptions",
    },
    {
      icon: <Package className="w-5 h-5" />,
      label: "Packages",
      description: "Manage packages",
      link: "/packages",
    },
    {
      icon: <Dumbbell className="w-5 h-5" />,
      label: "Trainers",
      description: "Manage trainers",
      link: "/trainers",
    },
    {
      icon: <Receipt className="w-5 h-5" />,
      label: "Invoices",
      description: "Manage payments",
      link: "/invoices",
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: "Reports",
      description: "View analytics",
      link: "/reports",
    },
  ];

  return (
    <Card className="card-glow p-6 bg-gradient-to-br from-card to-card/80">
      <h3 className="text-xl font-bold mb-6">Quick Actions</h3>
      <div className="space-y-3">
        {actions.map((action, index) => (
          <Link key={index} to={action.link}>
            <Button
              variant="secondary"
              className="w-full justify-start gap-3 h-auto py-4 hover:bg-primary/20 transition-all"
              style={{ animationDelay: `${(index + 5) * 100}ms` }}
            >
              <div className="p-2 rounded-lg bg-primary/20">
                {action.icon}
              </div>
              <div className="text-left">
                <div className="font-semibold">{action.label}</div>
                <div className="text-xs text-muted-foreground">{action.description}</div>
              </div>
            </Button>
          </Link>
        ))}
      </div>
    </Card>
  );
};
