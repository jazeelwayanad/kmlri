"use client"

import * as React from "react"
import { format, parseISO, isValid } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface DatePickerProps {
  date?: string | Date
  onDateChange?: (dateStr: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  className,
  disabled = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const dateValue = typeof date === "string" && date ? parseISO(date) : date instanceof Date ? date : undefined
  const isValidDate = dateValue && isValid(dateValue)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal bg-white text-xs h-9",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
          {isValidDate ? format(dateValue, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4 bg-white" align="start">
        <div className="space-y-3">
          <label className="text-xs font-semibold text-gray-700">Select Date</label>
          <Input
            type="date"
            value={isValidDate ? format(dateValue, "yyyy-MM-dd") : ""}
            onChange={(e) => {
              if (onDateChange) {
                onDateChange(e.target.value)
              }
              setOpen(false)
            }}
            className="text-xs bg-white"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
