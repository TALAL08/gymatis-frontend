import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ReactNode, useEffect } from 'react';
import { UserRole } from '@/models/enums/Gender';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?:UserRole[];
}

export const ProtectedRoute = ({ children, requiredRoles }: ProtectedRouteProps) => {
  const { user, loading, hasRole, isMember, isTrainer, isAdmin, isStaff, isSystemAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Role-based redirects for root path
  if (location.pathname === '/') {
    if (isMember) {
      return <Navigate to="/member-portal" replace />;
    }
    if (isTrainer && !isAdmin && !isStaff && !isSystemAdmin) {
      return <Navigate to="/trainer-portal" replace />;
    }
    // Gym admins and staff stay on root path (handled by requiredRole check below)
  }

  // Prevent members from accessing admin routes
  if (requiredRoles && isMember && !requiredRoles.includes(UserRole.Member)) {
    return <Navigate to="/member-portal" replace />;
  }
  // Prevent trainers from accessing admin routes (unless they also have admin/staff role)
  // But allow trainers to access trainer-specific routes
  if (requiredRoles && isTrainer && !requiredRoles.includes(UserRole.Trainer)) {
    return <Navigate to="/trainer-portal" replace />;
  }

  // Check if user has required role for admin routes
  // Gym admins have access to all staff-level routes
  if (requiredRoles && !hasRole(requiredRoles)) {
    // Gym admins can access staff routes
    const hasAccess = isAdmin || (requiredRoles.includes(UserRole.Admin) ? isSystemAdmin : false);
    
    if (!hasAccess) {
      // If they don't have the role but have other admin roles, show access denied
      if (isAdmin || isStaff || isSystemAdmin) {
        return (
          <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
              <p className="text-muted-foreground">You don't have permission to access this page.</p>
            </div>
          </div>
        );
      }
    }
  }

  return <>{children}</>;
};