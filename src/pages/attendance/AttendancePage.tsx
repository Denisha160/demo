import { useState, useMemo } from "react";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePickerWithRange } from "@/components/ui/DatePickerWithRange";
import { DateRange } from "react-day-picker";
import DataTable, { Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { Combobox } from "@/components/ui/combobox";
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from "date-fns";

interface AttendanceRecord {
    id: number;
    userName: string;
    userEmail: string;
    date: string;
    clockIn: string;
    clockOut: string;
    duration: string;
    status: string;
}

const mockAttendance: AttendanceRecord[] = [
    { id: 1, userName: "John Doe", userEmail: "john@company.com", date: "2024-02-21", clockIn: "09:00 AM", clockOut: "06:00 PM", duration: "9h 00m", status: "Present" },
    { id: 2, userName: "Sarah Lee", userEmail: "sarah@company.com", date: "2024-02-21", clockIn: "09:15 AM", clockOut: "06:30 PM", duration: "9h 15m", status: "Late" },
    { id: 3, userName: "Emma Davis", userEmail: "emma@company.com", date: "2024-02-21", clockIn: "08:45 AM", clockOut: "05:45 PM", duration: "9h 00m", status: "Present" },
    { id: 4, userName: "John Doe", userEmail: "john@company.com", date: "2024-02-20", clockIn: "09:05 AM", clockOut: "06:05 PM", duration: "9h 00m", status: "Present" },
    { id: 5, userName: "Mike Chen", userEmail: "mike@company.com", date: "2024-02-21", clockIn: "-", clockOut: "-", duration: "0h 00m", status: "Absent" },
    { id: 6, userName: "Lisa Wang", userEmail: "lisa@company.com", date: "2024-02-19", clockIn: "09:00 AM", clockOut: "06:00 PM", duration: "9h 00m", status: "Present" },
    { id: 7, userName: "Alex Kim", userEmail: "alex@company.com", date: "2024-02-21", clockIn: "09:30 AM", clockOut: "06:00 PM", duration: "8h 30m", status: "Late" },
];

const AttendancePage = () => {
    const [search, setSearch] = useState("");
    const [userFilter, setUserFilter] = useState("all-users");
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    const users = useMemo(() => {
        const uniqueUsers = Array.from(new Set(mockAttendance.map(a => a.userName)));
        return uniqueUsers.sort();
    }, []);

    const filteredData = useMemo(() => {
        return mockAttendance.filter((record) => {
            const matchesSearch = record.userName.toLowerCase().includes(search.toLowerCase()) ||
                record.userEmail.toLowerCase().includes(search.toLowerCase());

            const matchesUser = userFilter === "all-users" || record.userName === userFilter;

            let matchesDate = true;
            if (dateRange?.from) {
                const recordDate = parseISO(record.date);
                const from = startOfDay(dateRange.from);
                const to = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
                matchesDate = isWithinInterval(recordDate, { start: from, end: to });
            }

            return matchesSearch && matchesUser && matchesDate;
        });
    }, [search, userFilter, dateRange]);

    const columns: Column<AttendanceRecord>[] = [
        {
            key: "userName",
            header: "Employee",
            render: (row) => (
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 bg-primary/10 text-primary rounded-full flex items-center justify-center text-[10px] font-bold">
                        {row.userName.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-foreground leading-none">{row.userName}</p>
                        <p className="text-[11px] text-muted-foreground">{row.userEmail}</p>
                    </div>
                </div>
            )
        },
        { key: "date", header: "Date", render: (row) => format(parseISO(row.date), "MMM dd, yyyy") },
        { key: "clockIn", header: "Clock In" },
        { key: "clockOut", header: "Clock Out" },
        { key: "duration", header: "Duration" },
        {
            key: "status",
            header: "Status",
            render: (row) => (
                <StatusBadge
                    status={row.status}
                    variant={
                        row.status === "Present" ? "success" :
                            row.status === "Late" ? "warning" :
                                "destructive"
                    }
                />
            )
        }
    ];

    return (
        <div className="w-full mx-auto space-y-2 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border pb-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                        <Input
                            placeholder="Search employee..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-9 pl-9 text-sm rounded-sm bg-background border-border"
                        />
                    </div>

                    <Combobox
                        options={[
                            { value: "all-users", label: "All Users" },
                            ...users.map(u => ({ value: u, label: u }))
                        ]}
                        value={userFilter}
                        onValueChange={setUserFilter}
                        placeholder="All Users"
                        searchPlaceholder="Search employee..."
                        className="w-full sm:w-[200px] h-9"
                    />

                    <div className="flex-1 sm:flex-none min-w-[260px]">
                        <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                    </div>
                </div>

                <Button variant="outline" size="sm" className="h-9 rounded-sm gap-2" onClick={() => {
                    setSearch("");
                    setUserFilter("all-users");
                    setDateRange(undefined);
                }}>
                    Reset Filters
                </Button>
            </div>

            {/* Table */}
            <div className="border border-border rounded-sm overflow-hidden bg-white shadow-sm">
                <DataTable data={filteredData} columns={columns} pageSize={10} />
            </div>
        </div>
    );
};

export default AttendancePage;
