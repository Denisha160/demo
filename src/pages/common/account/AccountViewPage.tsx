import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Search,
  Landmark,
  User,
  Hash,
  MapPin,
  IndianRupee,
} from "lucide-react";
import { STATIC_ACCOUNTS } from "./AccountPage";
import DataTable, { Column } from "@/components/DataTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/ui/DatePickerWithRange";

// Static dummy transactions
const DUMMY_TRANSACTIONS = [
  {
    id: "txn_1",
    date: "2023-11-01",
    description: "Initial Deposit",
    type: "credit",
    amount: 50000,
    balance: 50000,
  },
  {
    id: "txn_2",
    date: "2023-11-05",
    description: "Office Rent",
    type: "debit",
    amount: 12000,
    balance: 38000,
  },
  {
    id: "txn_3",
    date: "2023-11-10",
    description: "Client Payment - ABC Corp",
    type: "credit",
    amount: 25000,
    balance: 63000,
  },
  {
    id: "txn_4",
    date: "2023-11-12",
    description: "Internet Bill",
    type: "debit",
    amount: 1500,
    balance: 61500,
  },
  {
    id: "txn_5",
    date: "2023-11-15",
    description: "Employee Salaries",
    type: "debit",
    amount: 30000,
    balance: 31500,
  },
];

const AccountViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const account = STATIC_ACCOUNTS.find((acc) => acc.id === id);

  // Filter states
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  if (!account) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20">
        <h2 className="text-xl font-bold">Account not found</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  // Filter transactions
  const filteredTransactions = DUMMY_TRANSACTIONS.filter((txn) => {
    const matchesSearch = txn.description
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesType = typeFilter === "all" ? true : txn.type === typeFilter;

    let matchesDate = true;
    if (dateRange?.from) {
      const txnDate = new Date(txn.date);
      txnDate.setHours(0, 0, 0, 0);

      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);

      if (dateRange.to) {
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        matchesDate = txnDate >= fromDate && txnDate <= toDate;
      } else {
        matchesDate = txnDate >= fromDate;
      }
    }

    return matchesSearch && matchesType && matchesDate;
  });

  const columns: Column<(typeof DUMMY_TRANSACTIONS)[0]>[] = [
    {
      key: "date",
      header: "Date",
      sortable: true,
      render: (item) => new Date(item.date).toLocaleDateString(),
    },
    {
      key: "description",
      header: "Description",
      sortable: true,
    },
    {
      key: "type",
      header: "Type",
      render: (item) => (
        <Badge
          variant={item.type === "credit" ? "success" : "destructive"}
          className="uppercase text-[10px]"
        >
          {item.type}
        </Badge>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      render: (item) => (
        <span
          className={`font-semibold ${item.type === "credit" ? "text-green-600" : "text-red-600"}`}
        >
          {item.type === "credit" ? "+" : "-"} ₹
          {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: "balance",
      header: "Balance",
      sortable: true,
      render: (item) => (
        <span className="font-semibold">
          ₹
          {item.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
  ];

  return (
    <div className="w-full mx-auto space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="h-8 text-xs rounded-sm font-bold flex items-center gap-2">
              {account.accountName}
              <Badge
                variant={account.isActive ? "success" : "secondary"}
                className="uppercase text-[10px]"
              >
                {account.isActive ? "Active" : "Inactive"}
              </Badge>
            </h1>
            <p className="text-xs text-muted-foreground font-medium">
              View account details and transaction history
            </p>
          </div>
        </div>
      </div>

      {/* Top Details Grid */}
      <div className="bg-card border border-border shadow-sm rounded-sm p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">
                Bank Details
              </p>
              <p className="font-bold text-sm">{account.bankName}</p>
              <p className="text-[11px] text-muted-foreground">
                {account.accountType} Account
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-muted text-muted-foreground rounded-full flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">
                Account Holder
              </p>
              <p className="font-bold text-sm">
                {account.accountHolderName || "-"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-muted text-muted-foreground rounded-full flex items-center justify-center">
              <Hash className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">
                Account Number
              </p>
              <p className="font-bold text-sm font-mono">
                {account.accountNumber || "-"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-muted text-muted-foreground rounded-full flex items-center justify-center">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">
                Branch & IFSC
              </p>
              <p className="font-bold text-sm">{account.branchName || "-"}</p>
              <p className="text-[11px] text-muted-foreground font-mono">
                {account.ifscCode || "-"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-muted text-muted-foreground rounded-full flex items-center justify-center">
              <Hash className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">
                UPI ID
              </p>
              <p className="font-bold text-sm">{account.upiId || "-"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
              <IndianRupee className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">
                Opening Balance
              </p>
              <p className="font-bold text-xl text-primary">
                ₹
                {Number(account.openingBalance || 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg">Transaction History</h3>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-[250px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-8 text-xs rounded-sm w-full"
            />
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[150px] h-9 text-xs rounded-sm">
              <SelectValue placeholder="Transaction Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="credit">Credit (+)</SelectItem>
              <SelectItem value="debit">Debit (-)</SelectItem>
            </SelectContent>
          </Select>

          <div className="w-full sm:w-[250px]">
            <DatePickerWithRange
              date={dateRange}
              setDate={setDateRange}
              className="h-9"
            />
          </div>

          {(search || typeFilter !== "all" || dateRange) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 text-xs"
              onClick={() => {
                setSearch("");
                setTypeFilter("all");
                setDateRange(undefined);
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Data Table View */}
        <DataTable
          data={filteredTransactions}
          columns={columns}
          pageSize={10}
          idKey="id"
        />
      </div>
    </div>
  );
};

export default AccountViewPage;
