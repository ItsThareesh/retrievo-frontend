"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// Pass the grouped data here
export function Combobox({ groups =[], value, onChange }: any) {
  const [open, setOpen] = React.useState(false)

  // Helper to find the label for the selected value (across all groups)
  const selectedLabel = React.useMemo(() => {
    for (const group of groups) {
      const found = group.items.find((item: any) => item.value === value)
      if (found) return found.label
    }
    return "Select location..."
  }, [value, groups])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between py-0"
        >
          {selectedLabel}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search location..." />
          <CommandList>
            <CommandEmpty>No location found.</CommandEmpty>
            
            {/* --- LOOP THROUGH GROUPS --- */}
            {groups.map((group: any) => (
              <CommandGroup key={group.category} heading={group.category}>
                
                {/* --- LOOP THROUGH ITEMS INSIDE GROUP --- */}
                {group.items.map((item: any) => (
                  <CommandItem
                    key={item.value}
                    value={item.value}
                    onSelect={(currentValue) => {
                      onChange(currentValue === value ? "" : currentValue)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === item.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {item.label}
                  </CommandItem>
                ))}
                
              </CommandGroup>
            ))}
            
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}