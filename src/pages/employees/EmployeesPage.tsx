import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DataTable, { Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import {
    Users,
    IndianRupee,
    Wallet,
    TrendingUp,
    BarChart3,
    PieChart as PieChartIcon,
    Download,
    Plus,
    Search
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatCard from "@/components/StatCard";
import { useNavigate } from "react-router-dom";

interface Employee {
    id: number;
    name: string;
    email: string;
    role: string;
    department: string;
    salary: string;
    status: string;
    joinDate: string;
}

interface Loan {
    id: number;
    employeeName: string;
    amount: string;
    interest: string;
    duration: string;
    repaid: string;
    status: string;
}

const mockEmployees: Employee[] = [
    { id: 1, name: "John Doe", email: "john@company.com", role: "Sr. Engineer", department: "Engineering", salary: "₹1,20,000", status: "Active", joinDate: "2023-01-15" },
    { id: 2, name: "Sarah Lee", email: "sarah@company.com", role: "Manager", department: "Sales", salary: "₹95,000", status: "Active", joinDate: "2022-06-10" },
    { id: 3, name: "Emma Davis", email: "emma@company.com", role: "Product Designer", department: "Design", salary: "₹85,000", status: "Active", joinDate: "2023-03-22" },
    { id: 4, name: "Mike Chen", email: "mike@company.com", role: "Developer", department: "Engineering", salary: "₹75,000", status: "Probation", joinDate: "2023-11-01" },
    { id: 5, name: "Lisa Wang", email: "lisa@company.com", role: "HR Specialist", department: "HR", salary: "₹65,000", status: "Active", joinDate: "2022-01-05" },
];

const mockLoans: Loan[] = [
    { id: 1, employeeName: "John Doe", amount: "₹50,000", interest: "0%", duration: "10 Months", repaid: "₹20,000", status: "Active" },
    { id: 2, employeeName: "Sarah Lee", amount: "₹1,00,000", interest: "2%", duration: "12 Months", repaid: "₹65,000", status: "Active" },
    { id: 3, employeeName: "Mike Chen", amount: "₹25,000", interest: "0%", duration: "5 Months", repaid: "₹25,000", status: "Settled" },
];

const salaryByDept = [
    { name: "Engineering", value: 195000, color: "hsl(142, 60%, 40%)" },
    { name: "Sales", value: 95000, color: "hsl(217, 91%, 60%)" },
    { name: "Design", value: 85000, color: "hsl(262, 80%, 60%)" },
    { name: "HR", value: 65000, color: "hsl(38, 92%, 50%)" },
];

const EmployeesPage = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const employeeColumns: Column<Employee>[] = [
        {
            key: "name",
            header: "Employee",
            render: (row) => (
                <div
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => navigate(`${row.id}`)}
                >
                    <div className="h-7 w-7 bg-primary/10 text-primary rounded-full flex items-center justify-center text-[10px] font-bold">
                        {row.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-foreground leading-none">{row.name}</p>
                        <p className="text-[11px] text-muted-foreground">{row.email}</p>
                    </div>
                </div>
            )
        },
        { key: "role", header: "Role" },
        { key: "department", header: "Department" },
        { key: "salary", header: "Salary" },
        {
            key: "status",
            header: "Status",
            render: (row) => <StatusBadge status={row.status} variant={row.status === "Active" ? "success" : "warning"} />
        }
    ];

    const filteredEmployees = mockEmployees.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.email.toLowerCase().includes(search.toLowerCase()) ||
        e.role.toLowerCase().includes(search.toLowerCase()) ||
        e.department.toLowerCase().includes(search.toLowerCase())
    );

    const loanColumns: Column<Loan>[] = [
        { key: "employeeName", header: "Employee" },
        { key: "amount", header: "Loan Amount" },
        { key: "interest", header: "Interest" },
        { key: "duration", header: "Duration" },
        { key: "repaid", header: "Repaid" },
        {
            key: "status",
            header: "Status",
            render: (row) => <StatusBadge status={row.status} variant={row.status === "Active" ? "info" : "success"} />
        }
    ];

    return (
        <div className="w-full mx-auto space-y-2 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border pb-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Search employees..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-8 pl-7 text-sm rounded-sm w-full sm:w-56"
                        />
                    </div>
                </div>
            </div>

            <div className="border border-border rounded-sm overflow-hidden bg-card shadow-sm">
                <DataTable data={filteredEmployees} columns={employeeColumns} />
            </div>
        </div>
    );
};

export default EmployeesPage;
