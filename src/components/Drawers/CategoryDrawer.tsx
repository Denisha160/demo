import { useState, useCallback } from "react";
import { z } from "zod";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { Plus, X, Search, Loader2, ArrowLeft, Edit2 } from "lucide-react";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useCategoriesCombobox,
} from "@/hooks/useProductCategories";
import { ProductCategory, CategoryType } from "@/types/productCategories";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const categorySchema = z
  .object({
    name: z
      .string()
      .min(2, "Category name must be at least 2 characters")
      .max(100, "Category name cannot exceed 100 characters"),
    type: z.enum(["main", "sub"]),
    mainCategoryId: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.type === "sub" && !data.mainCategoryId) {
        return false;
      }
      return true;
    },
    {
      message: "Please select a main category",
      path: ["mainCategoryId"],
    },
  );

interface CategoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CategoryDrawer({ open, onOpenChange }: CategoryDrawerProps) {
  const [view, setView] = useState<"list" | "form">("list");
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState<Partial<ProductCategory>>({
    name: "",
    type: "main",
  });
  const [errors, setErrors] = useState<{
    name?: string;
    mainCategoryId?: string;
  }>({});

  const { data, isLoading: isLoadingList } = useCategories({ search });
  const categories = data?.items ?? [];

  const { data: mainCategories = [], isLoading: isLoadingMainCats } =
    useCategoriesCombobox({ type: "main" });

  const { mutate: createCategory, isPending: isCreating } = useCreateCategory();
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory();

  const isPending = isCreating || isUpdating;

  const handleAddNew = () => {
    setFormData({ name: "", type: "main" });
    setErrors({});
    setView("form");
  };

  const handleEdit = (category: ProductCategory) => {
    setFormData({
      id: category.id,
      name: category.name,
      type: category.parent_id ? "sub" : "main",
      mainCategoryId: category.parent_id ?? undefined,
    });
    setErrors({});
    setView("form");
  };

  const handleBack = () => {
    setView("list");
    setErrors({});
  };

  const handleSave = () => {
    try {
      categorySchema.parse(formData);
      setErrors({});

      const payload = {
        name: formData.name!,
        parent_id: formData.type === "sub" ? formData.mainCategoryId : null,
      };

      if (formData.id) {
        updateCategory(
          { id: formData.id, ...payload },
          {
            onSuccess: () => setView("list"),
          },
        );
      } else {
        createCategory(payload, {
          onSuccess: () => setView("list"),
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: { name?: string; mainCategoryId?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0] === "name") newErrors.name = err.message;
          if (err.path[0] === "mainCategoryId")
            newErrors.mainCategoryId = err.message;
        });
        setErrors(newErrors);
      }
    }
  };

  const renderList = () => (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <DrawerHeader className="border-b border-border/40 px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <DrawerTitle className="text-base font-semibold tracking-tight text-foreground flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-primary" />
              Product Categories
            </DrawerTitle>
            <DrawerDescription className="text-xs text-muted-foreground">
              Manage your product categorization hierarchy
            </DrawerDescription>
          </div>
          <DrawerClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-muted/80"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </DrawerClose>
        </div>
      </DrawerHeader>

      <div className="p-4 space-y-3 flex-1 flex flex-col min-h-0">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/70" />
            <Input
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-sm border-muted-foreground/20 focus-visible:ring-primary/30 "
            />
          </div>
          <Button
            onClick={handleAddNew}
            size="sm"
            className="h-9 px-3 gap-1.5 text-xs font-medium"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        </div>

        <ScrollArea className="flex-1 -mx-1 px-1">
          <div className="space-y-1.5 pb-2">
            {isLoadingList ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin text-primary/40" />
                <p className="text-xs font-medium">Loading...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-border/60 rounded-lg bg-muted/5">
                <p className="text-xs text-muted-foreground mb-2">
                  No categories found
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddNew}
                  className="h-8 text-xs gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Create category
                </Button>
              </div>
            ) : (
              categories.map((category) => (
                <div
                  key={category.id}
                  className="group relative flex items-center justify-between p-3 border border-border/40 rounded-lg hover:border-primary/30 hover:bg-primary/[0.03] transition-all duration-200"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-foreground/90 truncate group-hover:text-primary transition-colors">
                        {category.name}
                      </h4>
                      <Badge
                        variant={category.parent_id ? "outline" : "secondary"}
                        className="h-4 px-1.5 text-[9px] font-bold uppercase tracking-wider rounded-sm"
                      >
                        {category.parent_id ? "SUB" : "MAIN"}
                      </Badge>
                    </div>
                    {category.parent_name && (
                      <p className="text-[10px] text-muted-foreground/70 truncate italic">
                        under {category.parent_name}
                      </p>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-50 group-hover:opacity-100 transition-all hover:bg-primary/10 hover:text-primary shrink-0"
                    onClick={() => handleEdit(category)}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );

  const renderForm = () => (
    <div className="flex flex-col h-full bg-background">
      <DrawerHeader className="border-b border-border/50 pb-4 px-6 pt-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="space-y-1">
            <DrawerTitle className="text-xl font-bold tracking-tight text-primary">
              {formData.id ? "Edit Category" : "Add New Category"}
            </DrawerTitle>
            <DrawerDescription className="text-sm text-muted-foreground">
              {formData.id
                ? "Modify existing category details."
                : "Fill in the details for the new category."}
            </DrawerDescription>
          </div>
        </div>
      </DrawerHeader>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            {/* Category Type */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Category Type
              </Label>
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
                <SelectTrigger className="h-10 text-sm border-muted-foreground/20 ">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">Main Category</SelectItem>
                  <SelectItem value="sub">Sub Category</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Parent Category (Sub only) */}
            {formData.type === "sub" && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Main Category
                </Label>
                <Combobox
                  options={mainCategories.map((cat) => ({
                    value: cat.id,
                    label: cat.name,
                  }))}
                  value={formData.mainCategoryId || ""}
                  onValueChange={(value) => {
                    setFormData({ ...formData, mainCategoryId: value });
                    if (errors.mainCategoryId)
                      setErrors({ ...errors, mainCategoryId: undefined });
                  }}
                  placeholder={
                    isLoadingMainCats ? "Loading..." : "Select parent category"
                  }
                  className={`h-10 border-muted-foreground/20 ${errors.mainCategoryId ? "border-destructive" : ""}`}
                />
                {errors.mainCategoryId && (
                  <p className="text-[11px] text-destructive font-medium">
                    {errors.mainCategoryId}
                  </p>
                )}
              </div>
            )}

            {/* Name */}
            <div className="space-y-2">
              <Label
                htmlFor="drawer-cat-name"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                Category Name
              </Label>
              <Input
                id="drawer-cat-name"
                placeholder="e.g. Fragrances, Bottles, etc."
                value={formData.name || ""}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                className={`h-10 border-muted-foreground/20 focus-visible:ring-primary ${errors.name ? "border-destructive" : ""}`}
                disabled={isPending}
                autoFocus
              />
              {errors.name && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.name}
                </p>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>

      <DrawerFooter className="border-t border-border/50 pt-4 pb-8 px-6 bg-muted/5">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex-1 h-11 font-semibold uppercase tracking-wider text-xs"
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 h-11 font-semibold uppercase tracking-wider text-xs shadow-lg shadow-primary/20"
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending
              ? "Saving..."
              : formData.id
                ? "Save Changes"
                : "Create Category"}
          </Button>
        </div>
      </DrawerFooter>
    </div>
  );

  return (
    <Drawer
      open={open}
      onOpenChange={(o) => {
        if (!isPending) onOpenChange(o);
      }}
      direction="right"
    >
      <DrawerContent className="overflow-hidden h-full">
        {view === "list" ? renderList() : renderForm()}
      </DrawerContent>
    </Drawer>
  );
}
