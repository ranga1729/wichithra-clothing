import { en } from "@/lib/i18n/en";
import { Button } from "./ui/button";

interface Props {
  onClick: () => void,
  disabled: boolean,
}

const CancelButton = (props: Props) => {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={props.onClick}
      disabled={props.disabled}
      className="
        bg-red-600 text-neutral-100 hover:bg-red-700 hover:text-neutral-100
        dark:bg-red-600 dark:text-neutral-100 dark:hover:bg-red-700 dark:hover:hover:text-neutral-100
      "
    >
      {en.cancel}
    </Button>
  )
}

export default CancelButton;