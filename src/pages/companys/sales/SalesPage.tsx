import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Search, Users, ChevronRight, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUsers } from "@/hooks/useUsers";
import { useDebounce } from "@/hooks/useDebounce";
import DataTable, { Column, SortDirection } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { cn } from "@/lib/utils";

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const SalesPage = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const { data: usersData, isLoading } = useUsers({
    search: debouncedSearch || undefined,
    offset: (page - 1) * limit,
    limit,
    sort_by: sortKey || undefined,
    sort_direction: sortDirection || undefined,
  });

  const users = (usersData as any)?.items || [];
  const totalItems = (usersData as any)?.pagination?.total || 0;

  const columns: Column<any>[] = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-sm bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-xs uppercase">
            {getInitials(item.name || "UN")}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-foreground truncate">
              {item.name}
            </span>
            <span className="text-[10px] text-muted-foreground truncate md:hidden">
              {item.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      sortable: true,
      className: "hidden md:table-cell",
    },
    {
      key: "phone_number",
      header: "Phone",
      className: "hidden lg:table-cell",
      render: (item) => item.phone_number || "-",
    },
    {
      key: "department",
      header: "Department",
      render: (item) => item.department || "-",
      className: "hidden xl:table-cell",
    },
    {
      key: "role_assignments",
      header: "Company & Role",
      render: (item) => (
        <div className="flex flex-wrap gap-1.5 max-w-[240px]">
          {item.role_assignments?.map((a: any, i: number) => (
            <div
              key={i}
              className="flex items-center gap-1.5 text-[10px] bg-muted/40 text-muted-foreground px-1.5 py-0.5 rounded-xs font-medium whitespace-nowrap border border-border/50 group/role hover:border-primary/30 transition-colors"
              title={`${a.company} · ${a.role}`}
            >
              <span className="text-primary font-bold">{a.company}</span>
              <span className="text-muted-foreground/30">|</span>
              <span className="uppercase tracking-tight text-foreground/70">
                {a.role}
              </span>
            </div>
          ))}
          {!item.role_assignments?.length && (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      ),
    },
    {
      key: "is_active",
      header: "Status",
      className: "w-[100px]",
      render: (item) => (
        <StatusBadge
          status={item.is_active ? "Active" : "Inactive"}
          variant={item.is_active ? "success" : "destructive"}
        />
      ),
    },
  ];

  return (
    <div className="w-full space-y-4 animate-fade-in pb-10">

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              className="pl-8 h-8 text-xs rounded-sm"
              placeholder="Search members…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          {search && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-card rounded-md border border-border/50 shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={users}
          isLoading={isLoading}
          onRowClick={(item) => navigate(`/${companyId}/sales/${item.id}`)}
          serverSide={true}
          serverTotal={totalItems}
          serverPage={page}
          serverSortKey={sortKey || undefined}
          serverSortDirection={sortDirection}
          onServerPageChange={setPage}
          onServerPageSizeChange={(newSize) => {
            setLimit(newSize);
            setPage(1);
          }}
          onServerSortChange={(key, direction) => {
            setSortKey(key);
            setSortDirection(direction);
            setPage(1);
          }}
        />
      </div>
    </div>
  );
};

export default SalesPage;
