import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import DataTable, { Column } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatusBadge from "@/components/StatusBadge";
import { ArrowLeft, Loader2, Search } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useShiftDetails } from "@/hooks/useShifts";
import { ShiftUser } from "@/types/shift";

const ShiftDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    const param = searchParams.get("search") || "";
    setSearch(param);
  }, [searchParams]);

  useEffect(() => {
    const current = searchParams.get("search") || "";
    if (current === debouncedSearch) return;
    const nextParams = new URLSearchParams(searchParams);
    if (debouncedSearch) {
      nextParams.set("search", debouncedSearch);
    } else {
      nextParams.delete("search");
    }
    setSearchParams(nextParams, { replace: true });
  }, [debouncedSearch, searchParams, setSearchParams]);

  const shiftId = id || "";
  const { data, isLoading, error } = useShiftDetails(shiftId);
  const shift = data?.shift;
  const users = data?.users || [];
  const userCount = data?.total_users ?? users.length;

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const term = search.trim().toLowerCase();
    return users.filter((user) =>
      [user.name, user.email, user.phone_number, user.employee_code, user.department, user.region]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(term)),
    );
  }, [search, users]);

  const userColumns: Column<ShiftUser>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Name",
        render: (user) => (
          <div className="flex flex-col min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
            <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
          </div>
        ),
      },
      {
        key: "employee_code",
        header: "Emp Code",
        render: (user) => (
          <p className="text-sm text-foreground/80">{user.employee_code || "—"}</p>
        ),
      },
      {
        key: "phone_number",
        header: "Phone",
        render: (user) => (
          <p className="text-sm text-foreground/80">{user.phone_number || "—"}</p>
        ),
      },
      {
        key: "department",
        header: "Department",
        render: (user) => (
          <p className="text-sm text-foreground/80">{user.department || "—"}</p>
        ),
      },
      {
        key: "is_active",
        header: "Status",
        render: (user) => (
          <StatusBadge
            status={user.is_active ? "Active" : "Inactive"}
            variant={user.is_active ? "success" : "destructive"}
          />
        ),
      },
      {
        key: "created_at",
        header: "Created",
        render: (user) => (
          <p className="text-sm text-foreground/80">
            {new Date(user.created_at).toLocaleString()}
          </p>
        ),
      },
    ],
    [],
  );

  if (!shiftId) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-sm text-muted-foreground">Shift ID is missing.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading shift data...</p>
      </div>
    );
  }

  if (error || !shift) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <p className="text-sm text-muted-foreground">Unable to load shift details.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => navigate("/admin/shifts")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{shift.name}</h2>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search users"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-8 pl-7 text-sm rounded-sm w-full sm:w-[240px]"
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="border border-border rounded-sm p-4 bg-card">
          <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">Duration</p>
          <p className="text-lg font-semibold text-foreground">
            {shift.start_time} — {shift.end_time}
          </p>
        </div>
        <div className="border border-border rounded-sm p-4 bg-card">
          <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">Status</p>
          <StatusBadge
            status={shift.is_active ? "Active" : "Inactive"}
            variant={shift.is_active ? "success" : "destructive"}
            className="mt-1"
          />
        </div>
        <div className="border border-border rounded-sm p-4 bg-card">
          <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">Assigned users</p>
          <p className="text-2xl font-semibold text-foreground">{userCount}</p>
        </div>
      </div>



      <div className="border border-border rounded-sm overflow-hidden bg-card shadow-sm">
        <DataTable
          data={filteredUsers}
          columns={userColumns}
          onRowClick={(user) => navigate(`/admin/users/${user.id}`)}
        />
      </div>
    </div>
  );
};

export default ShiftDetailPage;
