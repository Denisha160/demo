import { useState } from "react";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import DataTable, { Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/utils/date";
import QuotationModal, {
  Quotation,
  QuotationFormData,
} from "./QuotationsModal";
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
    quotation_number: "QT-2026-1024",
    quotation_date: "2026-03-20",
    valid_until: "2026-03-31",
    status: "DRAFT",
    customer_name: "Acme Industries",
    customer_email: "purchase@acme.com",
    customer_phone: "9876543210",
    customer_address: "Bangalore, Karnataka",
    customer_gst: "29ABCDE1234F1Z5",
    customer_pan: "ABCDE1234F",
    contact_person_id: "",
    contact_person_name: "Rahul Sharma",
    contact_person_email: "rahul@acme.com",
    contact_person_phone: "9876501234",
    contact_person_designation: "Procurement Manager",
    subtotal: 12000,
    discount_type: "PERCENTAGE",
    discount_value: 10,
    tax_details: [
      { key: "CGST", value: 1080 },
      { key: "SGST", value: 1080 },
    ],
    total_tax_amount: 2160,
    additional_charges: [{ key: "Packing", value: 250 }],
    total_additional_charges: 750,
    amount_in_words: "Thirteen thousand seven hundred ten only",
    payment_terms: "NET_30",
    payment_terms_custom: "",
    delivery_terms: "PAID_DELIVERY",
    delivery_terms_custom: "",
    delivery_charges: 500,
    delivery_address: "Peenya Industrial Area, Bangalore",
    expected_delivery_date: "2026-03-28",
    notes: "Please confirm before dispatch.",
    accepted_at: "",
    accepted_by: "",
    rejected_reason: "",
    cancelled_reason: "",
    requires_approval: true,
    approval_status: "PENDING",
    approved_by: "",
    approved_at: "",
    approval_remarks: "",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    quotation_number: "QT-2026-2048",
    quotation_date: "2026-03-18",
    valid_until: "2026-03-25",
    status: "SENT",
    customer_name: "Basalt Retail",
    customer_email: "ops@basaltretail.com",
    customer_phone: "9988776655",
    customer_address: "Chennai, Tamil Nadu",
    customer_gst: "",
    customer_pan: "",
    contact_person_id: "",
    contact_person_name: "Priya Nair",
    contact_person_email: "priya@basaltretail.com",
    contact_person_phone: "9988776644",
    contact_person_designation: "Operations Lead",
    subtotal: 8500,
    discount_type: "FIXED",
    discount_value: 500,
    tax_details: [{ key: "GST", value: 1440 }],
    total_tax_amount: 1440,
    additional_charges: [],
    total_additional_charges: 0,
    amount_in_words: "Nine thousand four hundred forty only",
    payment_terms: "ADVANCE",
    payment_terms_custom: "100% advance",
    delivery_terms: "FREE_DELIVERY",
    delivery_terms_custom: "",
    delivery_charges: 0,
    delivery_address: "Guindy, Chennai",
    expected_delivery_date: "2026-03-22",
    notes: "",
    accepted_at: "",
    accepted_by: "",
    rejected_reason: "",
    cancelled_reason: "",
    requires_approval: false,
    approval_status: "",
    approved_by: "",
    approved_at: "",
    approval_remarks: "",
    created_at: new Date().toISOString(),
  },
];

const formatEnumLabel = (value: string) =>
  value
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");

const calculateGrandTotal = (quotation: QuotationFormData) => {
  const subtotal = quotation.subtotal || 0;
  const discountValue = quotation.discount_value || 0;
  const discountAmount =
    quotation.discount_type === "PERCENTAGE"
      ? (subtotal * discountValue) / 100
      : quotation.discount_type === "FIXED"
        ? discountValue
        : 0;

  return (
    subtotal -
    discountAmount +
    (quotation.total_tax_amount || 0) +
    (quotation.total_additional_charges || 0)
  );
};

const QuotationsTab = () => {
  const [quotations, setQuotations] = useState<Quotation[]>(initialQuotations);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(
    null,
  );
  const [quotationToDelete, setQuotationToDelete] = useState<Quotation | null>(
    null,
  );

  const filteredQuotations = quotations.filter((quotation) => {
    const query = search.toLowerCase();
    return (
      quotation.quotation_number.toLowerCase().includes(query) ||
      quotation.customer_name.toLowerCase().includes(query) ||
      quotation.status.toLowerCase().includes(query)
    );
  });

  const handleCreate = () => {
    setEditingQuotation(null);
    setIsModalOpen(true);
  };

  const handleEdit = (quotation: Quotation) => {
    setEditingQuotation(quotation);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setQuotations((prev) => prev.filter((quotation) => quotation.id !== id));
    setQuotationToDelete(null);
  };

  const handleSaveQuotation = (formData: QuotationFormData) => {
    if (editingQuotation) {
      setQuotations((prev) =>
        prev.map((quotation) =>
          quotation.id === editingQuotation.id
            ? {
                ...quotation,
                ...formData,
              }
            : quotation,
        ),
      );
    } else {
      const newQuotation: Quotation = {
        ...formData,
        id: Math.random().toString(36).slice(2, 11),
        created_at: new Date().toISOString(),
      };
      setQuotations((prev) => [newQuotation, ...prev]);
    }

    setIsModalOpen(false);
  };

  const getStatusVariant = (status: Quotation["status"]) => {
    switch (status) {
      case "ACCEPTED":
        return "success";
      case "SENT":
      case "VIEWED":
      case "REVISED":
        return "info";
      case "DRAFT":
      case "EXPIRED":
        return "warning";
      case "REJECTED":
      case "CANCELLED":
        return "destructive";
      default:
        return "default";
    }
  };

  const columns: Column<Quotation>[] = [
    {
      key: "quotation_number",
      header: "Quotation",
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-medium text-sm">{item.quotation_number}</span>
          <span className="text-[10px] text-muted-foreground">
            {item.customer_name}
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
      key: "valid_until",
      header: "Valid Until",
      render: (item) => (
        <span className="text-sm">{formatDate(item.valid_until)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <StatusBadge
          status={formatEnumLabel(item.status).toUpperCase()}
          variant={getStatusVariant(item.status)}
        />
      ),
    },
    {
      key: "requires_approval",
      header: "Approval",
      render: (item) => (
        <StatusBadge
          status={item.requires_approval ? "REQUIRED" : "NOT REQUIRED"}
          variant={item.requires_approval ? "warning" : "success"}
        />
      ),
    },
    {
      key: "subtotal",
      header: "Grand Total",
      render: (item) => (
        <span className="text-sm font-medium">
          {calculateGrandTotal(item).toFixed(2)}
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

      {isModalOpen && (
        <QuotationModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          quotationData={editingQuotation}
          onSave={handleSaveQuotation}
        />
      )}

      <AlertDialog
        open={!!quotationToDelete}
        onOpenChange={(open) => !open && setQuotationToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete quotation "
              {quotationToDelete?.quotation_number}". This action cannot be
              undone.
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
