import { ButtonGroup } from "@/components/ui/button-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DropDownOptions } from "@/types/table-types";

interface Props {
  id?:string;
  columnValue?:string
  orderValue?: string
  sortColumnOptions: DropDownOptions[];
  onSorterChange: (value: string, name: string) => void;
}

export default function SortDropDown(props: Props) {

  const SortOrder: DropDownOptions[] = [
    { name: "ASC", value: "asc"},
    { name: "DESC", value: "desc"}
  ]

  return (
    <ButtonGroup 
      id={props.id} 
      className="flex flex-row items-center justify-center w-full">

      <Select
        onValueChange={(value) => props.onSorterChange(value, "sortColumn")}
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
        onValueChange={(value) => props.onSorterChange(value, "sortOrder")}
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
