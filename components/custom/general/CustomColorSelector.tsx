"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEffect } from "react";

export interface CustomColorSelectOptions {
  id: string;
  name: string;
  hexCode: string;
}

interface Props {
  placeholder: string;
  optionsObject?: CustomColorSelectOptions[];
  value?: string;
  ariaInvalid?: string;
  onValueChange: (value: string) => void;
  id?: string;
}

export default function CustomColorSelector({
  placeholder,
  optionsObject = [], 
  value,
  ariaInvalid,
  onValueChange,
  id
}: Props) {
  const validOptions = React.useMemo(() => {
    return (optionsObject || []).filter(option => option && option.id);
  }, [optionsObject]);

  return (
    <Select onValueChange={onValueChange} value={value}>
      <SelectTrigger 
        id={id} 
        className={ariaInvalid === "true" ? "border-red-500 w-full" : "w-full"}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {validOptions.length > 0 ? (
            validOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                <span className="flex items-center gap-2">
                    <span 
                      className="h-3 w-3 shrink-0 rounded-full border" 
                      style={{ backgroundColor: "#" + option.hexCode }} 
                    />
                   {option.name}
                </span>
              </SelectItem>
            ))
          ) : (
            <div className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none text-muted-foreground">
              No valid colors found
            </div>
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}