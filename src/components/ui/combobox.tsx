import * as React from "react";
import { Check, ChevronsUpDown, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  clearable?: boolean;
  disabled?: boolean;
  searchValue?: string;
  onSearchChange?: (search: string) => void;
  selectedLabel?: string;
  creatable?: boolean;
}

const Combobox = React.forwardRef<HTMLButtonElement, ComboboxProps>(
  (
    {
      options,
      value,
      onValueChange,
      placeholder = "Select option…",
      searchPlaceholder = "Search…",
      emptyText = "No results found.",
      className,
      clearable = false,
      disabled = false,
      searchValue,
      onSearchChange,
      selectedLabel: propSelectedLabel,
      creatable = false,
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);
    const labelCache = React.useRef<Record<string, string>>({});

    React.useEffect(() => {
      options.forEach((o) => {
        if (o.value && o.label) {
          labelCache.current[o.value] = o.label;
        }
      });
    }, [options]);

    const selectedLabel =
      options.find((o) => o.value === value)?.label ??
      (value ? labelCache.current[value] : undefined) ??
      propSelectedLabel;

    const handleSelect = (selectedValue: string) => {
      onValueChange(selectedValue === value ? "" : selectedValue);
      setOpen(false);
      if (onSearchChange) {
        onSearchChange("");
      }
    };

    const handleClear = (e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      onValueChange("");
    };

    const handleCreate = (newVal: string) => {
      if (!newVal) return;
      onValueChange(newVal);
      setOpen(false);
      onSearchChange?.("");
    };

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            onKeyDown={(e) => {
              if (e.key === "Backspace") {
                handleClear();
              }
            }}
            className={cn(
              "flex h-8 w-full items-center justify-between rounded-sm border border-input/60 bg-background px-2.5 py-1.5 text-sm font-normal shadow-sm transition-colors duration-150",
              "hover:border-input/80 hover:bg-background",
              "focus-visible:border-primary focus-visible:ring-0",
              "disabled:cursor-not-allowed disabled:opacity-50",
              !selectedLabel && "text-muted-foreground",
              className,
            )}
          >
            <span className="truncate">{selectedLabel ?? placeholder}</span>
            <div className="flex items-center gap-1 shrink-0 ml-2">
              {clearable && value && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={handleClear}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    handleClear(e as unknown as React.MouseEvent)
                  }
                  className="h-4 w-4 rounded-sm hover:bg-muted flex items-center justify-center cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3 w-3" />
                </span>
              )}
              <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] min-w-[180px] p-0 rounded-sm border border-input/60 shadow-md"
          align="start"
          sideOffset={4}
        >
          <Command shouldFilter={!onSearchChange}>
            <CommandInput
              placeholder={searchPlaceholder}
              className="h-8 text-sm"
              value={searchValue}
              onValueChange={onSearchChange}
              onKeyDown={(e) => {
                if (creatable && searchValue) {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    const exactMatch = options.find(
                      (o) =>
                        o.label.toLowerCase() === searchValue.toLowerCase(),
                    );
                    if (exactMatch) {
                      handleSelect(exactMatch.value);
                    } else {
                      handleCreate(searchValue);
                    }
                  }
                }
              }}
            />
            <CommandList>
              {(!creatable || !searchValue) && (
                <CommandEmpty className="py-4 text-center text-sm text-muted-foreground">
                  {emptyText}
                </CommandEmpty>
              )}
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    keywords={[option.label]}
                    onSelect={() => handleSelect(option.value)}
                    className="flex items-center gap-2 rounded-sm text-sm cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "h-4 w-4 text-primary shrink-0",
                        value === option.value ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  },
);

Combobox.displayName = "Combobox";

export { Combobox };
