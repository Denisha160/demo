import * as React from "react";
import { Check, ChevronsUpDown, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    onOptionsChange?: (options: ComboboxOption[]) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    className?: string;
    /** If true, a clear ("×") button appears when a value is selected */
    clearable?: boolean;
    disabled?: boolean;
    searchValue?: string;
    onSearchChange?: (search: string) => void;
}

const ComboboxWithAdd = React.forwardRef<HTMLDivElement, ComboboxProps>(
    (
        {
            options,
            value,
            onValueChange,
            onOptionsChange,
            placeholder = "Select option…",
            searchPlaceholder = "Search…",
            emptyText = "No results found.",
            className,
            clearable = false,
            disabled = false,
            searchValue,
            onSearchChange,
        },
        ref
    ) => {
        const [open, setOpen] = React.useState(false);
        const [isAdding, setIsAdding] = React.useState(false);
        const [newValue, setNewValue] = React.useState("");

        const selectedLabel = options.find((o) => o.value === value)?.label || value;

        const handleSelect = (selectedValue: string) => {
            onValueChange(selectedValue === value ? "" : selectedValue);
            setOpen(false);
        };

        const handleClear = (e: React.MouseEvent) => {
            e.stopPropagation();
            onValueChange("");
        };

        const saveNewValue = () => {
            const val = newValue.trim();
            if (val) {
                if (!options.some(o => o.label.toLowerCase() === val.toLowerCase())) {
                    const newOption = { value: val, label: val };
                    onOptionsChange?.([...options, newOption]);
                }
                onValueChange(val);
            }
            setIsAdding(false);
            setNewValue("");
        };

        if (isAdding) {
            return (
                <div ref={ref} className="flex gap-1.5 h-9 w-full min-w-0">
                    <Input
                        autoFocus
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        placeholder={`Enter new ${placeholder?.replace('Select ', '').toLowerCase() || 'item'}`}
                        className={cn("h-9 flex-1 min-w-0 text-xs", className)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                saveNewValue();
                            } else if (e.key === 'Escape') {
                                setIsAdding(false);
                                setNewValue("");
                            }
                        }}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={saveNewValue}
                        className="h-9 w-9 shrink-0 rounded-sm border-border/60 text-muted-foreground hover:text-foreground"
                    >
                        <Check className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                            setIsAdding(false);
                            setNewValue("");
                        }}
                        className="h-9 w-9 shrink-0 rounded-sm border-border/60 text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            );
        }

        return (
            <div ref={ref} className="flex gap-1.5 h-9 w-full min-w-0">
                <div className="flex-1 w-full min-w-0 flex">
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                disabled={disabled}
                                className={cn(
                                    "flex h-9 w-full items-center justify-between rounded-sm border border-input/60 bg-background px-2.5 py-1.5 text-xs font-normal shadow-sm transition-colors duration-150",
                                    "hover:border-input/80 hover:bg-background",
                                    "focus-visible:border-primary focus-visible:ring-0",
                                    "disabled:cursor-not-allowed disabled:opacity-50",
                                    !selectedLabel && "text-muted-foreground",
                                    className
                                )}
                            >
                                <span className="truncate">{selectedLabel ?? placeholder}</span>
                                <div className="flex items-center gap-1 shrink-0 ml-2">
                                    {clearable && value && (
                                        <span
                                            role="button"
                                            tabIndex={0}
                                            onClick={handleClear}
                                            onKeyDown={(e) => e.key === "Enter" && handleClear(e as unknown as React.MouseEvent)}
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
                            <Command>
                                <CommandInput
                                    placeholder={searchPlaceholder}
                                    className="h-9 text-xs"
                                    value={searchValue}
                                    onValueChange={onSearchChange}
                                />
                                <CommandList>
                                    <CommandEmpty className="py-4 text-center text-xs text-muted-foreground">
                                        {emptyText}
                                    </CommandEmpty>
                                    <CommandGroup>
                                        {options.map((option) => (
                                            <CommandItem
                                                key={option.value}
                                                value={option.label}
                                                onSelect={() => handleSelect(option.value)}
                                                className="flex items-center gap-2 rounded-sm text-xs cursor-pointer"
                                            >
                                                <Check
                                                    className={cn(
                                                        "h-4 w-4 text-primary shrink-0",
                                                        value === option.value ? "opacity-100" : "opacity-0"
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
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setIsAdding(true)}
                    className="h-9 w-9 shrink-0 rounded-sm border-border/60 text-muted-foreground hover:text-foreground"
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
        );
    }
);

ComboboxWithAdd.displayName = "ComboboxWithAdd";

export { ComboboxWithAdd };
