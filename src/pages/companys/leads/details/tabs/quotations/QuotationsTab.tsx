import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import DataTable, { Column } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/utils/date";
import QuotationForm, { Quotation, QuotationFormData } from "./QuotationForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const initialQuotations: Quotation[] = [
  {
    id: "1",
    lead_id: "Bell Borer III - kadin.waelchi@example.net",
    quotation_date: "2026-03-20",
    customer_name: "Acme Industries",
    customer_email: "purchase@acme.com",
    customer_phone: "9876543210",
    customer_address: "Bangalore, Karnataka",
    customer_gst: "29ABCDE1234F1Z5",
    customer_pan: "ABCDE1234F",
    items: [
      {
        product_id: "p1",
        product_name: "Product 1",
        quantity: 1,
        rate: 10000,
        amount: 10000,
        tax_rate: 18,
      },
    ],
    total_tax_amount: 1800,
    created_at: new Date().toISOString(),
    amount_in_words: "Eleven thousand eight hundred only",
  },
];

const calculateGrandTotal = (quotation: QuotationFormData) => {
  const itemsTotal = (quotation.items || []).reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0,
  );
  const taxAmount = Number(quotation.total_tax_amount) || 0;
  return itemsTotal + taxAmount;
};

const QuotationsTab = () => {
  const [quotations, setQuotations] = useState<Quotation[]>(initialQuotations);
  const [search, setSearch] = useState("");
  const { companyId, id } = useParams();
  const navigate = useNavigate();
  const [quotationToDelete, setQuotationToDelete] = useState<Quotation | null>(
    null,
  );

  const filteredQuotations = quotations.filter((quotation) => {
    const query = search.toLowerCase();
    return (
      quotation.customer_name?.toLowerCase().includes(query) ||
      quotation.customer_email?.toLowerCase().includes(query)
    );
  });

  const handleCreate = () => {
    navigate(`/${companyId}/leads/${id}/quotations/new`);
  };

  const handleEdit = (quotation: Quotation) => {
    navigate(`/${companyId}/leads/${id}/quotations/${quotation.id}/edit`);
  };

  const handleDelete = (id: string) => {
    setQuotations((prev) => prev.filter((quotation) => quotation.id !== id));
    setQuotationToDelete(null);
  };

  const columns: Column<Quotation>[] = [
    {
      key: "customer_name",
      header: "Customer",
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-medium text-sm">{item.customer_name}</span>
          <span className="text-[10px] text-muted-foreground">
            {item.customer_email}
          </span>
        </div>
      ),
    },
    {
      key: "quotation_date",
      header: "Date",
      render: (item) => (
        <span className="text-sm">{formatDate(item.quotation_date)}</span>
      ),
    },
    {
      key: "items",
      header: "Items",
      render: (item) => (
        <span className="text-sm">{(item.items || []).length} Items</span>
      ),
    },
    {
      key: "id",
      header: "Grand Total",
      render: (item) => (
        <span className="text-sm font-medium">
          ₹{calculateGrandTotal(item).toLocaleString()}
        </span>
      ),
    },
    {
      key: "id",
      header: "Actions",
      render: (item) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-sm hover:bg-primary/10 hover:text-primary"
            onClick={() => handleEdit(item)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setQuotationToDelete(item)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full animate-fade-in rounded-lg border border-border/50 bg-card p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Button size="sm" className="h-9 gap-2 px-4" onClick={handleCreate}>
          <Plus className="h-4 w-4" />
          New Quotation
        </Button>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search quotations..."
            className="h-9 w-[260px] pl-9 text-sm"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <DataTable columns={columns} data={filteredQuotations} pageSize={10} />

      <AlertDialog
        open={!!quotationToDelete}
        onOpenChange={(open) => !open && setQuotationToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this quotation for "
              {quotationToDelete?.customer_name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                quotationToDelete && handleDelete(quotationToDelete.id)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default QuotationsTab;
