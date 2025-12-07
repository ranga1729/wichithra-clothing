import * as React from "react"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Props {
  placeholder: string;
  options: Options[];
  value?: string;
  ariaInvalid?: string;
  onValueChange: (value: string) => void;
}

interface Options {
  name: string, value: string
}

export default function CustomSelect(props: Props) {
  return (
    <Select
      onValueChange={props.onValueChange}
      value={props.value}
    >
      <SelectTrigger className={props.ariaInvalid === "true" ? "border-red-500 w-full" : "w-full"} >
        <SelectValue placeholder={props.placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {props.options && props.options.map((option) => {
            return <SelectItem key={option.value} value={option.value}> {option.name} </SelectItem>
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
