// packages/interactive-quiz-kit/src/react-ui/components/common/MultiSelectDropdown.tsx
"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../elements/dropdown-menu";
import { Button } from "../elements/button";
import { Badge } from "../elements/badge";
import { ChevronsUpDown, XIcon } from "lucide-react";
import { cn } from "../../../utils/utils";
import { ScrollArea } from "../elements/scroll-area";

export type ComboboxOption = {
  value: string;
  label: string;
};

interface MultiSelectDropdownProps {
  options: ComboboxOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function MultiSelectDropdown({
  options,
  selected,
  onChange,
  placeholder = "Select...",
  className,
  disabled = false,
}: MultiSelectDropdownProps) {
  const handleToggle = (value: string) => {
    const isSelected = selected.includes(value);
    if (isSelected) {
      onChange(selected.filter((item) => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const selectedOptions = options.filter(option => selected.includes(option.value));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn("w-full h-auto min-h-[40px] justify-between font-normal", className)}
          disabled={disabled}
        >
          <div className="flex gap-1 flex-wrap items-center">
            {selectedOptions.length > 0 ? (
              selectedOptions.map((option) => (
                <Badge
                  variant="secondary"
                  key={option.value}
                  className="mr-1"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent opening the dropdown
                    handleToggle(option.value);
                  }}
                >
                  {option.label}
                  <XIcon className="ml-1 h-3 w-3" />
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-[--radix-dropdown-menu-trigger-width]" 
        align="start"
        // This is the key fix to prevent the parent Dialog from stealing focus
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenuLabel>Select Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="max-h-60">
            {options.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={selected.includes(option.value)}
                onCheckedChange={() => handleToggle(option.value)}
                // This is the key fix to allow multiple selections without closing
                onSelect={(e) => e.preventDefault()}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
        </ScrollArea>
        {selected.length > 0 && (
            <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onSelect={() => onChange([])}
                    className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                >
                    Clear all
                </DropdownMenuItem>
            </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}