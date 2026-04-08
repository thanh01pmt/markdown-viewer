// src/react-ui/components/common/EditableCombobox.tsx

"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "../../../utils/utils";
import { Button } from "../elements/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../elements/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../elements/popover";

export interface ComboboxOption {
  value: string;
  label: string;
}

interface EditableComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  noResultsMessage?: string;
  disabled?: boolean;
}

export const EditableCombobox: React.FC<EditableComboboxProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  noResultsMessage = "No results found.",
  disabled = false,
}) => {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  // Sync inputValue with the display label when the popover opens or value changes
  React.useEffect(() => {
    if (value) {
      const selectedOption = options.find((option) => option.value.toLowerCase() === value.toLowerCase());
      setInputValue(selectedOption ? selectedOption.label : value);
    } else {
      setInputValue("");
    }
  }, [value, options, open]);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setOpen(false);
  };

  // When the popover closes, if the user typed something that doesn't match any option's label,
  // we treat it as a new value.
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      const match = options.find(option => option.label.toLowerCase() === inputValue.toLowerCase());
      if (!match && inputValue !== (options.find(opt => opt.value === value)?.label || value)) {
        onChange(inputValue);
      }
    }
    setOpen(isOpen);
  };

  const displayLabel = options.find((option) => option.value.toLowerCase() === value?.toLowerCase())?.label || value;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
          disabled={disabled}
        >
          <span className="truncate">
            {value ? displayLabel : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput 
            placeholder={searchPlaceholder} 
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty>{noResultsMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => handleSelect(option.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
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
  );
};