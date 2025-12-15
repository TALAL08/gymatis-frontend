import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AuthService } from '@/services/authService';
import { jwtDecode } from "jwt-decode";
import { UserRole } from '@/models/enums/Gender';

interface AuthContextType {
  user: UserDto | null;
  profile: UserProfile | null;
  token: string;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    timezone: string,
    phone?: string,
    gymName?: string,
    gymLocation?: string,
    gymPhone?: string,
    gymEmail?: string,
    gymAddress?: string
  ) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  hasRole: (role: UserRole[]) => boolean;
  isSystemAdmin: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  isTrainer: boolean;
  isMember: boolean;
  gymId: number| null;
}
interface SignInResponse {
  token: string;
  profile: UserProfile;
  user: UserDto;
}
interface UserDto {
  id: string;
  email: string;
  phoneNumber: string;
  isBlocked:boolean;
}
interface UserProfile{
  firstName: string;
  lastName: string;
  cnic?: string;
  gymId: number;
  timeZone: string;
}
interface DecodedToken {
  sub: string;
  email: string;
  role?: string | string[];
  [key: string]: any;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize from localStorage if available
    const savedToken = localStorage.getItem("access_token");
    const savedUser = localStorage.getItem("user");
    const savedProfile = localStorage.getItem("profile");

    if (savedToken) setToken(savedToken);
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedProfile) setProfile(JSON.parse(savedProfile));

    if (savedToken) {
      const decoded: DecodedToken = jwtDecode(savedToken);
      let decodedRoles: string[] = [];
      Array.isArray(decoded.role) ? decodedRoles = decoded.role : decodedRoles.push(decoded.role);
      setRoles(decodedRoles);
    }

    setLoading(false);
  }, []);


const signUp = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  timezone: string,
  phone?: string,
  gymName?: string,
  gymLocation?: string,
  gymPhone?: string,
  gymEmail?: string,
  gymAddress?: string
) => {
  try {
    const res = await AuthService.signUp(
      email,
      password,
      firstName,
      lastName,
      timezone,
      phone,
      gymName,
      gymLocation,
      gymPhone,
      gymEmail,
      gymAddress
    );

    toast.success("Account created! Please verify your email.");
    return { error: null };
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to sign up");
    return { error };
  }
};

// --------------------------------------------------
// SIGN IN (calls POST /auth/login)
// --------------------------------------------------
const signIn = async (email: string, password: string) => {
  try {
    const res = await AuthService.signIn<SignInResponse>(email, password);
    console.log(res)
    // Response contains → { token, user }
    const { token, user, profile} = res;
    
    // Save token for future API calls
    localStorage.setItem("access_token", token);
    localStorage.setItem("user", JSON.stringify(user));    
    localStorage.setItem("timeZone", JSON.stringify(profile.timeZone));        
    localStorage.setItem("profile", JSON.stringify(profile));        
    const decoded: DecodedToken = jwtDecode(token);
    
    // ----------------------- SET STATE BEFORE NAVIGATION -----------------------
    setToken(token);
    setUser(user);
    setProfile(profile);
    
    // ----------------------- ROLE LOGIC -----------------------
    let rolesArray: string[] = [];
    if (decoded.role) {
      rolesArray = Array.isArray(decoded.role) ? decoded.role : [decoded.role];
    }
    setRoles(rolesArray);
    
    toast.success("Welcome back!");
    if (rolesArray.includes(UserRole[UserRole.SystemAdmin])) {
      navigate("/"); // system admin dashboard
      return { error: null };
    } else if (rolesArray.includes(UserRole[UserRole.Admin])) {
      navigate("/"); // admin dashboard
      return { error: null };      
    } else if (rolesArray.includes(UserRole[UserRole.Staff])) {
      navigate("/"); // staff dashboard
      return { error: null };
    } else if (rolesArray.includes(UserRole[UserRole.Member])) {
      navigate("/member-portal");
      return { error: null };      
    } else if (rolesArray.includes(UserRole[UserRole.Trainer])) {
      navigate("/trainer-portal");
      return { error: null };      
    } else {
      toast.error("No valid roles assigned");
      return { error: new Error("No valid roles") };
    }
  } catch (error: any) {
    if (error.response?.data?.message?.includes("Invalid login")) {
      toast.error("Invalid email or password");
    } else {
      toast.error(error.response?.data?.message || "Failed to sign in");
    }
    return { error };
  }
};

  const signOut = async () => {
    setUser(null);
    setProfile(null);
    setToken(null);
    setRoles([]);
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    localStorage.removeItem("profile");
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  const hasRole = (userRoles: UserRole[]) => roles.some(r => userRoles.includes(UserRole[r]));

  const gymId = profile?.gymId || null;
  return (
    <AuthContext.Provider
      value={{
        user,
        profile: profile,
        token,
        loading,
        signUp,
        signIn,
        signOut,
        hasRole,
        isSystemAdmin: hasRole([UserRole.SystemAdmin]),
        isAdmin: hasRole([UserRole.Admin]),
        isStaff: hasRole([UserRole.Staff]),
        isTrainer: hasRole([UserRole.Trainer]),
        isMember: hasRole([UserRole.Member]),
        gymId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}