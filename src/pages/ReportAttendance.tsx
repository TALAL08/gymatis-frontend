import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AttendanceService } from "@/services/attendanceService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, FileText, Printer, Search } from "lucide-react";
import { exportToPDF, exportToCSV, printTable } from "@/lib/export-utils";
import { format } from "date-fns";
import { AttendanceLog } from "@/models/interfaces/AttendanceLog";

const ReportAttendance = () => {
  const { gymId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState<AttendanceLog[]>([]);
  const [filteredData, setFilteredData] = useState<AttendanceLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (gymId) {
      fetchAttendanceData();
    }
  }, [gymId, startDate, endDate]);

  useEffect(() => {
    filterData();
  }, [attendanceData, searchTerm]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const allAttendance = await AttendanceService.getAttendanceByGym(gymId!);
      
      // Filter by date range
      const filtered = allAttendance.filter(log => {
        const checkInDate = new Date(log.checkInAt);
        return checkInDate >= new Date(startDate) && 
               checkInDate <= new Date(endDate + 'T23:59:59');
      });

      setAttendanceData(filtered as any);
      setFilteredData(filtered as any);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    if (!searchTerm) {
      setFilteredData(attendanceData);
      return;
    }

    const filtered = attendanceData.filter(record => {
      const fullName = `${record.member.firstName} ${record.member.lastName}`.toLowerCase();
      const memberCode = record.member.memberCode.toLowerCase();
      const search = searchTerm.toLowerCase();
      
      return fullName.includes(search) || memberCode.includes(search);
    });

    setFilteredData(filtered);
  };

  const calculateDuration = (checkIn: string, checkOut: string | null) => {
    if (!checkOut) return "Still checked in";
    
    const duration = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const handleExportPDF = () => {
    const headers = ["Member Code", "Name", "Check-in", "Check-out", "Duration"];
    const data = filteredData.map(record => [
      record.member.memberCode,
      `${record.member.firstName} ${record.member.lastName}`,
      format(new Date(record.checkInAt), "MMM dd, yyyy HH:mm"),
      record.checkOutAt ? format(new Date(record.checkOutAt), "MMM dd, yyyy HH:mm") : "N/A",
      calculateDuration(record.checkInAt, record.checkOutAt),
    ]);

    exportToPDF(
      "Member Attendance Report",
      headers,
      data,
      `attendance-report-${startDate}-to-${endDate}`
    );
  };

  const handleExportCSV = () => {
    const headers = ["Member Code", "Name", "Check-in", "Check-out", "Duration"];
    const data = filteredData.map(record => [
      record.member.memberCode,
      `${record.member.firstName} ${record.member.lastName}`,
      format(new Date(record.checkInAt), "MMM dd, yyyy HH:mm"),
      record.checkOutAt ? format(new Date(record.checkOutAt), "MMM dd, yyyy HH:mm") : "N/A",
      calculateDuration(record.checkInAt, record.checkOutAt),
    ]);

    exportToCSV(headers, data, `attendance-report-${startDate}-to-${endDate}`);
  };

  const handlePrint = () => {
    const headers = ["Member Code", "Name", "Check-in", "Check-out", "Duration"];
    const data = filteredData.map(record => [
      record.member.memberCode,
      `${record.member.firstName} ${record.member.lastName}`,
      format(new Date(record.checkInAt), "MMM dd, yyyy HH:mm"),
      record.checkOutAt ? format(new Date(record.checkOutAt), "MMM dd, yyyy HH:mm") : "N/A",
      calculateDuration(record.checkInAt, record.checkOutAt),
    ]);

    printTable("Member Attendance Report", headers, data);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="text-4xl md:text-5xl font-bold mb-2">
          Attendance <span className="text-primary">Report</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Detailed member attendance logs and visit history
        </p>
      </div>

      <Card className="card-glow animate-slide-in">
        <CardHeader>
          <CardTitle>Filters & Export</CardTitle>
          <CardDescription>Filter data and export in your preferred format</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="search">Search Member</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleExportPDF} variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button onClick={handleExportCSV} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button onClick={handlePrint} variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="card-glow animate-slide-in">
        <CardHeader>
          <CardTitle>Attendance Records ({filteredData.length})</CardTitle>
          <CardDescription>
            Showing records from {format(new Date(startDate), "MMM dd, yyyy")} to {format(new Date(endDate), "MMM dd, yyyy")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading attendance data...
                    </TableCell>
                  </TableRow>
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No attendance records found for the selected criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-mono">
                        {record.member.memberCode}
                      </TableCell>
                      <TableCell className="font-medium">
                        {record.member.firstName} {record.member.lastName}
                      </TableCell>
                      <TableCell>
                        {format(new Date(record.checkInAt), "MMM dd, yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        {record.checkOutAt 
                          ? format(new Date(record.checkOutAt), "MMM dd, yyyy HH:mm")
                          : <span className="text-muted-foreground">N/A</span>
                        }
                      </TableCell>
                      <TableCell>
                        {calculateDuration(record.checkInAt, record.checkOutAt)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportAttendance;
