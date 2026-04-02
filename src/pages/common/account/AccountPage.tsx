import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Eye, Plus, Search, Trash2, Landmark, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AccountFormModal from "./AccountFormModal";
import { useNavigate } from "react-router-dom";

export interface BankAccount {
  id: string;
  accountName: string;
  accountHolderName: string;
  accountNumber: string;
  accountType: string;
  bankName: string;
  branchName: string;
  ifscCode: string;
  upiId: string;
  openingBalance: number;
  isActive: boolean;
  created_at: string;
}

export const STATIC_ACCOUNTS: BankAccount[] = [
  {
    id: "1",
    accountName: "Main Operations Account",
    accountHolderName: "John Doe",
    accountNumber: "1234567890",
    accountType: "Current",
    bankName: "HDFC Bank",
    branchName: "Downtown",
    ifscCode: "HDFC0001234",
    upiId: "john@hdfc",
    openingBalance: 50000,
    isActive: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    accountName: "Savings Flex",
    accountHolderName: "Jane Smith",
    accountNumber: "0987654321",
    accountType: "Savings",
    bankName: "ICICI Bank",
    branchName: "Uptown",
    ifscCode: "ICIC0005678",
    upiId: "jane@icici",
    openingBalance: 15000,
    isActive: true,
    created_at: new Date().toISOString(),
  },
];

const AccountPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(
    null,
  );

  const [accounts, setAccounts] = useState<BankAccount[]>(STATIC_ACCOUNTS);

  // Static filtering
  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch =
      acc.accountName.toLowerCase().includes(search.toLowerCase()) ||
      acc.bankName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      filterStatus === "all"
        ? true
        : filterStatus === "active"
          ? acc.isActive
          : !acc.isActive;
    return matchesSearch && matchesStatus;
  });

  const hasFilters = Boolean(search || filterStatus !== "all");

  const handleClearFilters = () => {
    setSearch("");
    setFilterStatus("all");
  };

  const handleCreateNew = () => {
    setEditingAccount(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (accountId: string) => {
    const acc = accounts.find((a) => a.id === accountId);
    if (acc) {
      setEditingAccount(acc);
      setIsFormModalOpen(true);
    }
  };

  const handleSaveAccount = (data: any) => {
    if (editingAccount) {
      // Update existing
      setAccounts(
        accounts.map((acc) =>
          acc.id === editingAccount.id
            ? { ...acc, ...data, isActive: acc.isActive }
            : acc,
        ),
      );
    } else {
      // Add new
      const newAccount: BankAccount = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
        isActive: true,
        created_at: new Date().toISOString(),
      };
      setAccounts([...accounts, newAccount]);
    }
    setIsFormModalOpen(false);
    setEditingAccount(null);
  };

  return (
    <div className="w-full mx-auto space-y-4 animate-fade-in pb-10">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border pb-2">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto text-sm">
          {/* Search */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search Accounts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-7 text-xs rounded-sm w-full sm:w-[200px]"
            />
          </div>

          {/* Status Filter */}
          <Select
            value={filterStatus}
            onValueChange={(v) => setFilterStatus(v)}
          >
            <SelectTrigger className="w-[120px] h-8 text-xs rounded-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear filters */}
          {hasFilters && (
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted gap-1 transition-opacity duration-300"
              >
                <X className="h-3 w-3" />
                Clear
              </Button>
            </div>
          )}
        </div>

        {/* Create button */}
        <Button
          size="sm"
          className="h-8 text-xs rounded-sm gap-2 flex-1 sm:flex-none"
          onClick={handleCreateNew}
        >
          <Plus className="h-4 w-4" />
          Add Account
        </Button>
      </div>

      {/* List View */}
      {filteredAccounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAccounts.map((account) => (
            <div
              key={account.id}
              className="group relative flex flex-col bg-card border border-border rounded-sm shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer"
              onClick={() => navigate(account.id)}
            >
              <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                <Landmark className="h-16 w-16" />
              </div>

              <div className="p-5 flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <Badge
                    variant={account.isActive ? "success" : "secondary"}
                    className="rounded-sm px-2 py-0 text-[10px] uppercase tracking-wider font-bold"
                  >
                    {account.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <span className="text-[10px] font-mono font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded uppercase tracking-tighter">
                    {account.accountType}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-base text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-1 flex items-center gap-2">
                    {account.accountName}
                  </h3>
                  <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5 pt-1">
                    <Landmark className="h-3 w-3" />
                    {account.bankName} - {account.accountNumber}
                  </p>
                </div>

                <div className="pt-3 border-t border-border/50">
                  <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">
                    Opening Balance
                  </p>
                  <p className="text-sm font-bold text-primary">
                    ₹
                    {Number(account.openingBalance || 0).toLocaleString(
                      undefined,
                      { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                    )}
                  </p>
                </div>
              </div>

              <div className="px-5 py-3 bg-muted/20 border-t border-border flex items-center justify-between z-10">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-[11px] font-semibold text-primary hover:bg-primary/20 gap-1.5 rounded-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(account.id);
                  }}
                >
                  <Eye className="h-3.5 w-3.5" />
                  View Details
                </Button>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted rounded-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(account.id);
                    }}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAccounts(accounts.filter((a) => a.id !== account.id));
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border rounded-sm bg-muted/5">
          <div className="h-16 w-16 bg-primary/5 rounded-sm flex items-center justify-center mb-4 text-primary/40">
            <Landmark className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-foreground">
            No accounts found
          </h3>
          <p className="text-sm text-muted-foreground max-w-[300px] text-center mt-1">
            You haven't added any bank accounts yet or none match the filters.
          </p>
          <Button
            className="mt-6 gap-2 font-semibold text-xs h-9"
            onClick={handleCreateNew}
          >
            <Plus className="h-4 w-4" /> Add Account
          </Button>
        </div>
      )}
      {isFormModalOpen && (
        <AccountFormModal
          open={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          accountData={editingAccount}
          isEditing={!!editingAccount}
          onSave={handleSaveAccount}
        />
      )}
    </div>
  );
};

export default AccountPage;
