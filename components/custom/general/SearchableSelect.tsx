"use client"

import { Field } from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"

interface SearchableSelectProps<T> {
  items: T[]
  itemToStringValue: (item: T) => string
  value: T | null
  onValueChange: (item: T | null) => void
  label?: string
  id?: string
  placeholder?: string
  disabled?: boolean
  error?: string
  emptyMessage?: string
  renderItem?: (item: T) => React.ReactNode
  className?: string
}

export default function SearchableSelect<T extends { id?: string }>({
  items,
  itemToStringValue,
  value,
  onValueChange,
  label,
  id,
  placeholder,
  disabled,
  error,
  emptyMessage = "No results found.",
  renderItem,
  className,
}: SearchableSelectProps<T>) {
  return (
    <Field className={`flex flex-col gap-2${className ? ` ${className}` : ""}`}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <Combobox
        items={items}
        itemToStringValue={itemToStringValue}
        value={(value !== null ? itemToStringValue(value) : "") as any}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <ComboboxInput
          id={id}
          placeholder={placeholder}
          showClear
          disabled={disabled}
          aria-invalid={!!error}
          className="dark:border dark:border-neutral-600"
        />
        <ComboboxContent>
          <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
          <ComboboxList>
            {(item: T) => (
              <ComboboxItem key={item?.id ?? String(item)} value={item}>
                {renderItem ? renderItem(item) : itemToStringValue(item)}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      {error && <span className="text-sm text-red-500">{error}</span>}
    </Field>
  )
}