import { RotateCcw } from "lucide-react"
import { Button } from "./ui/button"
import { en } from "@/lib/i18n/en"

interface Props {
  onClick: () => void
}

const ResetFilterButton = (props: Props) => {
  return (
    <Button 
    size={"default"} 
    type="button" 
    onClick={props.onClick}
    className="
      text-neutral-100
      bg-neutral-500
      hover:bg-neutral-600
      border border-neutral-600

      dark:text-neutral-100
      dark:bg-neutral-600
      dark:hover:bg-neutral-700
      dark:border dark:border-neutral-400
    "
    > 
      <RotateCcw /> {en.reset_filters} 
    </Button>
  )
}

export default ResetFilterButton;