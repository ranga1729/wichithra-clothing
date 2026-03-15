import { en } from "@/lib/i18n/en"
import { Button } from "./ui/button"
interface Props {
  disabled: boolean,
  onClick: () => void,
}

const RemoveButton = (props: Props) => {
  return (
    <Button
      type="button"
      variant="default"
      size="sm"
      className="absolute top-2 right-2 bg-red-600"
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {en.remove}
    </Button>
  )
}

export default RemoveButton;