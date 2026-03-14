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
      bg-sky-600
      hover:bg-sky-700
      dark:text-neutral-100
    "
    > 
      <RotateCcw /> {en.reset_filters} 
    </Button>
  )
}

export default ResetFilterButton;