"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SalesFilter } from "@/schemas/analytics-schema"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { type DateRange } from "react-day-picker"

type Preset = SalesFilter["preset"]

const PRESETS: { value: Preset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "last7days", label: "Last 7 Days" },
  { value: "last30days", label: "Last 30 Days" },
  { value: "thisMonth", label: "This Month" },
  { value: "thisYear", label: "This Year" },
]

interface SalesDateFilterProps {
  filter: SalesFilter
  onFilterChange: (filter: SalesFilter) => void
}

export default function SalesDateFilter({
  filter,
  onFilterChange,
}: SalesDateFilterProps) {
  const isCustom = filter.preset === "custom"

  const handlePresetClick = (preset: Preset) => {
    onFilterChange({ ...filter, preset, dateFrom: undefined, dateTo: undefined })
  }

  const handleCustomDateSelect = (range: DateRange | undefined) => {
    onFilterChange({
      ...filter,
      preset: "custom",
      dateFrom: range?.from ? format(range.from, "yyyy-MM-dd") : undefined,
      dateTo: range?.to ? format(range.to, "yyyy-MM-dd") : undefined,
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5">
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
              {isCustom && filter.dateFrom
                ? filter.dateTo
                  ? `${format(new Date(filter.dateFrom), "dd MMM")} – ${format(new Date(filter.dateTo), "dd MMM")}`
                  : format(new Date(filter.dateFrom), "dd MMM yyyy")
                : "Custom"}
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

      <div className="h-6 w-px bg-border" />

      <Select
        value={filter.comparison}
        onValueChange={(value) =>
          onFilterChange({
            ...filter,
            comparison: value as SalesFilter["comparison"],
          })
        }
      >
        <SelectTrigger className="w-[180px] h-8 text-xs">
          <SelectValue placeholder="Compare with" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="previousPeriod">vs Previous Period</SelectItem>
          <SelectItem value="previousMonth">vs Previous Month</SelectItem>
          <SelectItem value="previousYear">vs Previous Year</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
