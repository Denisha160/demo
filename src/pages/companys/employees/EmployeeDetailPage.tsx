import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  Briefcase,
  IndianRupee,
  Clock,
  Wallet,
  ArrowLeft,
  Download,
  TrendingUp,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SalaryModal from "./SalaryModal";
import LoanModal from "./LoanModal";
import DataTable, { Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import StatCard from "@/components/StatCard";

// Mock data for a specific employee
const employeeData = {
  id: 1,
  name: "John Doe",
  email: "john.doe@company.com",
  phone: "+91 98765 43210",
  role: "Senior Software Engineer",
  department: "Engineering",
  joinDate: "Jan 15, 2023",
  status: "Active",
  address: "B-402, Green Valley Apartments, Mumbai, Maharashtra",
  salary: "₹1,20,000",
  stats: {
    attendance: "98%",
    pendingLoans: "₹30,000",
    totalBonus: "₹45,000",
  },
};

const attendanceHistory = [
  {
    date: "2024-02-21",
    in: "09:00 AM",
    out: "06:00 PM",
    status: "Present",
    duration: "9h 00m",
  },
  {
    date: "2024-02-20",
    in: "09:05 AM",
    out: "06:15 PM",
    status: "Present",
    duration: "9h 10m",
  },
  {
    date: "2024-02-19",
    in: "09:30 AM",
    out: "06:00 PM",
    status: "Late",
    duration: "8h 30m",
  },
  {
    date: "2024-02-18",
    in: "-",
    out: "-",
    status: "Absent",
    duration: "0h 00m",
  },
  {
    date: "2024-02-17",
    in: "10:00 AM",
    out: "02:00 PM",
    status: "Half Day",
    duration: "4h 00m",
  },
];

const salaryHistory = [
  {
    month: "January 2024",
    basic: "₹1,00,000",
    bonus: "₹10,000",
    deductions: "₹5,000",
    net: "₹1,05,000",
    status: "Paid",
  },
  {
    month: "December 2023",
    basic: "₹1,00,000",
    bonus: "₹5,000",
    deductions: "₹5,000",
    net: "₹1,00,000",
    status: "Paid",
  },
  {
    month: "November 2023",
    basic: "₹1,00,000",
    bonus: "₹0",
    deductions: "₹5,000",
    net: "₹95,000",
    status: "Paid",
  },
];

const loanHistory = [
  {
    id: "LN-101",
    type: "Personal Loan",
    amount: "₹50,000",
    interest: "0%",
    tenure: "10 Months",
    repaid: "₹20,000",
    balance: "₹30,000",
    status: "Active",
  },
  {
    id: "LN-098",
    type: "Advance Salary",
    amount: "₹10,000",
    interest: "0%",
    tenure: "1 Month",
    repaid: "₹10,000",
    balance: "₹0",
    status: "Settled",
  },
];

const EmployeeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [salaryModalOpen, setSalaryModalOpen] = useState(false);
  const [loanModalOpen, setLoanModalOpen] = useState(false);

  const attendanceColumns: Column<(typeof attendanceHistory)[0]>[] = [
    { key: "date", header: "Date" },
    { key: "in", header: "Clock In" },
    { key: "out", header: "Clock Out" },
    { key: "duration", header: "Duration" },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <StatusBadge
          status={row.status}
          variant={
            row.status === "Present"
              ? "success"
              : row.status === "Late"
                ? "warning"
                : row.status === "Absent"
                  ? "destructive"
                  : "info"
          }
        />
      ),
    },
  ];

  const salaryColumns: Column<(typeof salaryHistory)[0]>[] = [
    { key: "month", header: "Month" },
    { key: "basic", header: "Basic" },
    { key: "bonus", header: "Bonus" },
    { key: "deductions", header: "Deductions" },
    {
      key: "net",
      header: "Net Salary",
      className: "font-bold text-foreground",
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} variant="success" />,
    },
  ];

  const loanColumns: Column<(typeof loanHistory)[0]>[] = [
    { key: "type", header: "Loan Type" },
    { key: "amount", header: "Amount" },
    { key: "interest", header: "Interest" },
    { key: "tenure", header: "Tenure" },
    { key: "repaid", header: "Repaid" },
    { key: "balance", header: "Balance", className: "font-bold text-primary" },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <StatusBadge
          status={row.status}
          variant={row.status === "Active" ? "info" : "success"}
        />
      ),
    },
  ];

  return (
    <div className="w-full mx-auto space-y-2 animate-fade-in">
      {/* 1. Navigation & Actions Bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-2">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-sm border border-border shrink-0"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-foreground leading-none truncate uppercase tracking-widest">
              Employee Profile
            </h2>
            <p className="text-[10px] text-muted-foreground mt-1">
              ID: EMP-{id || "001"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            size="sm"
            onClick={() => setSalaryModalOpen(true)}
            className="h-8 text-xs rounded-sm gap-2 flex-1 sm:flex-none text-white bg-primary hover:bg-primary/90 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" /> Process Salary
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setLoanModalOpen(true)}
            className="h-8 text-xs rounded-sm gap-2 flex-1 sm:flex-none text-foreground shadow-sm"
          >
            <Wallet className="h-3.5 w-3.5 text-primary" /> Manage Loan
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs rounded-sm flex-1 sm:flex-none"
          >
            Deactivate
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-sm border border-border text-muted-foreground hover:text-foreground"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <SalaryModal
        open={salaryModalOpen}
        onClose={() => setSalaryModalOpen(false)}
        employeeName={employeeData.name}
        employeeId={id || "001"}
      />

      <LoanModal
        open={loanModalOpen}
        onClose={() => setLoanModalOpen(false)}
        employeeName={employeeData.name}
        employeeId={id || "001"}
      />

      {/* 3. Content Layout wrapped in Tabs */}
      <Tabs defaultValue="overview" className="w-full space-y-4">
        <TabsList className="bg-transparent border-b border-border rounded-none h-11 w-full justify-start gap-2 p-0">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-11 px-1 font-bold text-[10px] uppercase tracking-[0.15em] transition-all"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="attendance"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-11 px-1 font-bold text-[10px] uppercase tracking-[0.15em] transition-all"
          >
            Attendance
          </TabsTrigger>
          <TabsTrigger
            value="salary"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-11 px-1 font-bold text-[10px] uppercase tracking-[0.15em] transition-all"
          >
            Salary History
          </TabsTrigger>
          <TabsTrigger
            value="loans"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-11 px-1 font-bold text-[10px] uppercase tracking-[0.15em] transition-all"
          >
            Loans
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="overview"
          className="space-y-2 animate-in fade-in-50 duration-300"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
            <div className="lg:col-span-2 space-y-2">
              {/* Professional Details Card */}
              <div className="p-5 border border-border rounded-sm bg-card shadow-sm relative group">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-8">
                  <div className="h-14 w-14 bg-primary/10 text-primary rounded-sm flex items-center justify-center text-xl font-bold border border-primary/20 shrink-0">
                    {employeeData.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <h3 className="text-lg font-bold text-foreground truncate leading-tight">
                        {employeeData.name}
                      </h3>
                      <StatusBadge
                        status={employeeData.status}
                        variant="success"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-y-1 gap-x-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5 truncate">
                        <Mail className="h-3.5 w-3.5" /> {employeeData.email}
                      </span>
                      <span className="hidden sm:inline text-muted-foreground/30">
                        |
                      </span>
                      <span className="flex items-center gap-1.5 truncate">
                        <Phone className="h-3.5 w-3.5" /> {employeeData.phone}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-6 gap-x-4 border-t border-border pt-6">
                  <DetailItem label="Role" value={employeeData.role} />
                  <DetailItem
                    label="Department"
                    value={employeeData.department}
                  />
                  <DetailItem
                    label="Date of Joining"
                    value={employeeData.joinDate}
                  />
                  <DetailItem
                    label="Monthly Salary"
                    value={employeeData.salary}
                  />

                  <DetailItem
                    label="Attendance Rate"
                    value={employeeData.stats.attendance}
                  />
                  <DetailItem
                    label="Pending Loans"
                    value={employeeData.stats.pendingLoans}
                  />
                  <DetailItem
                    label="Total Bonus"
                    value={employeeData.stats.totalBonus}
                  />
                  <DetailItem
                    label="Status"
                    value={employeeData.status}
                    badge
                    variant="success"
                  />
                </div>
              </div>

              {/* Personal Information Card */}
              <div className="p-5 border border-border rounded-sm bg-card shadow-sm relative group">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-3.5 w-3.5 text-primary" />
                    <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                      Additional Information
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <DetailItem label="Notice Period" value="60 Days" />
                  <DetailItem label="Probation End" value="Jul 15, 2023" />
                  <DetailItem label="Tax Status" value="Standard" />
                  <div className="md:col-span-3 pt-2">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1.5 tracking-wider">
                      Permanent Address
                    </p>
                    <p className="text-xs font-semibold leading-relaxed text-foreground/80">
                      {employeeData.address}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {/* Stats Summary */}
              <div className="p-5 border border-border rounded-sm bg-card shadow-sm h-full space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                    Performance Metrics
                  </h3>
                </div>

                <StatCard
                  title="Attendance"
                  value={employeeData.stats.attendance}
                  change="Yearly Average"
                  changeType="neutral"
                  icon={<Clock className="h-4 w-4" />}
                />
                <StatCard
                  title="Active Loan"
                  value={employeeData.stats.pendingLoans}
                  change="Repayment ongoing"
                  changeType="neutral"
                  icon={<Wallet className="h-4 w-4" />}
                />
                <StatCard
                  title="Total Bonus"
                  value={employeeData.stats.totalBonus}
                  change="Last 12 months"
                  changeType="positive"
                  icon={<IndianRupee className="h-4 w-4 text-green-600" />}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="attendance"
          className="space-y-4 animate-in fade-in-50 duration-300"
        >
          <div className="border border-border rounded-sm overflow-hidden bg-white shadow-sm">
            <DataTable data={attendanceHistory} columns={attendanceColumns} />
          </div>
        </TabsContent>

        <TabsContent
          value="salary"
          className="space-y-4 animate-in fade-in-50 duration-300"
        >
          <div className="border border-border rounded-sm overflow-hidden bg-white shadow-sm">
            <DataTable data={salaryHistory} columns={salaryColumns} />
          </div>
        </TabsContent>

        <TabsContent
          value="loans"
          className="space-y-4 animate-in fade-in-50 duration-300"
        >
          <div className="border border-border rounded-sm overflow-hidden bg-white shadow-sm">
            <DataTable data={loanHistory} columns={loanColumns} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

/* Helper Component for consistent spacing and responsive text */
const DetailItem = ({
  label,
  value,
  badge,
  variant,
}: {
  label: string;
  value: string;
  badge?: boolean;
  variant?: string;
}) => (
  <div className="space-y-2 min-w-0">
    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold block truncate">
      {label}
    </span>
    {badge ? (
      <div className="flex">
        <StatusBadge status={value} variant={variant} />
      </div>
    ) : (
      <p className="text-sm font-semibold text-foreground truncate">
        {value || "—"}
      </p>
    )}
  </div>
);

export default EmployeeDetailPage;
