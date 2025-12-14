import { ButtonGroup } from "@/components/ui/button-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Props {
  columnValue?:string
  orderValue?: string
  onColumnChange: (value: string) => void;
  onOrderChange: (value: string) => void;
  sortColumnOptions: SortDropDownOptions[];
  id?:string;
}

export interface SortDropDownOptions {
  name: string, value: string
}

export default function SortDropDown(props: Props) {

  const SortOrder: SortDropDownOptions[] = [
    { name: "ASC", value: "asc"},
    { name: "DESC", value: "desc"}
  ]

  return (
    <ButtonGroup 
      id={props.id} 
      className="flex flex-row items-center justify-center w-full">

      <Select
        onValueChange={props.onColumnChange}
        value={props.columnValue}
      >
        <SelectTrigger className="w-full flex-2">
          <SelectValue placeholder="Column"/>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {props.sortColumnOptions && props.sortColumnOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}> {option.name} </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select
        onValueChange={props.onOrderChange}
        value={props.orderValue}
      >
        <SelectTrigger className="w-full flex-1">
          <SelectValue placeholder="Order"/>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {SortOrder.map((option) => (
              <SelectItem key={option.value} value={option.value}> {option.name} </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

    </ButtonGroup>
  )
}
