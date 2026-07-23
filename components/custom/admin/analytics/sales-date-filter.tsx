"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SalesFilter } from "@/schemas/analytics-schema"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { type DateRange } from "react-day-picker"

type Preset = SalesFilter["preset"]

const PRESETS: { value: Preset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last7days", label: "Last 7 Days" },
  { value: "last30days", label: "Last 30 Days" },
  { value: "thisMonth", label: "This Month" },
  { value: "thisYear", label: "This Year" },
]

interface SalesDateFilterProps {
  filter: SalesFilter
  onFilterChange: (filter: SalesFilter) => void
}

export default function SalesDateFilter({ filter, onFilterChange }: SalesDateFilterProps) {
  const handlePresetClick = (preset: Preset) => {
    onFilterChange({ preset, dateFrom: undefined, dateTo: undefined })
  }

  const handleCustomDateSelect = (range: DateRange | undefined) => {
    onFilterChange({
      preset: "custom",
      dateFrom: range?.from ? format(range.from, "yyyy-MM-dd") : undefined,
      dateTo: range?.to ? format(range.to, "yyyy-MM-dd") : undefined,
    })
  }

  const isCustom = filter.preset === "custom"

  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRESETS.map((preset) => (
        <Button
          key={preset.value}
          variant={filter.preset === preset.value && !isCustom ? "default" : "outline"}
          size="sm"
          onClick={() => handlePresetClick(preset.value)}
        >
          {preset.label}
        </Button>
      ))}

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={isCustom ? "default" : "outline"}
            size="sm"
          >
            <CalendarIcon className="size-3.5" />
            {isCustom && filter.dateFrom ? (
              filter.dateTo ? (
                `${format(new Date(filter.dateFrom), "dd MMM")} – ${format(new Date(filter.dateTo), "dd MMM")}`
              ) : (
                format(new Date(filter.dateFrom), "dd MMM yyyy")
              )
            ) : (
              "Custom Range"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={filter.dateFrom ? new Date(filter.dateFrom) : undefined}
            selected={
              filter.dateFrom && filter.dateTo
                ? { from: new Date(filter.dateFrom), to: new Date(filter.dateTo) }
                : undefined
            }
            onSelect={handleCustomDateSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
