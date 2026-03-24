import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DataTable, { Column } from "@/components/DataTable";
import { Combobox } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
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
import {
  useLeadInterestedProducts,
  useAddInterestedProduct,
  useRemoveInterestedProduct,
} from "@/hooks/useLeadInterestedProducts";
import { useProductsCombobox } from "@/hooks/useProducts";
import { useDebounce } from "@/hooks/useDebounce";
import { InterestedProduct } from "@/types/interestedProducts";
import { toast } from "react-toastify";

const ProductsTab = () => {
  const { id: leadId = "", companyId = "" } = useParams<{
    id: string;
    companyId: string;
  }>();
  const navigate = useNavigate();

  const [productSearch, setProductSearch] = useState("");
  const debouncedSearch = useDebounce(productSearch, 300);

  const { data: interestedProducts = [], isLoading } =
    useLeadInterestedProducts(leadId);
  const { data: allProducts = [] } = useProductsCombobox({
    status: "active",
    search: debouncedSearch.trim() || undefined,
  });

  const addProductMutation = useAddInterestedProduct();
  const removeProductMutation = useRemoveInterestedProduct();

  const [searchTerm, setSearchTerm] = useState("");
  const [productToDelete, setProductToDelete] =
    useState<InterestedProduct | null>(null);

  const handleSelect = (productId: string) => {
    if (!productId || !leadId) return;

    // prevent duplicates
    if (interestedProducts.some((p) => p.id === productId)) {
      toast.info("This product is already in the interested products list");
      return;
    }

    addProductMutation.mutate({ leadId, productId });
  };

  const handleDelete = (productId: string) => {
    if (!leadId) return;
    removeProductMutation.mutate(
      { leadId, productId },
      {
        onSuccess: () => setProductToDelete(null),
      },
    );
  };

  const filteredData = interestedProducts.filter(
    (item) =>
      item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const columns: Column<InterestedProduct>[] = [
    {
      key: "product_name",
      header: "Product",
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-bold text-foreground text-xs">
            {item.product_name}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">
            #{item.code}
          </span>
        </div>
      ),
    },
    {
      key: "selling_price",
      header: "Price",
      render: (item) => (
        <span className="font-mono font-bold text-primary text-xs">
          ₹
          {Number(item.selling_price || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
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
            className="h-8 w-8 hover:text-destructive hover:bg-destructive/10 rounded-sm text-destructive"
            onClick={() => setProductToDelete(item)}
            disabled={removeProductMutation.isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-card rounded-lg border border-border/50 shadow-sm p-4 w-full animate-fade-in">
      {/* Minimal Header Layout */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Add Product
            </Label>
            <Combobox
              options={allProducts.map((p) => ({
                value: p.id!,
                label: `${p.product_name} (${p.code})`,
              }))}
              value=""
              onValueChange={handleSelect}
              placeholder="Find products to add..."
              searchPlaceholder="Search product name or SKU..."
              className="h-9 w-[300px] text-xs"
              searchValue={productSearch}
              onSearchChange={setProductSearch}
              disabled={addProductMutation.isPending}
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Search List
          </Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter current products..."
              className="h-9 pl-9 w-[280px] text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={filteredData}
        pageSize={10}
        isLoading={isLoading}
        onRowClick={(item) => navigate(`/${companyId}/products/${item.id}`)}
      />

      {/* Delete Modal */}
      <AlertDialog
        open={!!productToDelete}
        onOpenChange={(open) => !open && setProductToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove "{productToDelete?.product_name}" from the lead's
              interested products.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                productToDelete && handleDelete(productToDelete.id)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={removeProductMutation.isPending}
            >
              {removeProductMutation.isPending ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductsTab;
