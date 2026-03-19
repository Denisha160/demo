import { useState } from "react";
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

// Dummy Products
const productOptions = [
    { id: "1", product: "Laptop", quantity: 2, amount: 50000, interestLevel: "High" },
    { id: "2", product: "Mobile", quantity: 5, amount: 20000, interestLevel: "Medium" },
    { id: "3", product: "Headphones", quantity: 10, amount: 2000, interestLevel: "Low" },
];

const ProductsTab = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [selectedId, setSelectedId] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState("");
    const [productToDelete, setProductToDelete] = useState<any | null>(null);

    // 🔥 Direct add on select
    const handleSelect = (value: string) => {
        setSelectedId(value);

        const selected = productOptions.find((p) => p.id === value);
        if (!selected) return;

        // prevent duplicates
        if (products.some((p) => p.id === selected.id)) return;

        setProducts((prev) => [selected, ...prev]);
    };

    const handleDelete = (id: string) => {
        setProducts((prev) => prev.filter((item) => item.id !== id));
        setProductToDelete(null);
    };

    const filteredData = products.filter((item) =>
        item.product.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns: Column<any>[] = [
        { key: "product", header: "Product" },
        { key: "quantity", header: "Quantity" },
        { key: "amount", header: "Amount" },
        { key: "interestLevel", header: "Interest Level" },
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
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="bg-card rounded-lg border border-border/50 shadow-sm p-4 w-full animate-fade-in">
            {/* Top Controls */}
            <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
                {/* Combobox only (no Add button) */}
                <div className="space-y-1.5 flex flex-col">
                    <Label className="text-xs font-bold text-foreground">Product</Label>
                    <Combobox
                        options={productOptions.map((p) => ({ value: p.id, label: p.product }))}
                        value={selectedId}
                        onValueChange={handleSelect}
                        placeholder="Select product"
                        className="h-9 w-[200px]"
                    />
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search products..."
                        className="h-9 pl-9 w-[250px] text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* DataTable */}
            <DataTable columns={columns} data={filteredData} pageSize={10} />

            {/* Delete Modal */}
            <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the product "{productToDelete?.product}".
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => productToDelete && handleDelete(productToDelete.id)}
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

export default ProductsTab;