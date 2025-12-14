import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AttendanceService } from "@/services/attendanceService";
import { MemberService } from "@/services/memberService";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { LogIn, LogOut, Search, Clock, Calendar } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Member } from "@/models/interfaces/member";
import { MemberStatus } from "@/models/enums/MemberStatus";

export default function Attendance() {
  const { gymId, user } = useAuth();
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [checkedInSearch, setCheckedInSearch] = useState("");

  // Fetch today's attendance
  const { data: todayAttendance = [] } = useQuery({
    queryKey: ["attendance", "today", gymId],
    queryFn: async () => {
      if (!gymId) return [];
      return await AttendanceService.getTodayAttendance(gymId);
    },
    enabled: !!gymId,
  });

  // Fetch recent attendance (last 50)
  const { data: recentAttendance = [] } = useQuery({
    queryKey: ["attendance", "recent", gymId],
    queryFn: async () => {
      if (!gymId) return [];
      const allAttendance = await AttendanceService.getAttendanceByGym(gymId);
      return allAttendance.slice(0, 50);
    },
    enabled: !!gymId,
  });

  // Search member
  const searchMember = async (query: string) => {
    if (!query.trim()) {
      setSelectedMember(null);
      return;
    }

    const results = await MemberService.searchMembers(gymId!, query);
    const activeMember = results.find(m => m.status === MemberStatus.Active);

    if (!activeMember) {
      toast.error("Member not found");
      setSelectedMember(null);
      return;
    }

    setSelectedMember(activeMember as Member);
  };

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: async (memberId: number) => {
      if (!gymId) throw new Error('Gym ID not found');
      await AttendanceService.checkIn({ gymId: gymId, memberId: memberId, checkedInBy: user.id, deviceInfo: '' });
    },
    onSuccess: () => {
      toast.success("Member checked in successfully");
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      setSearchInput("");
      setSelectedMember(null);
    },
    onError: (error) => {
      toast.error("Failed to check in member");
      console.error(error);
    },
  });

  // Check-out mutation
  const checkOutMutation = useMutation({
    mutationFn: async (logId: number) => {
      await AttendanceService.checkOut(logId);
    },
    onSuccess: () => {
      toast.success("Member checked out successfully");
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: (error) => {
      toast.error("Failed to check out member");
      console.error(error);
    },
  });

  const handleSearch = () => {
    searchMember(searchInput);
  };

  const handleBarcodeInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleCheckIn = () => {
    if (selectedMember) {
      checkInMutation.mutate(selectedMember.id);
    }
  };

  const currentlyCheckedIn = todayAttendance.filter((log) => !log.checkOutAt);

  // Filter currently checked in members based on search
  const filteredCheckedIn = currentlyCheckedIn.filter((log) => {
    if (!checkedInSearch.trim()) return true;
    const searchLower = checkedInSearch.toLowerCase();
    const fullName = `${log.member.firstName} ${log.member.lastName}`.toLowerCase();
    const memberCode = log.member.memberCode?.toLowerCase() || "";
    return fullName.includes(searchLower) || memberCode.includes(searchLower);
  });

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">

      <div className="flex items-center justify-between animate-fade-in-up">

        <div>
          <h1 className="text-4xl font-bold">Attendance Tracking</h1>
          <p className="text-muted-foreground">Track member check-ins and check-outs</p>
        </div>

      </div>

      {/* Check-in Section */}
    <Card className="animate-slide-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogIn className="h-5 w-5" />
            Check-In / Check-Out
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Scan barcode or search member by code/name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleBarcodeInput}
                className="pl-10"
                autoFocus
              />
            </div>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          {selectedMember && (
            <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedMember.photoUrl || undefined} />
                  <AvatarFallback>
                    {selectedMember.firstName[0]}
                    {selectedMember.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">
                    {selectedMember.firstName} {selectedMember.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Code: {selectedMember.memberCode}
                  </p>
                </div>
              </div>
              <Button onClick={handleCheckIn} disabled={checkInMutation.isPending}>
                <LogIn className="h-4 w-4" />
                Check In
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Currently Checked In */}
    <Card className="animate-slide-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Currently Checked In ({currentlyCheckedIn.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar for Currently Checked In */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search checked-in member by name or code..."
                value={checkedInSearch}
                onChange={(e) => setCheckedInSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => setCheckedInSearch("")} variant="outline">
              Clear
            </Button>
          </div>

          {currentlyCheckedIn.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No members currently checked in
            </p>
          ) : filteredCheckedIn.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No matching members found
            </p>
          ) : (
            <div className="space-y-2">
              {filteredCheckedIn.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-card"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={log.member.photoUrl || undefined} />
                      <AvatarFallback>
                        {log.member.firstName[0]}
                        {log.member.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">
                        {log.member.firstName} {log.member.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Code: {log.member.memberCode} • Checked in {formatDistanceToNow(new Date(log.checkInAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => checkOutMutation.mutate(log.id)}
                    disabled={checkOutMutation.isPending}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Check Out
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Attendance History */}
    <Card className="animate-slide-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Attendance History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentAttendance.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No attendance records found
            </p>
          ) : (
            <div className="space-y-2">
              {recentAttendance.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={log.member.photoUrl || undefined} />
                      <AvatarFallback>
                        {log.member.firstName[0]}
                        {log.member.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {log.member.firstName} {log.member.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Check-in: {format(new Date(log.checkInAt), "MMM dd, yyyy HH:mm")}
                      </p>
                    </div>
                  </div>
                  <Badge variant={log.checkOutAt ? "secondary" : "default"}>
                    {log.checkOutAt
                      ? `Out: ${format(new Date(log.checkOutAt), "HH:mm")}`
                      : "Currently In"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
