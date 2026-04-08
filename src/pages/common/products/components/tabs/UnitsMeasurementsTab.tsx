import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scale } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

interface UnitsMeasurementsTabProps {
  form: UseFormReturn<any>;
  disabled?: boolean;
}

export const UnitsMeasurementsTab = ({
  form,
  disabled,
}: UnitsMeasurementsTabProps) => {
  const watchUnitCategory = form.watch("unit_category");
  const watchBaseUnit = form.watch("base_unit");
  const watchProductType = form.watch("product_type");

  return (
    <div className="space-y-4 p-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-start">
        <FormField
          control={form.control}
          name="base_unit"
          render={({ field }) => (
            <FormItem className="space-y-2 lg:col-span-1">
              <FormLabel className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                Base Unit
              </FormLabel>
              <Select
                onValueChange={(v) => {
                  field.onChange(v);
                  const category =
                    v === "kg" || v === "g"
                      ? "weight"
                      : v === "ltr" || v === "ml"
                        ? "volume"
                        : "count";
                  form.setValue("unit_category", category);
                }}
                value={field.value || "pcs"}
              >
                <FormControl>
                  <SelectTrigger className="text-sm h-9">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="kg" className="text-xs">
                    Kilogram (kg)
                  </SelectItem>
                  <SelectItem value="g" className="text-xs">
                    Gram (g)
                  </SelectItem>
                  <SelectItem value="ltr" className="text-xs">
                    Liter (ltr)
                  </SelectItem>
                  <SelectItem value="ml" className="text-xs">
                    Milliliter (ml)
                  </SelectItem>
                  <SelectItem value="pcs" className="text-xs">
                    Pieces (pcs)
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="unit_category"
          render={({ field }) => (
            <FormItem className="space-y-2 lg:col-span-1">
              <FormLabel className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                Unit Category
              </FormLabel>
              <Select value={field.value || "count"} disabled>
                <FormControl>
                  <SelectTrigger className="text-sm bg-muted/50 cursor-not-allowed">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="weight" className="text-xs">
                    Weight
                  </SelectItem>
                  <SelectItem value="volume" className="text-xs">
                    Volume
                  </SelectItem>
                  <SelectItem value="count" className="text-xs">
                    Count (Pieces)
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )}
        />

        {watchUnitCategory === "weight" && (
          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem className="lg:col-span-1 space-y-2">
                <FormLabel className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                  Weight{" "}
                  {watchBaseUnit !== "kg" && watchBaseUnit !== "g"
                    ? `(${watchBaseUnit || ""})`
                    : ""}
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    className="text-sm"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? null : Number(e.target.value),
                      )
                    }
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />
        )}

        {watchProductType !== "RAW_MATERIAL" && (
          <div className="lg:col-span-3 space-y-2">
            <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
              Dimensions (L × W × H)
            </Label>
            <div className="flex items-center gap-2">
              <FormField
                control={form.control}
                name="length"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="L"
                        className="text-sm"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? null
                              : Number(e.target.value),
                          )
                        }
                        value={field.value ?? ""}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <span className="text-muted-foreground text-sm">×</span>
              <FormField
                control={form.control}
                name="width"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="W"
                        className="text-sm"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? null
                              : Number(e.target.value),
                          )
                        }
                        value={field.value ?? ""}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <span className="text-muted-foreground text-sm">×</span>
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="H"
                        className="text-sm"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? null
                              : Number(e.target.value),
                          )
                        }
                        value={field.value ?? ""}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dimension_unit"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || "cm"}
                    >
                      <FormControl>
                        <SelectTrigger className="h-9 text-sm w-[90px]">
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="mm" className="text-xs">
                          mm
                        </SelectItem>
                        <SelectItem value="cm" className="text-xs">
                          cm
                        </SelectItem>
                        <SelectItem value="m" className="text-xs">
                          m
                        </SelectItem>
                        <SelectItem value="in" className="text-xs">
                          in
                        </SelectItem>
                        <SelectItem value="ft" className="text-xs">
                          ft
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="size_value"
              render={({ field }) => (
                <FormItem className="space-y-2 mt-2">
                  <FormLabel className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                    Size Value
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      placeholder="e.g. 500"
                      className="text-sm"
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? null : Number(e.target.value),
                        )
                      }
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
};
