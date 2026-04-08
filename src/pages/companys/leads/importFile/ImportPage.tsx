import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  FileUp,
  Download,
  Info,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { useLeadStatuses } from "@/hooks/useLeadStatus";
import { useDownloadDemoCSV, useImportLeads } from "@/hooks/useLeads";
import DataTable, { Column } from "@/components/DataTable";
import { toast } from "react-toastify";

interface LeadImportItem {
  name: string;
  company_name?: string;
  country?: string;
  state?: string;
  city?: string;
  zip?: string;
  address?: string;
  assigned_to_emp_code?: string;
  status: string;
  source: string;
  email?: string;
  website?: string;
  phone: string;
  expected_revenue?: string;
  priority?: string;
}

const ImportPage = () => {
  const navigate = useNavigate();
  const { companyId } = useParams();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fallbackStatus, setFallbackStatus] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadDemoMutation = useDownloadDemoCSV();
  const importLeadsMutation = useImportLeads();

  const { data: statusResponse } = useLeadStatuses({ limit: 100 });
  const statusOptions =
    (statusResponse as { items?: { id: string; name: string }[] })?.items?.map(
      (item) => ({
        value: item.id,
        label: item.name,
      }),
    ) || [];

  const columns: Column<LeadImportItem>[] = [
    { key: "name", header: "* Name" },
    { key: "company_name", header: "Company Name" },
    { key: "country", header: "Country" },
    { key: "state", header: "State" },
    { key: "city", header: "City" },
    { key: "zip", header: "Zip" },
    { key: "address", header: "Address" },
    { key: "assigned_to_emp_code", header: "Assigned To (Emp Code)" },
    { key: "status", header: "* Status" },
    { key: "source", header: "* Source" },
    { key: "email", header: "Email" },
    { key: "website", header: "Website" },
    { key: "phone", header: "* Phone" },
    { key: "expected_revenue", header: "Expected Revenue" },
    { key: "priority", header: "Priority" },
  ];

  const sampleData = [
    {
      name: "Jayraj",
      company_name: "ABC Corp",
      country: "India",
      state: "Gujarat",
      city: "Rajkot",
      zip: "360001",
      address: "123 Business Bay",
      categories: "Software, Consulting",
      assigned_to_emp_code: "EMP001",
      status: "New",
      source: "Website",
      email: "john.doe@example.com",
      website: "https://abc-corp.com",
      phone: "9876543210",
      expected_revenue: "50000",
      priority: "HOT",
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const parseCSVLine = (line: string) => {
    const result = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current.trim().replace(/^"|"$/g, ""));
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim().replace(/^"|"$/g, ""));
    return result;
  };

  const handleImport = () => {
    if (!selectedFile) {
      toast.error("Please select a CSV file to import.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/);
      if (lines.length < 2) {
        toast.error("CSV file is empty or missing headers.");
        return;
      }

      const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase());
      const items: any[] = [];

      // Map headers to field names
      const headerMap: { [key: string]: string } = {
        name: "name",
        company_name: "company_name",
        "company name": "company_name",
        country: "country",
        state: "state",
        city: "city",
        zip: "zip",
        address: "address",
        "address line 1": "address",
        assigned_to_emp_code: "assigned_to_emp_code",
        "assigned to (emp code)": "assigned_to_emp_code",
        status: "status",
        source: "source",
        email: "email",
        website: "website",
        phone: "phone",
        expected_revenue: "expected_revenue",
        "expected revenue": "expected_revenue",
        priority: "priority",
      };

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Robust CSV parsing that handles commas in quotes
        const values = parseCSVLine(line);
        const item: any = {};

        headers.forEach((header, index) => {
          const fieldName = headerMap[header];
          if (fieldName) {
            item[fieldName] = values[index] || "";
          }
        });

        // Basic validation: skip if required fields are missing
        if (item.name && item.status && item.source && item.phone) {
          items.push(item);
        }
      }

      if (items.length === 0) {
        toast.error("No valid leads found in the CSV file.");
        return;
      }

      importLeadsMutation.mutate(
        { items },
        {
          onSuccess: () => {
            navigate(`/${companyId}/leads`);
          },
        },
      );
    };

    reader.onerror = () => {
      toast.error("Failed to read the file.");
    };

    reader.readAsText(selectedFile);
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-1 py-1.5">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-sm transition-colors hover:bg-muted"
            onClick={() => navigate(`/${companyId}/leads`)}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </Button>
          <div className="space-y-0">
            <h1 className="text-lg font-bold tracking-tight text-foreground">
              Import Leads
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
              CSV Upload & Management
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 rounded-sm"
          onClick={() => downloadDemoMutation.mutate()}
          disabled={downloadDemoMutation.isPending}
        >
          <Download className="h-3.5 w-3.5" />
          <span className="font-bold text-[10px] uppercase tracking-wider">
            {downloadDemoMutation.isPending ? "Downloading..." : "Sample CSV"}
          </span>
        </Button>
      </div>

      <div className="w-full mx-auto space-y-4 animate-fade-in pb-10">
        <div className="mx-auto space-y-2 my-2">
          {/* Instructions Section */}
          <section className="animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="rounded-sm border border-blue-500/10 bg-blue-500/5 p-3 backdrop-blur-sm">
              <div className="mb-2 flex items-center gap-2 text-blue-600">
                <Info className="h-4 w-4" />
                <h2 className="text-xs font-bold uppercase tracking-wider">
                  Import Instructions
                </h2>
              </div>
              <ul className="grid gap-2 md:grid-cols-3">
                <li className="flex gap-2 text-xs leading-tight text-muted-foreground bg-white/40 p-2 rounded-sm border border-white/60">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-[9px] font-bold text-blue-600">
                    1
                  </span>
                  <p>
                    Data must match the column headers in the example table. Use{" "}
                    <strong>UTF-8</strong> encoding.
                  </p>
                </li>
                <li className="flex gap-2 text-xs leading-tight text-muted-foreground bg-white/40 p-2 rounded-sm border border-white/60">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-[9px] font-bold text-blue-600">
                    2
                  </span>
                  <p>
                    Dates should be formatted as <strong>d-m-yyyy</strong>{" "}
                    (e.g., 27-03-2026).
                  </p>
                </li>
                <li className="flex gap-2 text-xs leading-tight text-muted-foreground bg-white/40 p-2 rounded-sm border border-white/60">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-[9px] font-bold text-blue-600">
                    3
                  </span>
                  <p>
                    Leads won't be imported if{" "}
                    <strong>email already exists</strong> (based on validation
                    settings).
                  </p>
                </li>
              </ul>
            </div>
          </section>

          {/* Example Table */}
          <section className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex items-center justify-between">
              <h2 className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground px-1">
                Header Example Preview
              </h2>
            </div>
            <div className="rounded-sm border border-border/60 bg-card p-0 shadow-sm overflow-hidden scale-[0.98] origin-left">
              <DataTable data={sampleData} columns={columns} pageSize={1} />
            </div>
          </section>

          {/* Upload Form */}
          <section className="grid gap-3 md:grid-cols-1 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-4 rounded-sm border border-border/60 bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2 text-primary">
                <FileUp className="h-4 w-4" />
                <h2 className="text-xs font-bold uppercase tracking-wider">
                  Choose CSV File
                </h2>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="csv-file"
                  className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1"
                >
                  Upload Lead Sheet <span className="text-destructive">*</span>
                </Label>
                <div className="relative group">
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    ref={fileInputRef}
                    className="h-10 cursor-pointer border-dashed border-2 bg-muted/30 pt-2.5 group-hover:border-primary/50 transition-all text-xs rounded-sm"
                    onChange={handleFileChange}
                  />
                  {!selectedFile && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-muted-foreground/60 gap-2">
                      <FileUp className="h-3.5 w-3.5" />
                      <span className="text-[10px] uppercase font-bold tracking-tight">
                        Drag & Drop or Click to select
                      </span>
                    </div>
                  )}
                </div>
                {selectedFile && (
                  <div className="mt-2 flex items-center gap-2 rounded-sm bg-green-500/10 px-2 py-1.5 text-[10px] font-medium text-green-600 border border-green-500/20">
                    <CheckCircle2 className="h-3 w-3" />
                    <span className="truncate">
                      Selected: {selectedFile.name} (
                      {(selectedFile.size / 1024).toFixed(2)} KB)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-border mt-4">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-6 font-bold text-[10px] uppercase tracking-widest rounded-sm transition-all active:scale-95"
              onClick={() => navigate(`/${companyId}/leads`)}
            >
              Cancel
            </Button>
            {selectedFile && (
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-6 gap-2 font-bold text-[10px] uppercase tracking-widest rounded-sm border-destructive/20 text-destructive hover:bg-destructive/5 hover:border-destructive/30 transition-all active:scale-95"
                onClick={handleReset}
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </Button>
            )}
            <Button
              size="sm"
              className="h-9 px-10 font-bold text-[10px] uppercase tracking-widest rounded-sm shadow-md shadow-primary/10 transition-all active:scale-95"
              onClick={handleImport}
              disabled={!selectedFile || importLeadsMutation.isPending}
            >
              {importLeadsMutation.isPending ? "Importing..." : "Start Import"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportPage;
