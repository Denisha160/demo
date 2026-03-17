import { useState } from "react";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";

import { useCategoriesCombobox } from "@/hooks/useProductCategories";
import type { CategoryType, ProductCategory } from "../../../types/productCategories";

const categorySchema = z.object({
    name: z.string().min(2, "Category name must be at least 2 characters letters").max(100, "Category name cannot exceed 100 characters"),
    type: z.enum(["main", "sub"]),
    mainCategoryId: z.string().optional(),
}).refine(data => {
    if (data.type === 'sub' && !data.mainCategoryId) {
        return false;
    }
    return true;
}, {
    message: "Please select a main category",
    path: ["mainCategoryId"]
});

interface CategoryModalProps {
    open: boolean;
    onClose: () => void;
    formData: Partial<ProductCategory>;
    setFormData: (data: Partial<ProductCategory>) => void;
    onSave: () => void;
    isPending?: boolean;
    onEdit?: (category: ProductCategory) => void;
}

const CategoryModal = ({
    open,
    onClose,
    formData,
    setFormData,
    onSave,
    isPending = false,
}: CategoryModalProps) => {
    // Fetch all active main categories for the dropdown regardless of parent table pagination
    const { data: mainCategories = [], isLoading: isLoadingCategories } = useCategoriesCombobox({ type: "main" });

    const [errors, setErrors] = useState<{ name?: string; mainCategoryId?: string }>({});

    const isEditing = !!formData.id;

    const handleSave = () => {
        try {
            categorySchema.parse(formData);
            setErrors({});
            onSave();
        } catch (error) {
            if (error instanceof z.ZodError) {
                const newErrors: { name?: string; mainCategoryId?: string } = {};
                error.errors.forEach(err => {
                    if (err.path[0] === 'name') newErrors.name = err.message;
                    if (err.path[0] === 'mainCategoryId') newErrors.mainCategoryId = err.message;
                });
                setErrors(newErrors);
            }
        }
    };

    const handleClose = () => {
        setErrors({});
        onClose();
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            headerBg="bg-primary/10"
            titleClassName="text-primary"
            title={isEditing ? "Edit Category" : "New Category"}
            description={isEditing ? "Modify the product category details." : "Create a new product category."}
            footer={
                <>
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-sm text-sm h-8"
                        onClick={handleClose}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        className="rounded-sm text-sm h-8"
                        onClick={handleSave}
                        disabled={isPending}
                    >
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isPending
                            ? isEditing
                                ? "Saving…"
                                : "Creating…"
                            : isEditing
                                ? "Save Changes"
                                : "Create"}
                    </Button>
                </>
            }
        >
            <div className="space-y-4">
                <div className="grid gap-2">
                    <Label className="text-sm">Category Type</Label>
                    <Select
                        value={formData.type}
                        onValueChange={(value: CategoryType) => {
                            setFormData({
                                ...formData,
                                type: value,
                                mainCategoryId:
                                    value === "main" ? undefined : formData.mainCategoryId,
                            });
                        }}
                        disabled={isPending}
                    >
                        <SelectTrigger className="h-8 text-sm rounded-sm">
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="main">Main Category</SelectItem>
                            <SelectItem value="sub">Sub Category</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Parent picker – only for sub categories */}
                {formData.type === "sub" && (
                    <div className="grid gap-2 animate-in fade-in slide-in-from-top-1">
                        <Label className="text-sm">Main Category</Label>
                        <Combobox
                            options={
                                mainCategories.length > 0
                                    ? mainCategories.map((cat) => ({
                                        value: cat.id,
                                        label: cat.name,
                                    }))
                                    : []
                            }
                            value={formData.mainCategoryId || ""}
                            onValueChange={(value) => {
                                setFormData({ ...formData, mainCategoryId: value });
                                if (errors.mainCategoryId) setErrors({ ...errors, mainCategoryId: undefined });
                            }}
                            placeholder={
                                isLoadingCategories
                                    ? "Loading..."
                                    : mainCategories.length > 0
                                        ? "Select main category"
                                        : "No main categories available"
                            }
                            searchPlaceholder="Search categories..."
                            disabled={isLoadingCategories || mainCategories.length === 0 || isPending}
                        />
                        {errors.mainCategoryId && (
                            <p className="text-[11px] text-destructive">{errors.mainCategoryId}</p>
                        )}
                    </div>
                )}

                {/* Name */}
                <div className="grid gap-2">
                    <Label className="text-sm">Category Name</Label>
                    <Input
                        placeholder="e.g. Electronics"
                        value={formData.name || ""}
                        onChange={(e) => {
                            setFormData({ ...formData, name: e.target.value });
                            if (errors.name) setErrors({ ...errors, name: undefined });
                        }}
                        className={`h-8 text-sm rounded-sm ${errors.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        disabled={isPending}
                        autoFocus
                    />
                    {errors.name && (
                        <p className="text-[11px] text-destructive">{errors.name}</p>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default CategoryModal;
