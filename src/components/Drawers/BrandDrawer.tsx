import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  X,
  Search,
  Loader2,
  ArrowLeft,
  Edit2,
  Bookmark,
} from "lucide-react";
import {
  useBrandList,
  useCreateBrand,
  useUpdateBrand,
} from "@/hooks/useBrands";
import { Brand } from "@/types/brand";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const brandSchema = z.object({
  name: z
    .string()
    .min(2, "Brand name must be at least 2 characters")
    .max(100, "Brand name cannot exceed 100 characters"),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .nullable(),
  is_active: z.boolean().default(true),
});

interface BrandDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BrandDrawer({ open, onOpenChange }: BrandDrawerProps) {
  const [view, setView] = useState<"list" | "form">("list");
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState<Partial<Brand>>({
    name: "",
    description: "",
    is_active: true,
  });
  const [errors, setErrors] = useState<{ name?: string; description?: string }>(
    {},
  );

  const { data, isLoading: isLoadingList } = useBrandList({ search });
  const brands = data?.items ?? [];

  const { mutate: createBrand, isPending: isCreating } = useCreateBrand();
  const { mutate: updateBrand, isPending: isUpdating } = useUpdateBrand();

  const isPending = isCreating || isUpdating;

  const handleAddNew = () => {
    setFormData({ name: "", description: "", is_active: true });
    setErrors({});
    setView("form");
  };

  const handleEdit = (brand: Brand) => {
    setFormData(brand);
    setErrors({});
    setView("form");
  };

  const handleBack = () => {
    setView("list");
    setErrors({});
  };

  const handleSave = () => {
    try {
      brandSchema.parse(formData);
      setErrors({});

      const payload = {
        name: formData.name!,
        description: formData.description || null,
        is_active: formData.is_active ?? true,
      };

      if (formData.id) {
        updateBrand(
          { id: formData.id, ...payload },
          {
            onSuccess: () => setView("list"),
          },
        );
      } else {
        createBrand(payload, {
          onSuccess: () => setView("list"),
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: { name?: string; description?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0] === "name") newErrors.name = err.message;
          if (err.path[0] === "description")
            newErrors.description = err.message;
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
              <Bookmark className="h-4 w-4 text-primary" />
              Brands
            </DrawerTitle>
            <DrawerDescription className="text-xs text-muted-foreground">
              Manage your product brands
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
              placeholder="Search brands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-sm border-muted-foreground/20 focus-visible:ring-primary/30"
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
            ) : brands.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-border/60 rounded-lg bg-muted/5">
                <p className="text-xs text-muted-foreground mb-2">
                  No brands found
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddNew}
                  className="h-8 text-xs gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Create brand
                </Button>
              </div>
            ) : (
              brands.map((brand) => (
                <div
                  key={brand.id}
                  className="group relative flex items-center justify-between p-3 border border-border/40 rounded-lg hover:border-primary/30 hover:bg-primary/[0.03] transition-all duration-200"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-foreground/90 truncate group-hover:text-primary transition-colors">
                        {brand.name}
                      </h4>
                      <Badge
                        variant={brand.is_active ? "secondary" : "outline"}
                        className={`h-4 px-1.5 text-[9px] font-bold uppercase tracking-wider rounded-sm ${brand.is_active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "text-muted-foreground"}`}
                      >
                        {brand.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    {brand.description && (
                      <p className="text-[10px] text-muted-foreground/70 truncate italic">
                        {brand.description}
                      </p>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-50 group-hover:opacity-100 transition-all hover:bg-primary/10 hover:text-primary shrink-0"
                    onClick={() => handleEdit(brand)}
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
              {formData.id ? "Edit Brand" : "Add New Brand"}
            </DrawerTitle>
            <DrawerDescription className="text-sm text-muted-foreground">
              {formData.id
                ? "Modify existing brand details."
                : "Fill in the details for the new brand."}
            </DrawerDescription>
          </div>
        </div>
      </DrawerHeader>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            {/* Brand Name */}
            <div className="space-y-2">
              <Label
                htmlFor="drawer-brand-name"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                Brand Name
              </Label>
              <Input
                id="drawer-brand-name"
                placeholder="e.g. Nike, Apple, etc."
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

            {/* Description */}
            <div className="space-y-2">
              <Label
                htmlFor="drawer-brand-desc"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                Description
              </Label>
              <Textarea
                id="drawer-brand-desc"
                placeholder="Optional description of the brand..."
                value={formData.description || ""}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  if (errors.description)
                    setErrors({ ...errors, description: undefined });
                }}
                className={`text-sm border-muted-foreground/20 focus-visible:ring-primary min-h-[100px] ${errors.description ? "border-destructive" : ""}`}
                disabled={isPending}
              />
              {errors.description && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Status Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/5">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Active Status</Label>
                <p className="text-[10px] text-muted-foreground">
                  Toggle to enable or disable this brand
                </p>
              </div>
              <Switch
                checked={formData.is_active ?? true}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
                disabled={isPending}
              />
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
                : "Create Brand"}
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
