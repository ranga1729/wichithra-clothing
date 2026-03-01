import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import { en } from "@/lib/i18n/en"

interface Props {
  isActive?: boolean
}

const IsActiveToggler = (props: Props) => {

  const toggleActiveStatus = () => {
    console.log("toggle active status")
  }
  
  return <FieldLabel htmlFor="switch-active">
    <Field orientation="horizontal" className="has-data-[state=checked]:bg-green-400/5 has-data-[state=checked]:border-green-500 dark:has-data-[state=checked]:bg-green-500/10 h-full">
    <FieldContent>
      <FieldTitle> {en.input_labels.isActive} </FieldTitle>
      <FieldDescription>
        {en.input_labels.isActive_description}
      </FieldDescription>
    </FieldContent>
    <Switch 
      id="switch-active" 
      checked={props.isActive}
      onCheckedChange={toggleActiveStatus}
      className="data-[state=checked]:bg-green-500"
    />
    </Field>
  </FieldLabel>
}

export default IsActiveToggler;