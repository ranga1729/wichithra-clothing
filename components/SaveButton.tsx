import { en } from "@/lib/i18n/en"
import { Button } from "./ui/button"
import { LoaderCircle } from "lucide-react"

interface Props {
  isPending : boolean,
  disabled?: boolean,
}

const SaveButton = (props: Props) => {
  return (
    <Button 
      type="submit" 
      disabled={props.isPending || props.disabled} 
      className="
        bg-green-600 hover:bg-green-700 hover:text-neutral-100
        dark:bg-green-600 dark:hover:bg-green-700 dark:text-neutral-100 dark:hover:text-neutral-100
      "
    >
      {props.isPending ? <>
        <LoaderCircle className="animate-spin w-8 h-8" /> {en.saving}
      </> : <>{en.save}</> }
    </Button>
  )
}

export default SaveButton;