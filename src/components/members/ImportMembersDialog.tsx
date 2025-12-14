import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { MemberService } from '@/services/memberService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface ImportMemberData {
  gymId: number;
  email: string;
  password: string;
  memberCode: string;
  firstName: string;
  lastName: string;
  phoneNo: string;
  cnic?: string;
  dateOfBirth?: string;
  gender: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  photoUrl?: string;
  notes?: string;
}

interface ParsedRow {
  data: ImportMemberData;
  errors: string[];
  rowIndex: number;
}

interface ImportMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const REQUIRED_COLUMNS = ['email', 'password', 'memberCode', 'firstName', 'lastName', 'phoneNo', 'gender'];
const ALL_COLUMNS = [
  'email', 'password', 'memberCode', 'firstName', 'lastName', 'phoneNo',
  'cnic', 'dateOfBirth', 'gender', 'address', 'emergencyContact', 'emergencyPhone', 'photoUrl', 'notes'
];

export function ImportMembersDialog({ open, onOpenChange }: ImportMembersDialogProps) {
  const { gymId } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0, success: 0, failed: 0 });
  const [fileName, setFileName] = useState<string | null>(null);

  const resetState = () => {
    setParsedData([]);
    setFileName(null);
    setImportProgress({ current: 0, total: 0, success: 0, failed: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    if (!isImporting) {
      resetState();
      onOpenChange(false);
    }
  };

  const parseDate = (value: any): string | undefined => {
    if (!value) return undefined;
    
    // Handle Excel date serial numbers
    if (typeof value === 'number') {
      const date = XLSX.SSF.parse_date_code(value);
      if (date) {
        return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
      }
    }
    
    const strValue = String(value).trim();
    
    // Try dd/MM/yyyy format
    const ddMMyyyyMatch = strValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddMMyyyyMatch) {
      const [, day, month, year] = ddMMyyyyMatch;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    // Try yyyy-MM-dd format
    const yyyyMMddMatch = strValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (yyyyMMddMatch) {
      return strValue;
    }
    
    return strValue;
  };

  const parseGender = (value: any): string => {
    if (!value) return '';
    const strValue = String(value).trim().toLowerCase();
    if (['male', 'm'].includes(strValue)) return 'Male';
    if (['female', 'f'].includes(strValue)) return 'Female';
    if (['other', 'o'].includes(strValue)) return 'Other';
    return String(value).trim();
  };

  const validateRow = (row: any, rowIndex: number): ParsedRow => {
    const errors: string[] = [];
    
    // Check required fields
    REQUIRED_COLUMNS.forEach(col => {
      if (!row[col] || String(row[col]).trim() === '') {
        errors.push(`Missing required field: ${col}`);
      }
    });

    // Validate email format
    if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(row.email).trim())) {
      errors.push('Invalid email format');
    }

    // Validate gender
    const gender = parseGender(row.gender);
    if (gender && !['Male', 'Female', 'Other'].includes(gender)) {
      errors.push('Gender must be Male, Female, or Other');
    }

    // Validate password length
    if (row.password && String(row.password).length < 6) {
      errors.push('Password must be at least 6 characters');
    }

    const data: ImportMemberData = {
      gymId: gymId || 0,
      email: String(row.email || '').trim(),
      password: String(row.password || '').trim(),
      memberCode: String(row.memberCode || '').trim(),
      firstName: String(row.firstName || '').trim(),
      lastName: String(row.lastName || '').trim(),
      phoneNo: String(row.phoneNo || '').trim(),
      cnic: row.cnic ? String(row.cnic).trim() : undefined,
      dateOfBirth: parseDate(row.dateOfBirth),
      gender: gender,
      address: row.address ? String(row.address).trim() : undefined,
      emergencyContact: row.emergencyContact ? String(row.emergencyContact).trim() : undefined,
      emergencyPhone: row.emergencyPhone ? String(row.emergencyPhone).trim() : undefined,
      photoUrl: row.photoUrl ? String(row.photoUrl).trim() : undefined,
      notes: row.notes ? String(row.notes).trim() : undefined,
    };

    return { data, errors, rowIndex };
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (jsonData.length === 0) {
          toast.error('The Excel file is empty');
          return;
        }

        // Validate column headers
        const firstRow = jsonData[0] as Record<string, any>;
        const missingRequired = REQUIRED_COLUMNS.filter(col => !(col in firstRow));
        if (missingRequired.length > 0) {
          toast.error(`Missing required columns: ${missingRequired.join(', ')}`);
          return;
        }

        const parsed = jsonData.map((row, index) => validateRow(row, index + 2)); // +2 for 1-based index + header row
        setParsedData(parsed);
        
        const validCount = parsed.filter(p => p.errors.length === 0).length;
        const invalidCount = parsed.filter(p => p.errors.length > 0).length;
        
        toast.success(`Parsed ${parsed.length} rows: ${validCount} valid, ${invalidCount} with errors`);
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        toast.error('Failed to parse Excel file. Please check the format.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        email: 'john@example.com',
        password: 'password123',
        memberCode: 'MEM001',
        firstName: 'John',
        lastName: 'Doe',
        phoneNo: '+1234567890',
        cnic: '12345-1234567-1',
        dateOfBirth: '15/01/1990',
        gender: 'Male',
        address: '123 Main Street',
        emergencyContact: 'Jane Doe',
        emergencyPhone: '+0987654321',
        notes: 'Sample member'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Members');
    
    // Set column widths
    worksheet['!cols'] = ALL_COLUMNS.map(() => ({ wch: 18 }));
    
    XLSX.writeFile(workbook, 'member_import_template.xlsx');
    toast.success('Template downloaded');
  };

  const handleImport = async () => {
    const validRows = parsedData.filter(p => p.errors.length === 0);
    
    if (validRows.length === 0) {
      toast.error('No valid rows to import');
      return;
    }

    setIsImporting(true);
    setImportProgress({ current: 0, total: validRows.length, success: 0, failed: 0 });

    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      try {
        await MemberService.createMember(row.data);
        successCount++;
      } catch (error: any) {
        console.error(`Failed to import row ${row.rowIndex}:`, error);
        failedCount++;
        // Update the row with the error
        const errorMessage = error?.response?.data?.message || error?.message || 'Import failed';
        row.errors.push(`Import error: ${errorMessage}`);
      }
      setImportProgress({
        current: i + 1,
        total: validRows.length,
        success: successCount,
        failed: failedCount
      });
    }

    setIsImporting(false);
    
    if (successCount > 0) {
      await queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success(`Successfully imported ${successCount} members`);
    }
    
    if (failedCount > 0) {
      toast.error(`Failed to import ${failedCount} members`);
      // Update parsed data to show errors
      setParsedData([...parsedData]);
    } else {
      handleClose();
    }
  };

  const validRows = parsedData.filter(p => p.errors.length === 0);
  const invalidRows = parsedData.filter(p => p.errors.length > 0);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import Members from Excel
          </DialogTitle>
          <DialogDescription>
            Upload an Excel file (.xlsx, .xls) with member data to import multiple members at once.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-hidden">
          {/* Upload Section */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                disabled={isImporting}
                className="cursor-pointer"
              />
              {fileName && (
                <p className="text-sm text-muted-foreground mt-1">
                  Selected: {fileName}
                </p>
              )}
            </div>
            <Button variant="outline" onClick={downloadTemplate} disabled={isImporting}>
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
          </div>

          {/* Required Fields Info */}
          <div className="bg-muted/50 rounded-lg p-3 text-sm">
            <p className="font-medium mb-1">Required fields:</p>
            <p className="text-muted-foreground">
              email, password, memberCode, firstName, lastName, phoneNo, gender
            </p>
          </div>

          {/* Import Progress */}
          {isImporting && (
            <div className="bg-primary/10 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="font-medium">Importing members...</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {importProgress.current} of {importProgress.total} processed 
                ({importProgress.success} success, {importProgress.failed} failed)
              </p>
            </div>
          )}

          {/* Parsed Data Preview */}
          {parsedData.length > 0 && !isImporting && (
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="bg-success/10 text-success">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  {validRows.length} Valid
                </Badge>
                {invalidRows.length > 0 && (
                  <Badge variant="outline" className="bg-destructive/10 text-destructive">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    {invalidRows.length} With Errors
                  </Badge>
                )}
              </div>

              <ScrollArea className="h-[300px] border rounded-lg">
                <div className="p-4 space-y-2">
                  {parsedData.map((row) => (
                    <div
                      key={row.rowIndex}
                      className={`p-3 rounded-lg border ${
                        row.errors.length > 0 
                          ? 'bg-destructive/5 border-destructive/20' 
                          : 'bg-success/5 border-success/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            Row {row.rowIndex}: {row.data.firstName} {row.data.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {row.data.email} • {row.data.memberCode}
                          </p>
                        </div>
                        {row.errors.length > 0 ? (
                          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                        ) : (
                          <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                        )}
                      </div>
                      {row.errors.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {row.errors.map((error, i) => (
                            <p key={i} className="text-sm text-destructive">
                              • {error}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Empty State */}
          {parsedData.length === 0 && !isImporting && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium mb-1">Upload an Excel file</h3>
              <p className="text-sm text-muted-foreground">
                Or download the template to get started
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isImporting}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={validRows.length === 0 || isImporting}
          >
            {isImporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import {validRows.length} Members
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
