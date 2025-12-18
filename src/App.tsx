import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "./components/DashboardLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Members from "./pages/Members";
import MemberDetail from "./pages/MemberDetail";
import MemberCard from "./pages/MemberCard";
import Packages from "./pages/Packages";
import Subscriptions from "./pages/Subscriptions";
import Trainers from "./pages/Trainers";
import Attendance from "./pages/Attendance";
import Invoices from "./pages/Invoices";
import Reports from "./pages/Reports";
import ReportAttendance from "./pages/ReportAttendance";
import ReportPayments from "./pages/ReportPayments";
import Staffs from "./pages/Staffs";
import MemberPortal from "./pages/MemberPortal";
import TrainerPortal from "./pages/TrainerPortal";
import GymSettings from "./pages/GymSettings";
import Accounts from "./pages/Accounts";
import Expenses from "./pages/Expenses";
import AccountLedger from "./pages/AccountLedger";
import ReportAccountSummary from "./pages/ReportAccountSummary";
import ReportExpenses from "./pages/ReportExpenses";
import ReportIncomeExpense from "./pages/ReportIncomeExpense";
import NotFound from "./pages/NotFound";
import { UserRole } from "./models/enums/Gender";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/"
              element={
                <ProtectedRoute requiredRoles={[UserRole.Admin, UserRole.Staff]}>
                  <DashboardLayout>
                    <Index />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/members"
              element={
                <ProtectedRoute requiredRoles={[UserRole.Admin, UserRole.Staff]}>
                  <DashboardLayout>
                    <Members />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/members/:id"
              element={
                <ProtectedRoute requiredRoles={[UserRole.Admin, UserRole.Staff]}>
                  <DashboardLayout>
                    <MemberDetail />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/members/:id/card"
              element={
                <ProtectedRoute requiredRoles={[UserRole.Admin, UserRole.Staff]}>
                  <MemberCard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/packages"
              element={
                <ProtectedRoute requiredRoles={[UserRole.Admin, UserRole.Staff]}>
                  <DashboardLayout>
                    <Packages />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/subscriptions"
              element={
                <ProtectedRoute requiredRoles={[UserRole.Admin, UserRole.Staff]}>
                  <DashboardLayout>
                    <Subscriptions />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/trainers"
              element={
                <ProtectedRoute requiredRoles={[UserRole.Admin, UserRole.Staff]}>
                  <DashboardLayout>
                    <Trainers />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance"
              element={
                <ProtectedRoute requiredRoles={[UserRole.Admin, UserRole.Staff]}>
                  <DashboardLayout>
                    <Attendance />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoices"
              element={
                <ProtectedRoute requiredRoles={[UserRole.Admin, UserRole.Staff]}>
                  <DashboardLayout>
                    <Invoices />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute requiredRoles={[UserRole.Admin, UserRole.Staff]}>
                  <DashboardLayout>
                    <Reports />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/attendance"
              element={
                <ProtectedRoute requiredRoles={[UserRole.Admin, UserRole.Staff]}>
                  <DashboardLayout>
                    <ReportAttendance />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/payments"
              element={
                <ProtectedRoute requiredRoles={[UserRole.Admin, UserRole.Staff]}>
                  <DashboardLayout>
                    <ReportPayments />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff"
              element={
                <ProtectedRoute requiredRoles={[UserRole.Admin]}>
                  <DashboardLayout>
                    <Staffs />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/gym-settings"
              element={
                <ProtectedRoute requiredRoles={[UserRole.Admin]}>
                  <DashboardLayout>
                    <GymSettings />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/accounts"
              element={
                <ProtectedRoute requiredRoles={[UserRole.Admin, UserRole.Staff]}>
                  <DashboardLayout>
                    <Accounts />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/expenses"
              element={
                <ProtectedRoute requiredRoles={[UserRole.Admin, UserRole.Staff]}>
                  <DashboardLayout>
                    <Expenses />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/account-ledger"
              element={
                <ProtectedRoute requiredRoles={[UserRole.Admin, UserRole.Staff]}>
                  <DashboardLayout>
                    <AccountLedger />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/account-summary"
              element={
                <ProtectedRoute requiredRoles={[UserRole.Admin, UserRole.Staff]}>
                  <DashboardLayout>
                    <ReportAccountSummary />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/expenses"
              element={
                <ProtectedRoute requiredRoles={[UserRole.Admin, UserRole.Staff]}>
                  <DashboardLayout>
                    <ReportExpenses />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/income-expense"
              element={
                <ProtectedRoute requiredRoles={[UserRole.Admin, UserRole.Staff]}>
                  <DashboardLayout>
                    <ReportIncomeExpense />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/member-portal"
              element={
                <ProtectedRoute requiredRoles={[UserRole.Member]}>
                  <DashboardLayout>
                    <MemberPortal />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/trainer-portal"
              element={
                <ProtectedRoute requiredRoles={[UserRole.Trainer]}>
                  <DashboardLayout>
                    <TrainerPortal />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
