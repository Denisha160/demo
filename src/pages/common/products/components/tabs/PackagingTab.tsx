import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { PackageCheck, Plus } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

interface PackagingTabProps {
  form: UseFormReturn<any>;
  comboboxes: {
    package: {
      options: { label: string; value: string }[];
      search: string;
      setSearch: (v: string) => void;
    };
  };
  packageModal: { setOpen: (v: boolean) => void };
}

export const PackagingTab = ({ form, comboboxes, packageModal }: PackagingTabProps) => {
  const watchProductType = form.watch("product_type");

  if (watchProductType === "RAW_MATERIAL") {
    return (
      <div className="p-8 text-center text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
        Packaging settings are only available for Finished Goods and Semi Finished items.
      </div>
    );
  }

  return (
    <div className="space-y-4 p-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <FormField
          control={form.control}
          name="packaging_id"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                Packaging Type
              </FormLabel>
              <FormControl>
                <Combobox
                  options={comboboxes.package.options}
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  placeholder="Select format..."
                  searchPlaceholder="Search package..."
                  emptyText="No packages found."
                  className="h-10"
                  clearable
                  searchValue={comboboxes.package.search}
                  onSearchChange={comboboxes.package.setSearch}
                />
              </FormControl>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[10px] text-primary hover:text-primary hover:bg-primary/5 gap-1"
                onClick={() => packageModal.setOpen(true)}
              >
                <Plus className="h-3 w-3" /> Add New Package
              </Button>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="shape"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                Shape/Form
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Round"
                  className="text-sm h-10"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="material"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                Material
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Glass"
                  className="text-sm h-10"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="capacity"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                Capacity
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. 500ml"
                  className="text-sm h-10"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
