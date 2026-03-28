import * as React from "react"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface CustomSelectOptions {
  name: string;
  value: string;
}

export interface DBRowArray {
  id: string;
  name: string;
  slug: string;
}

interface Props {
  placeholder: string;
  optionsObject?: CustomSelectOptions[];
  DBRowsObject?: DBRowArray[];
  value?: string;
  ariaInvalid?: string;
  onValueChange: (value: string) => void;
  id?: string;
}

export default function CustomSelect(props: Props) {
  return (
    <Select onValueChange={props.onValueChange} value={props.value}>
      <SelectTrigger 
        id={props.id} 
        className={props.ariaInvalid === "true" ? "border-red-500 w-full" : "w-full"}
      >
        <SelectValue placeholder={props.placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {props.optionsObject?.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.name}
            </SelectItem>
          ))}

          {props.DBRowsObject?.map((row) => (
            <SelectItem key={row.id} value={row.slug}>
              {row.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}