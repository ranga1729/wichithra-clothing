import { CirclePlus, RotateCcw } from "lucide-react"
import { Button } from "./ui/button"
import { en } from "@/lib/i18n/en"

interface Props {
  onClick: () => void
}

const AddNewButton = (props: Props) => {
  return (
    <Button 
    size={"default"} 
    type="button" 
    onClick={props.onClick}
    className="
      bg-koa-blue
      hover:bg-koa-blue-hover
      dark:text-neutral-100
    "
    > 
      <CirclePlus />{en.add_new}
    </Button>
  )
}

export default AddNewButton;