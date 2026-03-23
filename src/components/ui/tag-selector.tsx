import React, { useState, useRef } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";

export interface Tag {
  id?: string;
  name: string;
}

interface TagSelectorProps {
  suggestions: { id: string; name: string }[];
  value: Tag[];
  onChange: (tags: Tag[]) => void;
}

export function TagSelector({ suggestions, value = [], onChange }: TagSelectorProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUnselect = (tag: Tag) => {
    onChange(value.filter((t) => t.name !== tag.name));
  };

  const handleSelect = (tag: Tag) => {
    if (!value.find((t) => t.name === tag.name)) {
      onChange([...value, tag]);
    }
    setInputValue("");
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      const existing = suggestions.find((s) => s.name.toLowerCase() === inputValue.trim().toLowerCase());
      if (existing) {
        handleSelect(existing);
      } else {
        handleSelect({ name: inputValue.trim() });
      }
    }
  };

  const filteredSuggestions = suggestions.filter(
    (s) => !value.find((v) => v.name === s.name) && s.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <div className="flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-sm border border-input/60 bg-background px-3 py-1 text-xs shadow-sm focus-within:ring-1 focus-within:ring-primary">
          {value.map((tag) => (
            <Badge key={tag.name} variant="secondary" className="hover:bg-secondary/80 rounded-sm px-1.5 py-0 font-normal">
              {tag.name}
              <button
                type="button"
                className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleUnselect(tag);
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={() => handleUnselect(tag)}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </Badge>
          ))}
          <Input
            ref={inputRef}
            type="text"
            className="h-6 min-w-[80px] flex-1 border-0 bg-transparent p-0 text-xs shadow-none focus-visible:ring-0"
            placeholder={value.length === 0 ? "Select or enter tags..." : ""}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setOpen(true);
            }}
            onKeyDown={handleKeyDown}
            onClick={() => setOpen(true)}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {filteredSuggestions.length > 0 && (
          <Command>
            <CommandList>
              <CommandGroup>
                {filteredSuggestions.map((suggestion) => (
                  <CommandItem
                    key={suggestion.id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onSelect={() => handleSelect(suggestion)}
                    className="text-xs cursor-pointer"
                  >
                    {suggestion.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  );
}
