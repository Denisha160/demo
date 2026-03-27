import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  FileUp,
  Download,
  Info,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { useLeadStatuses } from "@/hooks/useLeadStatus";
import DataTable, { Column } from "@/components/DataTable";
import { toast } from "react-toastify";

const ImportPage = () => {
  const navigate = useNavigate();
  const { companyId } = useParams();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fallbackStatus, setFallbackStatus] = useState("");

  const { data: statusResponse } = useLeadStatuses({ limit: 100 });
  const statusOptions =
    (statusResponse as any)?.items?.map((item: any) => ({
      value: item.id,
      label: item.name,
    })) || [];

  const columns: Column<any>[] = [
    { key: "name", header: "* Name" },
    { key: "email", header: "Email" },
    { key: "phone", header: "* Phone" },
    { key: "alternate_phone", header: "Alt Phone" },
    { key: "designation", header: "Designation" },
    { key: "company_name", header: "Company Name" },
    { key: "description", header: "Description" },
    { key: "country_id", header: "Country" },
    { key: "state_id", header: "State" },
    { key: "city_id", header: "City" },
    { key: "pincode", header: "Pincode" },
    { key: "address_line1", header: "Address Line 1" },
    { key: "address_line2", header: "Address Line 2" },
    { key: "website", header: "Website" },
    { key: "gst_number", header: "GST Number" },
    { key: "pan_number", header: "PAN Number" },
    { key: "priority", header: "Priority" },
    { key: "status_id", header: "* Status" },
    { key: "source_id", header: "* Source" },
    { key: "assigned_to", header: "Assigned To" },
    { key: "expected_revenue", header: "Expected Revenue" },
  ];

  const sampleData = [
    {
      name: "Sample Data",
      email: "69c601bf4bc2c@example.com",
      phone: "9876543210",
      alternate_phone: "9876543211",
      designation: "Sample Data",
      company_name: "Sample Data",
      description: "Sample Data",
      country_id: "Sample Data",
      state_id: "Sample Data",
      city_id: "Sample Data",
      pincode: "Sample Data",
      address_line1: "Sample Data",
      address_line2: "Sample Data",
      website: "Sample Data",
      gst_number: "Sample Data",
      pan_number: "Sample Data",
      priority: "HOT",
      status_id: "Sample Data",
      source_id: "Sample Data",
      assigned_to: "Sample Data",
      expected_revenue: "1000",
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImport = () => {
    if (!selectedFile) {
      toast.error("Please select a CSV file to import.");
      return;
    }
    if (!fallbackStatus) {
      toast.error("Please select a fallback status.");
      return;
    }

    // Logic for actual import would go here
    toast.info("Import functionality would be implemented here.");
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-2 py-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full transition-colors hover:bg-muted"
            onClick={() => navigate(`/${companyId}/leads`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="space-y-0.5">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Import Leads
            </h1>
            <p className="text-xs text-muted-foreground">
              Upload and manage your lead data from CSV files
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10"
          onClick={() => {
            // Logic for downloading sample CSV
            toast.success("Sample CSV download started.");
          }}
        >
          <Download className="h-4 w-4" />
          <span className="font-semibold text-xs">Download Sample CSV</span>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        <div className="mx-auto space-y-2">
          {/* Instructions Section */}
          <section className="animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="rounded-xl border border-blue-500/10 bg-blue-500/5 p-4 backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-2 text-blue-600">
                <Info className="h-5 w-5" />
                <h2 className="font-bold">Import Instructions</h2>
              </div>
              <ul className="grid gap-4 md:grid-cols-1">
                <li className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-[10px] font-bold text-blue-600">
                    1
                  </span>
                  <p>
                    Your CSV data should be in the format below. The first line
                    of your CSV file should be the{" "}
                    <strong>column headers</strong> as in the table example.
                    Also make sure that your file is <strong>UTF-8</strong> to
                    avoid unnecessary <strong>encoding problems</strong>.
                  </p>
                </li>
                <li className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-[10px] font-bold text-blue-600">
                    2
                  </span>
                  <p>
                    If the column{" "}
                    <strong>you are trying to import is date</strong> make sure
                    that is formatted in{" "}
                    <strong>format d-m-yyyy (27-03-2026)</strong>.
                  </p>
                </li>
                <li className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-[10px] font-bold text-blue-600">
                    3
                  </span>
                  <div className="space-y-2">
                    <p>
                      Based on your leads <strong>unique validation</strong>{" "}
                      configured <strong>options</strong>, the lead{" "}
                      <strong>won't be imported</strong> if:
                    </p>
                    <div className="flex items-center gap-2 rounded-lg bg-background/50 px-3 py-2 text-xs font-medium text-destructive">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Lead email already exists
                    </div>
                    <p className="text-[11px] italic">
                      If you still want to import all leads, uncheck all unique
                      validation fields in settings.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          {/* Example Table */}
          <section className="space-y-3 animate-in fade-in slide-in-from-top-6 duration-700">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground">
                Header Example
              </h2>
              <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                Preview Only
              </span>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-1 shadow-sm overflow-hidden">
              <DataTable data={sampleData} columns={columns} pageSize={1} />
            </div>
          </section>

          {/* Upload Form */}
          <section className="grid gap-2 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="space-y-4 rounded-xl border border-border/60 bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 text-primary">
                <FileUp className="h-5 w-5" />
                <h2 className="font-bold">Choose CSV File</h2>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="csv-file"
                  className="text-xs font-bold text-muted-foreground flex items-center gap-1"
                >
                  Upload Lead Sheet <span className="text-destructive">*</span>
                </Label>
                <div className="relative group">
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    className="h-12 cursor-pointer border-dashed border-2 bg-muted/30 pt-3 group-hover:border-primary/50 transition-all text-xs"
                    onChange={handleFileChange}
                  />
                  {!selectedFile && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-muted-foreground/60 gap-2">
                      <FileUp className="h-4 w-4" />
                      <span className="text-xs">
                        Drag and drop or click to upload
                      </span>
                    </div>
                  )}
                </div>
                {selectedFile && (
                  <div className="mt-2 flex items-center gap-2 rounded-lg bg-green-500/10 px-3 py-2 text-[11px] font-medium text-green-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Selected: {selectedFile.name} (
                    {(selectedFile.size / 1024).toFixed(2)} KB)
                  </div>
                )}
              </div>
            </div>

            {/* <div className="space-y-4 rounded-xl border border-border/60 bg-card p-6 shadow-sm">
                            <div className="flex items-center gap-2 text-primary">
                                <CheckCircle2 className="h-5 w-5" />
                                <h2 className="font-bold">Import Configuration</h2>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                                    Status (fallback) <span className="text-destructive">*</span>
                                </Label>
                                <Combobox
                                    options={statusOptions}
                                    value={fallbackStatus}
                                    onValueChange={setFallbackStatus}
                                    placeholder="Select Fallback Status"
                                    className="h-10 w-full"
                                />
                                <p className="text-[10px] text-muted-foreground leading-tight">
                                    This status will be applied if the status column in your CSV is empty or doesn't match existing statuses.
                                </p>
                            </div>
                        </div> */}
          </section>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-8 font-semibold text-sm transition-all active:scale-95"
              onClick={() => navigate(`/${companyId}/leads`)}
            >
              Cancel
            </Button>
            <Button
              size="lg"
              className="h-12 px-12 font-bold text-sm shadow-lg shadow-primary/20 transition-all active:scale-95"
              onClick={handleImport}
              disabled={!selectedFile || !fallbackStatus}
            >
              Start Import Process
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportPage;
