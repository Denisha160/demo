import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Combobox } from "@/components/ui/combobox";
import { IndianRupee } from "lucide-react";

export type SelectOption = { label: string; value: string };

export const EditableDetailItem = ({
  label,
  value,
  isEditing,
  onChange,
  type = "text",
  options = [],
  prefix,
  error,
  resolvedLabel,
}: {
  label: string;
  value: string | number | undefined | null;
  isEditing: boolean;
  onChange: (val: string) => void;
  type?: "text" | "number" | "date" | "select" | "textarea" | "combobox";
  options?: SelectOption[];
  prefix?: string;
  error?: string;
  resolvedLabel?: string;
}) => {
  const displayValue = () => {
    if (!value) return "—";
    if (type === "select" && options.length > 0) {
      return options.find((o) => o.value === value)?.label || resolvedLabel || value;
    }
    if (type === "combobox" && (options.length > 0 || resolvedLabel)) {
      return options.find((o) => o.value === value)?.label || resolvedLabel || value;
    }
    return prefix ? `${prefix} ${value}` : value;
  };

  const isMoneyInput = type === "number" && prefix === "₹";

  return (
    <div className="space-y-2 min-w-0">
      <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold block truncate">
        {label}
      </span>
      {isEditing ? (
        <div className="space-y-1">
          {type === "textarea" ? (
            <textarea
              value={(value as string) || ""}
              onChange={(e) => onChange(e.target.value)}
              className={`w-full min-h-[80px] px-3 py-2 text-sm border bg-background rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${error ? "border-destructive" : "border-input"}`}
            />
          ) : type === "date" ? (
            <div className={error ? "[&_button]:border-destructive" : ""}>
              <DatePicker
                value={(value as string) || ""}
                onChange={(v) => onChange(v || "")}
              />
            </div>
          ) : type === "select" ? (
            <Select value={(value as string) || ""} onValueChange={onChange}>
              <SelectTrigger
                className={`h-8 text-xs rounded-sm ${error ? "border-destructive border" : ""}`}
              >
                <SelectValue placeholder={`Select ${label}`} />
              </SelectTrigger>
              <SelectContent>
                {options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : type === "combobox" ? (
            <Combobox
              options={options}
              value={(value as string) || ""}
              onValueChange={onChange}
              placeholder={`Select ${label}`}
              className={error ? "border-destructive border h-8" : "h-8"}
              selectedLabel={resolvedLabel}
              clearable
            />
          ) : (
            <div className="relative">
              {isMoneyInput ? (
                <>
                  <div className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none">
                    <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <Input
                    type="number"
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    className={`h-8 text-xs rounded-sm pl-7 ${error ? "border-destructive" : ""}`}
                    placeholder={`Enter ${label}`}
                  />
                </>
              ) : prefix ? (
                <>
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    {prefix}
                  </span>
                  <Input
                    type={type === "number" ? "number" : "text"}
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    className={`h-8 text-xs rounded-sm pl-8 ${error ? "border-destructive" : ""}`}
                    placeholder={`Enter ${label}`}
                  />
                </>
              ) : (
                <Input
                  type={type === "number" ? "number" : "text"}
                  value={value || ""}
                  onChange={(e) => onChange(e.target.value)}
                  className={`h-8 text-xs rounded-sm ${error ? "border-destructive" : ""}`}
                  placeholder={`Enter ${label}`}
                />
              )}
            </div>
          )}
          {error && <p className="text-xs text-destructive mt-1">{error}</p>}
        </div>
      ) : type === "textarea" ? (
        <p className="text-xs font-semibold leading-relaxed text-foreground/80">
          {value || "—"}
        </p>
      ) : (
        <p className="text-sm font-semibold text-foreground truncate">
          {displayValue()}
        </p>
      )}
    </div>
  );
};
