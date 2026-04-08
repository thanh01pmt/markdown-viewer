// packages/interactive-quiz-kit/src/react-ui/components/common/MultiSelectPopover.tsx
"use client";

import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../elements/popover";
import { Button } from "../elements/button";
import { Badge } from "../elements/badge";
import { Checkbox } from "../elements/checkbox";
import { Label } from "../elements/label";
import { Separator } from "../elements/separator";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../elements/command";
import { ChevronsUpDown, XIcon } from "lucide-react";
import { cn } from "../../../utils/utils";

export type ComboboxOption = {
  value: string;
  label: string;
};

interface MultiSelectPopoverProps {
  options: ComboboxOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  title?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function MultiSelectPopover({
  options,
  selected,
  onChange,
  title,
  placeholder = "Select...",
  disabled = false,
  className,
}: MultiSelectPopoverProps) {
  const [open, setOpen] = React.useState(false); 

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
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn("w-full h-auto min-h-[38px] justify-between", className)}
          disabled={disabled}
        >
          <div className="flex gap-1 flex-wrap">
            {selectedOptions.length > 0 ? (
              selectedOptions.map((option) => (
                <Badge
                  variant="secondary"
                  key={option.value}
                  className="mr-1"
                >
                  {option.label}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground font-normal">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0 z-[1000]" align="start">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => handleToggle(option.value)}
                  className="flex items-center"
                >
                   <Checkbox
                    id={`checkbox-${option.value}`}
                    className="mr-2"
                    checked={selected.includes(option.value)}
                  />
                  <Label htmlFor={`checkbox-${option.value}`} className="w-full cursor-pointer">{option.label}</Label>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}